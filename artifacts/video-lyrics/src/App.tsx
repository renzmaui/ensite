import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  CSSProperties,
} from "react";

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

type LineTone = "singalong" | "chant" | "lyric";

type TimedLine = {
  time: number;
  text: string;
  note?: string;
  tone?: LineTone;
};

type TranscriptSegment = {
  text: string;
  tone: "lyric" | "chant";
  chantTime?: number;
};

type TranscriptLine = TimedLine & {
  source: "LYRIC" | "FANCHANT";
  lyricIndex?: number;
  hasFanchant?: boolean;
  segments?: TranscriptSegment[];
};

type Track = {
  id: string;
  number: number;
  title: string;
  artist: string;
  featuredArtist?: string;
  type?: string;
  section: string;
  duration: string;
  videoId: string;
  lyrics: TimedLine[];
  fanchant: TimedLine[];
};

type YouTubePlayerEvent = {
  data: number;
};

type YouTubePlayer = {
  destroy?: () => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (
    seconds: number,
    allowSeekAhead: boolean,
  ) => void;
  loadVideoById?: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
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
            onStateChange?: (
              event: YouTubePlayerEvent,
            ) => void;
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

const lines = (
  texts: Array<
    [number, string, string?, LineTone?]
  >,
): TimedLine[] => {
  return texts.map(
    ([time, text, note, tone]) => ({
      time,
      text,
      note,
      tone,
    }),
  );
};

const setlist: Track[] = [
  {
    id: "BLOODY PARADISE",
    number: 1,
    title: "BLOODY PARADISE",
    artist: "ENHYPEN",
    type: "OFFICIAL MUSIC VIDEO",
    section: "SONGS",
    duration: "2:14",
    videoId: "MT-4Bk1Lw8g",

    lyrics: lines([
      [7, "We're going M.I.A oh"],
      [9, "Dalbichi jeo wiro"],
      [11, "They fell like dominoes"],
      [13, "Piro muldeun georiro"],
      [15, "I know that we're okay oh"],
      [17, "Sonjapgo eodiro"],
      [19, "Deo isang gomin eopseo"],
      [21, "Red fever comin' up"],
      [22, "We're going M.I.A"],

      [
        24,
        "Ah, ppalgake pi mudeun suit and tie, drive",
      ],
      [
        29,
        "Heart is reckless, gingin daero wiro balba",
      ],
      [
        33,
        "Love is spinnin' when you're by my side",
      ],
      [
        35,
        "Tteugeopge, watch me take off and fly",
      ],

      [
        38,
        "You wanna? Come touch me, party-arty",
      ],
      [40, "Hae tteul ttaekkaji uri"],
      [42, "Come touch me, party-arty"],
      [44, "In our bloody paradise"],

      [46, "Come touch me, party-arty"],
      [48, "Hae tteul ttaekkaji uri"],
      [50, "Come touch me, party-arty"],
      [52, "In our bloody paradise"],

      [53, "Like ooh, FLY YA YA YA YA"],
      [55, "Ooh, FLY YA YA YA YA"],
      [57, "Ooh, FLY YA YA YA YA"],
      [59, "Do your dance like that"],

      [60, "We're going M.I.A, oh"],
      [63, "Eumageun heureugo"],
      [65, "We felt like dominoes"],
      [67, "Ne modeun geol gajigo"],
      [69, "I bameul gieokae, oh"],
      [71, "Siganeun heureugo"],
      [72, "Sarangeun permanent"],
      [74, "The sun is comin' up"],
      [76, "We're going M.I.A"],

      [
        78,
        "Ah, ppalgake pi mudeun suit and tie, drive",
      ],
      [
        83,
        "Heart is reckless, gingin daero wiro balba",
      ],
      [
        86,
        "Love is spinnin' when you're by my side",
      ],
      [
        89,
        "Tteugeopge, watch me take off and fly",
      ],

      [
        92,
        "You wanna? Come touch me, party-arty",
      ],
      [94, "Hae tteul ttaekkaji uri"],
      [96, "Come touch me, party-arty"],
      [97, "In our bloody paradise"],

      [100, "Come touch me, party-arty"],
      [102, "Hae tteul ttaekkaji uri"],
      [103, "Come touch me, party-arty"],
      [105, "In our bloody paradise"],

      [107, "Like ooh, FLY YA YA YA YA"],
      [109, "Ooh, FLY YA YA YA YA"],
      [111, "Ooh, FLY YA YA YA YA"],
      [113, "Do your dance like that"],

      [
        114,
        "Woah-ooh, FLY YA YA YA YA",
      ],
      [116, "Ooh, FLY YA YA YA YA"],
      [118, "Ooh, FLY YA YA YA YA"],
      [120, "Do your dance like that"],

      [121, "Shh, can't control it"],
      [123, "Shh, it's a moment"],
      [125, "Shh, can't control it"],
      [128, "Shh"],
    ]),

    fanchant: lines([
      [5, "EN! HA! I! PEUN"],
      [22, "We're going M.I.A"],
      [35, "Tteugeopge, watch me take"],
      [44, "In our bloody paradise"],
      [52, "In our bloody paradise"],
      [54, "FLY YA YA YA YA"],
      [56, "FLY YA YA YA YA"],
      [58, "FLY YA YA YA YA"],
      [76, "We're going M.I.A"],
      [89, "Tteugeopge, watch me take"],
      [97, "In our bloody paradise"],
      [105, "In our bloody paradise"],
      [108, "FLY YA YA YA YA"],
      [110, "FLY YA YA YA YA"],
      [112, "FLY YA YA YA YA"],
      [115, "FLY YA YA YA YA"],
      [117, "FLY YA YA YA YA"],
      [119, "FLY YA YA YA YA"],
      [121, "YANG JUNGWON, PARK JONGSEONG"],
      [123, "SIM JAEYUN, PARK SUNGHOON"],
      [125, "KIM SUNOO, NI-KI"],
      [128, "EN! HA! I! PEUN"],
    ]),
  },

  {
    id: "XO",
    number: 2,
    title: "XO (Only If You Say Yes)",
    artist: "ENHYPEN",
    type: "WEVERSE CON FESTIVAL 2026",
    section: "SONGS",
    duration: "2:43",
    videoId: "Scufsa1FB2Q",

    lyrics: lines([
      [20, "XO XO"],
      [25, "KISS ME"],
      [27, "DON'T SAY NO"],
      [30, "NEW LYRICS"],
    ]),

    fanchant: lines([
      [28, "EN! HA! I! PEUN"],
      [30, "NEW FANCHANT"],
    ]),
  },

  {
    id: "STEALER",
    number: 3,
    title: "STEALER",
    artist: "ENHYPEN",
    type: "BLOOD SAGA in SEOUL",
    section: "SONGS",
    duration: "3:03",
    videoId: "tWM5t3_v8KA",

    lyrics: lines([
      [
        0,
        "The room is bright enough to see you",
        "opening",
      ],
      [
        24,
        "Every little voice becomes a choir",
        "verse",
      ],
      [
        55,
        "Keep the home light burning",
        "chorus",
      ],
      [
        94,
        "We will carry what we came here for",
        "chorus",
      ],
      [
        133,
        "If you get lost, look for the windows",
        "bridge",
      ],
      [
        176,
        "Keep the home light burning",
        "final chorus",
      ],
      [
        220,
        "Goodnight, goodnight, goodnight",
        "close",
      ],
    ]),

    fanchant: lines([
      [0, "HEY! HEY!", "opening"],
      [55, "HOME LIGHT!", "response"],
      [94, "CARRY IT HOME!", "all fans"],
      [
        133,
        "LOOK FOR THE WINDOWS!",
        "call",
      ],
      [
        176,
        "HOME LIGHT!",
        "final response",
      ],
      [220, "GOODNIGHT!", "close"],
    ]),
  },
];

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds),
  );

  const minutes = Math.floor(
    safeSeconds / 60,
  );

  const remainder = safeSeconds % 60;

  return (
    String(minutes) +
    ":" +
    String(remainder).padStart(2, "0")
  );
}

