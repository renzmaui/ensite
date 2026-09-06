import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChangeEvent, CSSProperties } from "react";

import {
  Check,
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Radio,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { setlist } from "./songs";

import type {
  TimedLine,
  TranscriptLine,
  TranscriptSegment,
} from "./songs/types";

type YouTubePlayerEvent = {
  data: number;
};

type YouTubePlayer = {
  destroy?: () => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById?: (videoId: string) => void;
  muteVideo?: () => void;
  unMuteVideo?: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: YouTubePlayerEvent) => void;
          };
        },
      ) => YouTubePlayer;

      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        CUED: number;
      };
    };

    onYouTubeIframeAPIReady?: () => void;
  }
}

const FALLBACK_DURATION = 212;
const INITIAL_VIDEO_ID = "MT-4Bk1Lw8g";

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function App() {
  const [videoId, setVideoId] = useState(INITIAL_VIDEO_ID);

  const [selectedId, setSelectedId] = useState(setlist[0].id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION);
  const [apiReady, setApiReady] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const playerHostRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const timerRef = useRef<number | null>(null);

  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  const autoplayRef = useRef(false);

  const playerCreatedRef = useRef(false);

  const loadedVideoRef = useRef<string | null>(null);

  const selectedTrack = useMemo(
    () => setlist.find((track) => track.id === selectedId) ?? setlist[0],
    [selectedId],
  );

  /*
   * Match only fanchants whose actual words appear
   * inside a lyric.
   *
   * Standalone fanchants, such as:
   * EN! HA! I! PEUN
   * member names
   *
   * remain standalone and therefore stay GREEN.
   */
  const fanchantData = useMemo(() => {
    const assignments = new Map<number, TimedLine[]>();

    const assigned = new Set<TimedLine>();

    selectedTrack.fanchant.forEach((chant) => {
      const chantText = normalizeText(chant.text);

      let bestIndex = -1;
      let bestDistance = Infinity;

      selectedTrack.lyrics.forEach((lyric, index) => {
        const lyricText = normalizeText(lyric.text);

        if (!lyricText.includes(chantText)) {
          return;
        }

        const distance = Math.abs(chant.time - lyric.time);

        if (distance < bestDistance && distance <= 3) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      if (bestIndex !== -1) {
        const existing = assignments.get(bestIndex) ?? [];

        existing.push(chant);
        assignments.set(bestIndex, existing);

        assigned.add(chant);
      }
    });

    return {
      assignments,
      assigned,
    };
  }, [selectedTrack]);

  /*
   * Build lyrics + fanchant portions.
   */
  const transcriptLines = useMemo<TranscriptLine[]>(() => {
    const lyricLines: TranscriptLine[] = selectedTrack.lyrics.map(
      (line, lyricIndex) => {
        const chants = fanchantData.assignments.get(lyricIndex) ?? [];

        if (!chants.length) {
          return {
            ...line,
            source: "LYRIC",
            tone: "lyric",
            lyricIndex,
            hasFanchant: false,
            segments: [
              {
                text: line.text,
                tone: "lyric",
              },
            ],
          };
        }

        const matches = chants
          .map((chant) => {
            const start = line.text
              .toLowerCase()
              .indexOf(chant.text.toLowerCase());

            if (start === -1) {
              return null;
            }

            return {
              chant,
              start,
              end: start + chant.text.length,
            };
          })
          .filter(
            (
              item,
            ): item is {
              chant: TimedLine;
              start: number;
              end: number;
            } => item !== null,
          )
          .sort((a, b) => a.start - b.start);

        if (!matches.length) {
          return {
            ...line,
            source: "LYRIC",
            tone: "lyric",
            lyricIndex,
            hasFanchant: false,
            segments: [
              {
                text: line.text,
                tone: "lyric",
              },
            ],
          };
        }

        const segments: TranscriptSegment[] = [];

        let cursor = 0;

        matches.forEach((match) => {
          if (match.start < cursor) {
            return;
          }

          if (match.start > cursor) {
            segments.push({
              text: line.text.slice(cursor, match.start),
              tone: "lyric",
            });
          }

          segments.push({
            text: line.text.slice(match.start, match.end),
            tone: "chant",
            chantTime: match.chant.time,
          });

          cursor = match.end;
        });

        if (cursor < line.text.length) {
          segments.push({
            text: line.text.slice(cursor),
            tone: "lyric",
          });
        }

        return {
          ...line,
          source: "LYRIC",
          tone: "singalong",
          lyricIndex,
          hasFanchant: true,
          segments,
        };
      },
    );

    const standalone = selectedTrack.fanchant
      .filter((chant) => !fanchantData.assigned.has(chant))
      .map((chant) => ({
        ...chant,
        source: "FANCHANT" as const,
        tone: "chant" as const,
        segments: [
          {
            text: chant.text,
            tone: "chant" as const,
            chantTime: chant.time,
          },
        ],
      }));

    return [...lyricLines, ...standalone].sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }

      if (a.source === "LYRIC" && b.source === "FANCHANT") {
        return -1;
      }

      return 1;
    });
  }, [selectedTrack, fanchantData]);

  /*
   * The current ROW is based only on
   * the line's timestamp.
   */
  const activeCueTime = useMemo(() => {
    let active = -1;

    transcriptLines.forEach((line) => {
      if (line.time <= playbackSeconds) {
        active = line.time;
      }
    });

    return active;
  }, [transcriptLines, playbackSeconds]);

  const progress =
    duration > 0 ? Math.min(100, (playbackSeconds / duration) * 100) : 0;

  /*
   * YouTube API.
   */
  useEffect(() => {
    let cancelled = false;

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    const interval = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(interval);

        if (!cancelled) {
          setApiReady(true);
        }
      }
    }, 100);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);

      if (!window.YT?.Player && !cancelled) {
        setApiFailed(true);
      }
    }, 8000);

    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previous?.();

      if (!cancelled) {
        window.clearTimeout(timeout);
        setApiReady(true);
      }
    };

    if (!existing && !window.YT?.Player) {
      const script = document.createElement("script");

      script.src = "https://www.youtube.com/iframe_api";

      script.async = true;

      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;

      window.clearTimeout(timeout);
      window.clearInterval(interval);

      window.onYouTubeIframeAPIReady = previous;
    };
  }, []);

  /*
   * Create player once.
   */
  useEffect(() => {
    if (
      !apiReady ||
      !window.YT?.Player ||
      !playerHostRef.current ||
      playerCreatedRef.current
    ) {
      return;
    }

    playerCreatedRef.current = true;

    const player = new window.YT.Player(playerHostRef.current, {
      videoId,

      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },

      events: {
        onReady: () => {
          playerRef.current = player;

          loadedVideoRef.current = videoId;

          const d = player.getDuration?.();

          if (d && d > 0) {
            setDuration(d);
          }

          setPlaybackSeconds(0);

          if (autoplayRef.current) {
            autoplayRef.current = false;

            player.playVideo?.();
          }
        },

        onStateChange: (event) => {
          const state = window.YT?.PlayerState;

          if (event.data === state?.PLAYING) {
            setIsPlaying(true);
          }

          if (event.data === state?.PAUSED || event.data === state?.ENDED) {
            setIsPlaying(false);
          }

          if (event.data === state?.ENDED) {
            setPlaybackSeconds(player.getDuration?.() ?? FALLBACK_DURATION);
          }
        },
      },
    });

    playerRef.current = player;
  }, [apiReady]);

  /*
   * Load selected video.
   */
  useEffect(() => {
    if (!apiReady || !playerRef.current) {
      return;
    }

    if (loadedVideoRef.current === videoId) {
      return;
    }

    loadedVideoRef.current = videoId;

    setPlaybackSeconds(0);
    setDuration(FALLBACK_DURATION);

    playerRef.current.loadVideoById?.(videoId);
  }, [apiReady, videoId]);

  /*
   * Playback clock.
   */
  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);

      timerRef.current = null;
    }

    if (!isPlaying) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const current = player.getCurrentTime?.() ?? 0;

      const currentDuration = player.getDuration?.() ?? duration;

      setPlaybackSeconds(current);

      if (currentDuration > 0) {
        setDuration(currentDuration);
      }
    }, 100);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);

        timerRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  /*
   * Scroll current row into view.
   */
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeCueTime, selectedId]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []);

  const chooseTrack = (track: (typeof setlist)[number]) => {
    setSelectedId(track.id);
    setPlaybackSeconds(0);
    setDuration(FALLBACK_DURATION);
    setVideoId(track.videoId);

    if (playerRef.current && apiReady) {
      loadedVideoRef.current = track.videoId;

      playerRef.current.loadVideoById?.(track.videoId);

      playerRef.current.playVideo?.();
    } else {
      autoplayRef.current = true;
      setIsPlaying(false);
    }
  };

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      setIsPlaying((value) => !value);

      return;
    }

    if (isPlaying) {
      player.pauseVideo?.();
    } else {
      player.playVideo?.();
    }
  }, [isPlaying]);

  const seekTo = useCallback(
    (seconds: number) => {
      const safe = Math.max(
        0,
        Math.min(seconds, duration || FALLBACK_DURATION),
      );

      setPlaybackSeconds(safe);

      playerRef.current?.seekTo?.(safe, true);
    },
    [duration],
  );

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(event.target.value));
  };

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current?.unMuteVideo?.();
    } else {
      playerRef.current?.muteVideo?.();
    }

    setIsMuted((value) => !value);
  };

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div className="brand-lockup">
          <div className="brand-mark">VL</div>

          <span className="brand-name">Video Lyrics Studio</span>

          <span className="brand-kicker">live setlist companion</span>
        </div>

        <div className="topbar-status">
          <span className="status-dot" />
          room ready / {apiReady ? "player synced" : "demo clock"}
        </div>

        <button
          className="share-button"
          onClick={copySessionLink}
          type="button"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}

          {copied ? "Copied" : "Share room"}
        </button>
      </header>

      <main className="app-main">
        <section className="room-heading">
          <div>
            <div className="eyebrow">ENHYPEN / fanchant</div>

            <h1>
              Let our voices reach <em>ENHYPEN.</em>
            </h1>
          </div>

          <div className="heading-note">
            <span className="heading-rule" />

            <p>
              Fanchants made easy for every ENGENE.
              <br />
              Learn It. Chant It. Make It LOUD.
            </p>
          </div>
        </section>

        <section className="legend-strip">
          <span className="legend-title">quick guide</span>

          <span className="legend-item">
            <i className="legend-swatch lyric-swatch" />
            black / lyrics
          </span>

          <span className="legend-item">
            <i className="legend-swatch highlight-swatch" />
            red / current lyric
          </span>

          <span className="legend-item">
            <i className="legend-swatch chant-swatch" />
            green / fanchant
          </span>

          <span className="legend-item">
            <i className="legend-swatch sing-swatch" />
            orange / sing-along
          </span>

          <span className="legend-track">
            <ListMusic size={13} />
            {setlist.length} songs in this playlist
          </span>
        </section>

        <section className="workspace">
          <aside className="setlist-panel">
            <div className="panel-cap">
              <span className="eyebrow">ENGENE PLAYLIST</span>

              <span className="set-count">{setlist.length} tracks</span>
            </div>

            <h2 className="setlist-title">
              Lock
              <br />
              <span>in.</span>
            </h2>

            <p className="setlist-intro">
              Select a song and get ready to sing along.
            </p>

            <div className="setlist-sections">
              <section className="set-section">
                <div className="section-heading">
                  SONGS
                  <i />
                </div>

                <div className="set-rows">
                  {setlist.map((track) => (
                    <button
                      className={
                        selectedId === track.id ? "set-row selected" : "set-row"
                      }
                      key={track.id}
                      onClick={() => chooseTrack(track)}
                      type="button"
                    >
                      <span className="set-number">
                        {String(track.number).padStart(2, "0")}
                      </span>

                      <span className="set-song">{track.title}</span>

                      <span className="set-duration">{track.duration}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <div className="performance-column">
            <article className="stage-card">
              <div className="video-wrap">
                <div className="player-frame" ref={playerHostRef} />

                {!apiReady && (
                  <iframe
                    title={selectedTrack.title}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {!apiReady && !apiFailed && (
                  <div className="video-loading">connecting to the stage</div>
                )}

                {apiFailed && !apiReady && (
                  <div className="video-loading">
                    YouTube player unavailable
                  </div>
                )}

                <div className="video-overlay-label">
                  <span className="video-signal">
                    <Radio size={11} />
                  </span>

                  {apiReady ? "youtube / live sync" : "youtube / demo sync"}
                </div>

                <div className="video-track-stamp">
                  <span>{String(selectedTrack.number).padStart(2, "0")}</span>

                  {selectedTrack.title}
                </div>
              </div>

              <div className="stage-controls">
                <div className="progress-track">
                  <span className="timestamp">
                    {formatTime(playbackSeconds)}
                  </span>

                  <input
                    aria-label="Seek performance"
                    className="progress-range"
                    max={duration}
                    min="0"
                    onChange={handleProgressChange}
                    style={
                      {
                        "--progress": `${progress}%`,
                      } as CSSProperties
                    }
                    type="range"
                    value={Math.min(playbackSeconds, duration)}
                  />

                  <span className="timestamp">{formatTime(duration)}</span>
                </div>

                <div className="control-row">
                  <div className="control-left">
                    <button
                      aria-label={
                        isPlaying ? "Pause performance" : "Play performance"
                      }
                      className="play-button"
                      onClick={togglePlayback}
                      type="button"
                    >
                      {isPlaying ? (
                        <Pause size={17} fill="currentColor" />
                      ) : (
                        <Play size={17} fill="currentColor" />
                      )}
                    </button>

                    <div>
                      <div className="control-label">
                        {isPlaying ? "Playing live" : "Ready to replay"}
                      </div>

                      <div className="control-meta">
                        {apiReady ? "YouTube sync" : "demo clock fallback"}
                      </div>
                    </div>
                  </div>

                  <div className="control-right">
                    <span className="control-meta">
                      {apiFailed && !apiReady
                        ? "API unavailable"
                        : "sample performance"}
                    </span>

                    <button
                      aria-label={isMuted ? "Unmute" : "Mute"}
                      className="icon-button"
                      onClick={toggleMute}
                      type="button"
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>

                    <button
                      aria-label="Expand player"
                      className="icon-button"
                      onClick={() =>
                        document
                          .querySelector(".video-wrap")
                          ?.requestFullscreen?.()
                      }
                      type="button"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="song-meta">
                <div className="track-info">
                  <span className="track-kicker">
                    NOW PLAYING / TRACK{" "}
                    {String(selectedTrack.number).padStart(2, "0")}
                  </span>

                  <h2 className="track-title">{selectedTrack.title}</h2>

                  <p className="track-artist">{selectedTrack.artist}</p>
                </div>

                <div className="track-tags">
                  <span className="tag tag-highlight">
                    {selectedTrack.type ?? "PERFORMANCE"}
                  </span>

                  <span className="tag">{selectedTrack.duration}</span>

                  <button
                    aria-label={
                      isLiked ? "Remove from saved rooms" : "Save this room"
                    }
                    className={
                      isLiked
                        ? "icon-button save-button saved"
                        : "icon-button save-button"
                    }
                    onClick={() => setIsLiked((value) => !value)}
                    type="button"
                  >
                    <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <aside className="lyrics-card">
            <div className="lyrics-head">
              <div className="lyrics-headline">
                <div>
                  <div className="eyebrow">
                    TRACK / {String(selectedTrack.number).padStart(2, "0")}
                  </div>

                  <h2 className="lyrics-title">Every word. Every chant. Right on cue.</h2>
                </div>

                <div className="sync-status">
                  <span className="live-dot" />

                  {apiReady ? "synced" : "demo sync"}
                </div>
              </div>

              <div className="transcript-track">
                {selectedTrack.title}

                <span>·</span>

                {selectedTrack.artist}
              </div>
            </div>

            <div className="lyric-scroll">
              {transcriptLines.map((line, index) => {
                const isActive = line.time === activeCueTime;

                const isStandaloneChant = line.source === "FANCHANT";

                return (
                  <button
                    className={
                      "lyric-line " +
                      (isStandaloneChant ? "tone-chant" : `tone-${line.tone}`) +
                      (isActive ? " active" : "")
                    }
                    key={`${selectedTrack.id}-${line.source}-${line.time}-${index}`}
                    onClick={() => seekTo(line.time)}
                    ref={isActive ? activeLineRef : undefined}
                    type="button"
                  >
                    <span className="line-content">
                      <span className="line-text">
                        {line.segments?.map((segment, segmentIndex) => {
                          if (segment.tone === "chant") {
                            const chantIsActive =
                              playbackSeconds >=
                              (segment.chantTime ?? line.time);

                            /*
                             * Standalone:
                             * ALWAYS GREEN.
                             *
                             * Sing-along:
                             * GREEN before cue.
                             * ORANGE after cue.
                             */
                            if (isStandaloneChant) {
                              return (
                                <span
                                  className="segment-chant standalone-chant"
                                  key={segmentIndex}
                                >
                                  {segment.text}
                                </span>
                              );
                            }

                            return (
                              <span
                                className={
                                  chantIsActive
                                    ? "segment-chant chant-active"
                                    : "segment-chant"
                                }
                                key={segmentIndex}
                              >
                                {segment.text}
                              </span>
                            );
                          }

                          return (
                            <span
                              className={
                                isActive
                                  ? "segment-lyric lyric-active"
                                  : "segment-lyric"
                              }
                              key={segmentIndex}
                            >
                              {segment.text}
                            </span>
                          );
                        })}
                      </span>

                      {line.note && (
                        <span className="line-note">{line.note}</span>
                      )}
                    </span>

                    <span className="line-pulse" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </main>

      {copied && <div className="toast-note">Room link copied</div>}
    </div>
  );
}

export default App;