/*
 * MAIN APP COMPONENT
 *
 * This MUST be called App because the file
 * exports "default App" at the bottom.
 */
function App() {
  const [videoId, setVideoId] =
    useState<string>(INITIAL_VIDEO_ID);

  const [selectedId, setSelectedId] =
    useState(setlist[0].id);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [playbackSeconds, setPlaybackSeconds] =
    useState(0);

  const [duration, setDuration] =
    useState(FALLBACK_DURATION);

  const [apiReady, setApiReady] =
    useState(false);

  const [apiFailed, setApiFailed] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [isLiked, setIsLiked] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const playerHostRef =
    useRef<HTMLDivElement>(null);

  const playerRef =
    useRef<YouTubePlayer | null>(null);

  const fallbackTimerRef =
    useRef<number | null>(null);

  const activeLineRef =
    useRef<HTMLButtonElement | null>(null);

  const autoplayTrackRef =
    useRef(false);

  const initialPlayerCreatedRef =
    useRef(false);

  const lastLoadedVideoIdRef =
    useRef<string | null>(null);

  const selectedTrack = useMemo(() => {
    const found = setlist.find(
      (track) => track.id === selectedId,
    );

    return found ?? setlist[0];
  }, [selectedId]);

  /*
   * Find lyric/fanchant overlaps by TIME.
   *
   * If a fanchant happens within 2 seconds
   * of a lyric, they are treated as ONE
   * sing-along cue.
   *
   * The words do NOT need to match.
   */
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  const fanchantData = useMemo(() => {
    const assignments = new Map<number, TimedLine[]>();
    const assignedFanchants = new Set<TimedLine>();

    selectedTrack.fanchant.forEach((chant) => {
      const normalizedChant = normalizeText(chant.text);

      let bestLyricIndex = -1;
      let bestDistance = Infinity;

      selectedTrack.lyrics.forEach((lyric, lyricIndex) => {
        const normalizedLyric = normalizeText(lyric.text);

        /*
         * Only attach the fanchant when its actual words
         * exist inside the lyric.
         *
         * This prevents:
         *
         * 121 YANG JUNGWON... -> being attached to "Shh"
         * 123 SIM JAEYUN...   -> being attached to "Shh"
         * etc.
         */
        if (!normalizedLyric.includes(normalizedChant)) {
          return;
        }

        const distance = Math.abs(chant.time - lyric.time);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestLyricIndex = lyricIndex;
        }
      });

      /*
       * Only attach a matching fanchant if it is reasonably
       * close to the lyric cue.
       */
      if (bestLyricIndex !== -1 && bestDistance <= 3) {
        const existing = assignments.get(bestLyricIndex) ?? [];

        existing.push(chant);
        assignments.set(bestLyricIndex, existing);

        assignedFanchants.add(chant);
      }
    });

    return {
      assignments,
      assignedFanchants,
    };
  }, [selectedTrack]);

  const getLyricParts = (
    lyric: TimedLine,
    fanchant?: TimedLine,
  ) => {
    if (!fanchant) {
      return {
        before: lyric.text,
        chant: "",
        after: "",
      };
    }

    const lyricText = lyric.text;
    const chantText = fanchant.text;

    /*
      Exact match:
      The entire lyric is the fanchant.

      Example:
      LYRIC:    We're going M.I.A
      FANCHANT: We're going M.I.A
    */
    if (
      lyricText.trim().toLowerCase() ===
      chantText.trim().toLowerCase()
    ) {
      return {
        before: "",
        chant: lyricText,
        after: "",
      };
    }

    /*
      Partial match:
      Find the fanchant words inside the lyric.

      Example:

      LYRIC:
      Tteugeopge, watch me take off and fly

      FANCHANT:
      Tteugeopge, watch me take

      Result:

      before: ""
      chant:  "Tteugeopge, watch me take"
      after:  " off and fly"
    */

    const lyricLower =
      lyricText.toLowerCase();

    const chantLower =
      chantText.toLowerCase();

    const startIndex =
      lyricLower.indexOf(chantLower);

    if (startIndex === -1) {
      /*
        If the fanchant text isn't actually
        inside the lyric, don't merge it.
      */
      return {
        before: lyricText,
        chant: "",
        after: "",
      };
    }

    const endIndex =
      startIndex + chantText.length;

    return {
      before: lyricText.slice(
        0,
        startIndex,
      ),
      chant: lyricText.slice(
        startIndex,
        endIndex,
      ),
      after: lyricText.slice(endIndex),
    };
  };
  /*
   * Build the visible transcript.
   *
   * LYRIC + FANCHANT at the same time:
   *     ORANGE / SING-ALONG
   *
   * LYRIC by itself:
   *     BLACK / LYRIC
   *
   * FANCHANT by itself:
   *     GREEN / FANCHANT
   */
  
  const transcriptLines = useMemo<TranscriptLine[]>(() => {
    const lyricLines = selectedTrack.lyrics.map(
      (line: TimedLine, lyricIndex: number) => {
        const attachedFanchants =
          fanchantData.assignments.get(lyricIndex) ?? [];

        /*
         * If there is no matching fanchant, this is simply
         * a normal lyric.
         */
        if (attachedFanchants.length === 0) {
          return {
            ...line,
            tone: "lyric" as const,
            source: "LYRIC" as const,
            lyricIndex,
            hasFanchant: false,
            segments: [
              {
                text: line.text,
                tone: "lyric" as const,
              },
            ],
          };
        }

        /*
         * Build the lyric from pieces.
         *
         * Example:
         *
         * Tteugeopge, watch me take | off and fly
         *
         * The first part is the fanchant.
         * The second part remains the normal lyric.
         */
        const matches = attachedFanchants
          .map((chant) => {
            const lyricText = line.text;
            const chantText = chant.text;

            const lyricIndexInText = normalizeText(lyricText).indexOf(
              normalizeText(chantText),
            );

            if (lyricIndexInText === -1) {
              return null;
            }

            /*
             * Find the actual character position in the original
             * lyric text, preserving capitalization and punctuation.
             */
            const lowerLyric = lyricText.toLowerCase();
            const lowerChant = chantText.toLowerCase();

            const originalStart = lowerLyric.indexOf(lowerChant);

            if (originalStart === -1) {
              return null;
            }

            return {
              chant,
              start: originalStart,
              end: originalStart + chantText.length,
            };
          })
          .filter(
            (
              match,
            ): match is {
              chant: TimedLine;
              start: number;
              end: number;
            } => match !== null,
          )
          .sort((a, b) => a.start - b.start);

        if (matches.length === 0) {
          return {
            ...line,
            tone: "lyric" as const,
            source: "LYRIC" as const,
            lyricIndex,
            hasFanchant: false,
            segments: [
              {
                text: line.text,
                tone: "lyric" as const,
              },
            ],
          };
        }

        const segments: TranscriptSegment[] = [];
        let cursor = 0;

        matches.forEach((match) => {
          /*
           * Prevent overlapping/duplicate text.
           */
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
          tone: "singalong" as const,
          source: "LYRIC" as const,
          lyricIndex,
          hasFanchant: true,
          segments,
        };
      },
    );

    /*
     * Fanchants that were NOT matched to any lyric
     * remain as their own separate transcript lines.
     */
    const standaloneFanchants = selectedTrack.fanchant
      .filter((chant) => !fanchantData.assignedFanchants.has(chant))
      .map((chant) => ({
        ...chant,
        tone: "chant" as const,
        source: "FANCHANT" as const,
        hasFanchant: false,
        segments: [
          {
            text: chant.text,
            tone: "chant" as const,
            chantTime: chant.time,
          },
        ],
      }));

    return [...lyricLines, ...standaloneFanchants].sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }

      /*
       * If a lyric and standalone fanchant somehow share
       * the exact same timestamp, keep the lyric first.
       */
      if (a.source === "LYRIC" && b.source === "FANCHANT") {
        return -1;
      }

      if (a.source === "FANCHANT" && b.source === "LYRIC") {
        return 1;
      }

      return 0;
    });
  }, [selectedTrack, fanchantData]);
  /*
   * Determine the current cue.
   *
   * The most recent cue at or before the
   * current video time is active.
   */

  const activeCueTime = useMemo(() => {
    if (transcriptLines.length === 0) {
      return -1;
    }

    let cueTime = -1;

    transcriptLines.forEach((line) => {
      if (line.time <= playbackSeconds) {
        cueTime = Math.max(cueTime, line.time);
      }
    });

    return cueTime;
  }, [transcriptLines, playbackSeconds]);
  const progress =
    duration > 0
      ? Math.min(
          100,
          (playbackSeconds / duration) *
            100,
        )
      : 0;

  /*
   * Load YouTube API.
   */
  useEffect(() => {
    let cancelled = false;

    const existingScript =
      document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );

    const checkExistingApi =
      window.setInterval(() => {
        if (
          window.YT &&
          window.YT.Player
        ) {
          window.clearInterval(
            checkExistingApi,
          );

          if (!cancelled) {
            setApiReady(true);
          }
        }
      }, 100);

    const timeout = window.setTimeout(
      () => {
        window.clearInterval(
          checkExistingApi,
        );

        if (
          !window.YT?.Player &&
          !cancelled
        ) {
          setApiFailed(true);
        }
      },
      8000,
    );

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady =
      () => {
        if (previousCallback) {
          previousCallback();
        }

        if (!cancelled) {
          window.clearTimeout(timeout);
          setApiReady(true);
        }
      };

    if (
      !existingScript &&
      !window.YT?.Player
    ) {
      const script =
        document.createElement(
          "script",
        );

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;

      document.body.appendChild(script);
    } else if (window.YT?.Player) {
      window.clearTimeout(timeout);
      window.clearInterval(
        checkExistingApi,
      );
      setApiReady(true);
    }

    return () => {
      cancelled = true;

      window.clearTimeout(timeout);
      window.clearInterval(
        checkExistingApi,
      );

      window.onYouTubeIframeAPIReady =
        previousCallback;
    };
  }, []);

  /*
   * Create YouTube player once.
   *
   * The initial video is PAUSED.
   */
  useEffect(() => {
    if (
      !apiReady ||
      !window.YT?.Player ||
      !playerHostRef.current ||
      initialPlayerCreatedRef.current
    ) {
      return;
    }

    initialPlayerCreatedRef.current =
      true;

    const player =
      new window.YT.Player(
        playerHostRef.current,
        {
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
              playerRef.current =
                player;

              lastLoadedVideoIdRef.current =
                videoId;

              const apiDuration =
                player.getDuration?.();

              if (
                apiDuration &&
                apiDuration > 0
              ) {
                setDuration(
                  apiDuration,
                );
              }

              setPlaybackSeconds(0);

              const shouldAutoplay =
                autoplayTrackRef.current;

              autoplayTrackRef.current =
                false;

              if (shouldAutoplay) {
                player.playVideo?.();
              } else {
                setIsPlaying(false);
              }
            },

            onStateChange: (
              event,
            ) => {
              const state =
                window.YT?.PlayerState;

              if (
                event.data ===
                state?.PLAYING
              ) {
                setIsPlaying(true);
              }

              if (
                event.data ===
                  state?.PAUSED ||
                event.data ===
                  state?.ENDED
              ) {
                setIsPlaying(false);
              }

              if (
                event.data ===
                state?.ENDED
              ) {
                const endedDuration =
                  playerRef.current?.getDuration?.();

                setPlaybackSeconds(
                  endedDuration &&
                    endedDuration > 0
                    ? endedDuration
                    : FALLBACK_DURATION,
                );
              }
            },
          },
        },
      );

    playerRef.current = player;
  }, [apiReady]);

  /*
   * Change video without destroying
   * the YouTube player.
   */
  useEffect(() => {
    if (
      !apiReady ||
      !playerRef.current
    ) {
      return;
    }

    const player =
      playerRef.current;

    if (
      lastLoadedVideoIdRef.current ===
      videoId
    ) {
      return;
    }

    lastLoadedVideoIdRef.current =
      videoId;

    setPlaybackSeconds(0);
    setDuration(
      FALLBACK_DURATION,
    );

    player.loadVideoById?.(
      videoId,
    );
  }, [apiReady, videoId]);

  /*
   * Playback clock.
   */
  useEffect(() => {
    if (
      fallbackTimerRef.current !==
      null
    ) {
      window.clearInterval(
        fallbackTimerRef.current,
      );

      fallbackTimerRef.current =
        null;
    }

    if (!isPlaying) {
      return;
    }

    fallbackTimerRef.current =
      window.setInterval(() => {
        const player =
          playerRef.current;

        if (player) {
          const current =
            player.getCurrentTime?.() ??
            0;

          const currentDuration =
            player.getDuration?.() ??
            duration;

          setPlaybackSeconds(
            current,
          );

          if (currentDuration > 0) {
            setDuration(
              currentDuration,
            );
          }
        } else {
          setPlaybackSeconds(
            (current) => {
              if (
                current >=
                FALLBACK_DURATION
              ) {
                return 0;
              }

              return current + 0.25;
            },
          );
        }
      }, 250);

    return () => {
      if (
        fallbackTimerRef.current !==
        null
      ) {
        window.clearInterval(
          fallbackTimerRef.current,
        );

        fallbackTimerRef.current =
          null;
      }
    };
  }, [
    duration,
    isPlaying,
  ]);

  /*
   * Keep the current cue centered.
   */
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView(
        {
          behavior: "smooth",
          block: "center",
        },
      );
    }
  }, [
    activeCueTime,
    selectedId,
  ]);
  /*
   * Destroy player on unmount.
   */
  useEffect(() => {
    return () => {
      if (
        fallbackTimerRef.current !==
        null
      ) {
        window.clearInterval(
          fallbackTimerRef.current,
        );
      }

      playerRef.current?.destroy?.();

      playerRef.current = null;
    };
  }, []);

  /*
   * Select a track.
   *
   * Clicking a track automatically
   * starts playback.
   */
  const chooseTrack = (
    track: Track,
  ) => {
    setSelectedId(track.id);

    setPlaybackSeconds(0);
    setDuration(
      FALLBACK_DURATION,
    );

    const player =
      playerRef.current;

    if (player && apiReady) {
      lastLoadedVideoIdRef.current =
        track.videoId;

      setVideoId(track.videoId);

      player.loadVideoById?.(
        track.videoId,
      );

      player.playVideo?.();
    } else {
      autoplayTrackRef.current =
        true;

      setVideoId(track.videoId);
      setIsPlaying(false);
    }
  };

  /*
   * Play / pause.
   */
  const togglePlayback =
    useCallback(() => {
      const player =
        playerRef.current;

      if (!player) {
        setIsPlaying(
          (playing) => !playing,
        );

        return;
      }

      if (isPlaying) {
        player.pauseVideo?.();
      } else {
        player.playVideo?.();
      }
    }, [isPlaying]);

  /*
   * Seek.
   */
  const seekTo = useCallback(
    (seconds: number) => {
      const safeSeconds =
        Math.max(
          0,
          Math.min(
            seconds,
            duration ||
              FALLBACK_DURATION,
          ),
        );

      setPlaybackSeconds(
        safeSeconds,
      );

      playerRef.current?.seekTo?.(
        safeSeconds,
        true,
      );
    },
    [duration],
  );

  const handleProgressChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    seekTo(
      Number(event.target.value),
    );
  };

  /*
   * Share session.
   */
  const copySessionLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          window.location.href,
        );

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
        setCopied(false);
      }
    };

  /*
   * Mute / unmute.
   */
  const toggleMute = () => {
    const player =
      playerRef.current;

    if (player) {
      if (isMuted) {
        player.unMuteVideo?.();
      } else {
        player.muteVideo?.();
      }
    }

    setIsMuted(
      (muted) => !muted,
    );
  };

  const tracksBySection = (
    section: Track["section"],
  ) => {
    return setlist.filter(
      (track) =>
        track.section === section,
    );
  };

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div
          className="brand-lockup"
          data-testid="display-brand"
        >
          <div
            className="brand-mark"
            aria-hidden="true"
          >
            VL
          </div>

          <span className="brand-name">
            Video Lyrics Studio
          </span>

          <span className="brand-kicker">
            live setlist companion
          </span>
        </div>

        <div
          className="topbar-status"
          data-testid="status-session"
        >
          <span
            className="status-dot"
            aria-hidden="true"
          />

          room ready /{" "}
          {apiReady
            ? "player synced"
            : "demo clock"}
        </div>

        <button
          className="share-button"
          data-testid="button-share-session"
          onClick={copySessionLink}
          type="button"
        >
          {copied ? (
            <Check size={14} />
          ) : (
            <Share2 size={14} />
          )}

          {copied
            ? "Copied"
            : "Share room"}
        </button>
      </header>

      <main className="app-main">
        <section
          className="room-heading"
          aria-labelledby="page-title"
        >
          <div>
            <div
              className="eyebrow"
              data-testid="text-room-kicker"
            >
              ENHYPEN / fanchant
            </div>

            <h1 id="page-title">
              Let our voices reach{" "}
              <em>ENHYPEN.</em>
            </h1>
          </div>

          <div className="heading-note">
            <span className="heading-rule" />

            <p>
              Fanchants made easy for
              every ENGENE.
              <br />
              Learn It. Chant It. Make It
              LOUD.
            </p>
          </div>
        </section>

        <section
          className="legend-strip"
          aria-label="Transcript color legend"
        >
          <span className="legend-title">
            quick guide
          </span>

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
            {setlist.length} songs in
            this playlist
          </span>
        </section>

        <section
          className="workspace"
          aria-label="Setlist, performance player, and synchronized transcript"
        >
          <aside
            className="setlist-panel"
            data-testid="panel-setlist"
          >
            <div className="panel-cap">
              <span className="eyebrow">
                ENGENEs PLAYLIST
              </span>

              <span className="set-count">
                {setlist.length} tracks
              </span>
            </div>

            <h2 className="setlist-title">
              BLOOD SAGA
              <br />
              <span>TOUR</span>
            </h2>

            <p className="setlist-intro">
              Your personal fanchant cue
              sheet for the performance.
            </p>

            <div className="setlist-sections">
              {(["SONGS"] as const).map(
                (section) => (
                  <section
                    className="set-section"
                    key={section}
                  >
                    <div className="section-heading">
                      <span>
                        {section}
                      </span>

                      <i />
                    </div>

                    <div className="set-rows">
                      {tracksBySection(
                        section,
                      ).map(
                        (track) => (
                          <button
                            className={
                              selectedId ===
                              track.id
                                ? "set-row selected"
                                : "set-row"
                            }
                            data-testid={
                              "button-setlist-" +
                              track.id
                            }
                            key={track.id}
                            onClick={() =>
                              chooseTrack(
                                track,
                              )
                            }
                            type="button"
                          >
                            <span className="set-number">
                              {String(
                                track.number,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <span className="set-song">
                              {track.title}
                            </span>

                            <span className="set-duration">
                              {
                                track.duration
                              }
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          </aside>

          <div className="performance-column">
            <article
              className="stage-card"
              data-testid="card-performance"
            >
              <div className="video-wrap">
                <div
                  className="player-frame"
                  ref={playerHostRef}
                />

                {!apiReady && (
                  <iframe
                    title={
                      selectedTrack.title +
                      " YouTube performance"
                    }
                    src={
                      "https://www.youtube.com/embed/" +
                      videoId +
                      "?autoplay=0&rel=0&modestbranding=1&playsinline=1"
                    }
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {!apiReady &&
                  !apiFailed && (
                    <div
                      className="video-loading"
                      data-testid="status-video-loading"
                    >
                      connecting to the
                      stage
                    </div>
                  )}

                {apiFailed &&
                  !apiReady && (
                    <div
                      className="video-loading"
                      data-testid="status-video-error"
                    >
                      YouTube player
                      unavailable
                    </div>
                  )}

                <div
                  className="video-overlay-label"
                  data-testid="status-video-source"
                >
                  <span className="video-signal">
                    <Radio size={11} />
                  </span>

                  {apiReady
                    ? "youtube / live sync"
                    : "youtube / demo sync"}
                </div>

                <div className="video-track-stamp">
                  <span>
                    {String(
                      selectedTrack.number,
                    ).padStart(2, "0")}
                  </span>

                  {selectedTrack.title}
                </div>
              </div>

              <div className="stage-controls">
                <div className="progress-track">
                  <span
                    className="timestamp"
                    data-testid="text-current-time"
                  >
                    {formatTime(
                      playbackSeconds,
                    )}
                  </span>

                  <input
                    aria-label="Seek performance"
                    className="progress-range"
                    data-testid="input-seek"
                    max={duration}
                    min="0"
                    onChange={
                      handleProgressChange
                    }
                    style={
                      {
                        "--progress":
                          progress + "%",
                      } as CSSProperties
                    }
                    type="range"
                    value={Math.min(
                      playbackSeconds,
                      duration,
                    )}
                  />

                  <span
                    className="timestamp"
                    data-testid="text-duration"
                  >
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="control-row">
                  <div className="control-left">
                    <button
                      aria-label={
                        isPlaying
                          ? "Pause performance"
                          : "Play performance"
                      }
                      className="play-button"
                      data-testid="button-play-pause"
                      onClick={
                        togglePlayback
                      }
                      type="button"
                    >
                      {isPlaying ? (
                        <Pause
                          size={17}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={17}
                          fill="currentColor"
                        />
                      )}
                    </button>

                    <div>
                      <div className="control-label">
                        {isPlaying
                          ? "Playing live"
                          : "Ready to replay"}
                      </div>

                      <div className="control-meta">
                        {apiReady
                          ? "YouTube sync"
                          : "demo clock fallback"}
                      </div>
                    </div>
                  </div>

                  <div className="control-right">
                    <span className="control-meta">
                      {apiFailed &&
                      !apiReady
                        ? "API unavailable"
                        : "sample performance"}
                    </span>

                    <button
                      aria-label={
                        isMuted
                          ? "Unmute"
                          : "Mute"
                      }
                      className="icon-button"
                      data-testid="button-toggle-mute"
                      onClick={
                        toggleMute
                      }
                      type="button"
                    >
                      {isMuted ? (
                        <VolumeX
                          size={15}
                        />
                      ) : (
                        <Volume2
                          size={15}
                        />
                      )}
                    </button>

                    <button
                      aria-label="Expand player"
                      className="icon-button"
                      data-testid="button-expand-player"
                      onClick={() =>
                        document
                          .querySelector(
                            ".video-wrap",
                          )
                          ?.requestFullscreen?.()
                      }
                      type="button"
                    >
                      <Maximize2
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="song-meta">
                <div className="track-info">
                  <span className="track-kicker">
                    NOW PLAYING / TRACK{" "}
                    {String(
                      selectedTrack.number,
                    ).padStart(2, "0")}
                  </span>

                  <h2
                    className="track-title"
                    data-testid="text-track-title"
                  >
                    {
                      selectedTrack.title
                    }
                  </h2>

                  <p
                    className="track-artist"
                    data-testid="text-track-artist"
                  >
                    {
                      selectedTrack.artist
                    }

                    {selectedTrack.featuredArtist && (
                      <>
                        {" "}
                        <span className="featured-artist">
                          feat.{" "}
                          {
                            selectedTrack.featuredArtist
                          }
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="track-tags">
                  <span className="tag tag-highlight">
                    {selectedTrack.type ??
                      "PERFORMANCE"}
                  </span>

                  <span className="tag">
                    {
                      selectedTrack.duration
                    }
                  </span>

                  <button
                    aria-label={
                      isLiked
                        ? "Remove from saved rooms"
                        : "Save this room"
                    }
                    className={
                      isLiked
                        ? "icon-button save-button saved"
                        : "icon-button save-button"
                    }
                    data-testid="button-save-room"
                    onClick={() =>
                      setIsLiked(
                        (liked) =>
                          !liked,
                      )
                    }
                    type="button"
                  >
                    <Heart
                      size={15}
                      fill={
                        isLiked
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <aside
            className="lyrics-card"
            data-testid="card-lyrics"
          >
            <div className="lyrics-head">
              <div className="lyrics-headline">
                <div>
                  <div className="eyebrow">
                    TRACK /{" "}
                    {String(
                      selectedTrack.number,
                    ).padStart(2, "0")}
                  </div>

                  <h2 className="lyrics-title">
                    One room. One cue
                    sheet.
                  </h2>
                </div>

                <div
                  className="sync-status"
                  data-testid="status-sync"
                >
                  <span
                    className="live-dot"
                    aria-hidden="true"
                  />

                  {apiReady
                    ? "synced"
                    : "demo sync"}
                </div>
              </div>

              <div className="transcript-track">
                {
                  selectedTrack.title
                }{" "}
                <span>·</span>{" "}
                {
                  selectedTrack.artist
                }
              </div>
            </div>

            <div
              className="lyric-scroll"
              data-testid="list-transcript"
            >
              {transcriptLines.map((line, index) => {
                const isActive = line.time === activeCueTime;

                const lineClass =
                  "lyric-line tone-" +
                  (line.source === "FANCHANT" ? "chant" : line.tone) +
                  " source-" +
                  line.source.toLowerCase() +
                  (isActive ? " active" : "");

                return (
                  <button
                    className={lineClass}
                    data-testid={"button-transcript-line-" + index}
                    key={
                      selectedTrack.id +
                      "-" +
                      line.source +
                      "-" +
                      line.time +
                      "-" +
                      index
                    }
                    onClick={() => seekTo(line.time)}
                    ref={isActive ? activeLineRef : undefined}
                    type="button"
                  >
                    <span className="line-content">
                      <span className="line-text">
                        {line.segments?.map((segment, segmentIndex) => {
                          if (segment.tone === "lyric") {
                            return (
                              <span
                                className={
                                  isActive ? "segment-lyric active-part" : "segment-lyric"
                                }
                                key={segmentIndex}
                              >
                                {segment.text}
                              </span>
                            );
                          }

                          const chantIsActive =
                            segment.chantTime !== undefined &&
                            playbackSeconds >= segment.chantTime;

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

      {copied && (
        <div className="toast-note">
          Room link copied
        </div>
      )}
    </div>
  );
}

export default App;