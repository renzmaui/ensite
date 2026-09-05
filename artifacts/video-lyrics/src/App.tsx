import { type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import {
  Check,
  ChevronDown,
  Heart,
  Link2,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type LineTone = 'lyric' | 'singalong' | 'chant';

type TimedLine = {
  time: number;
  text: string;
  note?: string;
  tone?: LineTone;
};

type TranscriptLine = TimedLine & {
  source: 'LYRIC' | 'FANCHANT';
};

type Track = {
  id: string;
  number: number;
  title: string;
  artist: string;
  section: 'ACT 1' | 'ACT 2' | 'ENCORE' | 'ENHYPEN OT6 SONGS (in progress)';
  duration: string;
  lyrics: TimedLine[];
  fanchant: TimedLine[];
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
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
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState?: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const queryClient = new QueryClient();
const FALLBACK_DURATION = 212;
const INITIAL_URL = 'https://youtu.be/Scufsa1FB2Q?si=egyw57Yx08jw_EcL';

const lines = (texts: Array<[number, string, string?, LineTone?]>): TimedLine[] =>
  texts.map(([time, text, note, tone]) => ({ time, text, note, tone }));

const setlist: Track[] = [
  {
    id: 'XO',
    number: 1,
    title: 'XO (Only If You Say Yes)',
    artist: 'ENHYPEN at WEVERSE CON FESTIVAL 2026',
    section: 'ENHYPEN OT6 SONGS (in progress)',
    duration: '2:43',
    lyrics: lines([
      [20, 'XO XO'],
      [25, 'KISS ME'],
      [27, "DON'T SAY NO"],
      [30, "NEW LYRICS"],
    ]),
    fanchant: lines([
      [28, 'EN! HA! I! PEUN'],
      [30, 'NEW FANCHANT'],
    ]),
  },  
  {
    id: 'home-light',
    number: 10,
    title: 'STEALER',
    artist: 'ENHYPEN at BLOOD SAGA in SEOUL',
    section: 'ENHYPEN OT6 SONGS (in progress)',
    duration: '3:03',
    lyrics: lines([
      [14, 'The room is bright enough to see you', 'opening'],
      [24, 'Every little voice becomes a choir', 'verse', 'singalong'],
      [55, 'Keep the home light burning', 'chorus', 'singalong'],
      [94, 'We will carry what we came here for', 'chorus'],
      [133, 'If you get lost, look for the windows', 'bridge', 'singalong'],
      [176, 'Keep the home light burning', 'final chorus', 'singalong'],
      [220, 'Goodnight, goodnight, goodnight', 'close'],
    ]),
    fanchant: lines([
      [14, 'HEY! HEY!', 'opening', 'chant'],
      [55, 'HOME LIGHT!', 'response', 'chant'],
      [94, 'CARRY IT HOME!', 'all fans', 'chant'],
      [133, 'LOOK FOR THE WINDOWS!', 'call', 'chant'],
      [176, 'HOME LIGHT!', 'final response', 'chant'],
      [220, 'GOODNIGHT!', 'close', 'chant'],
    ]),
  },
];

function getVideoId(value: string) {
  const match = value.trim().match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/,
  );
  return match?.[1] ?? (value.trim().match(/^[a-zA-Z0-9_-]{6,}$/)?.[0] ?? null);
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function Home() {
  const [videoId, setVideoId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return getVideoId(params.get('v') ?? '') ?? getVideoId(INITIAL_URL) ?? '';
  });
  const [urlDraft, setUrlDraft] = useState(INITIAL_URL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlError, setUrlError] = useState('');
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
  const fallbackTimerRef = useRef<number | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  const selectedTrack = useMemo(() => setlist.find((track) => track.id === selectedId) ?? setlist[0], [selectedId]);
  const transcriptLines = useMemo<TranscriptLine[]>(
    () =>
      [
        ...selectedTrack.lyrics.map((line) => ({ ...line, tone: line.tone ?? 'lyric', source: 'LYRIC' as const })),
        ...selectedTrack.fanchant.map((line) => ({ ...line, tone: line.tone ?? 'chant', source: 'FANCHANT' as const })),
      ].sort((a, b) => a.time - b.time || (a.source === 'LYRIC' ? -1 : 1)),
    [selectedTrack],
  );
  const activeIndex = useMemo(() => {
    let index = 0;
    transcriptLines.forEach((line, lineIndex) => {
      if (line.time <= playbackSeconds) index = lineIndex;
    });
    return index;
  }, [transcriptLines, playbackSeconds]);
  const progress = duration > 0 ? Math.min(100, (playbackSeconds / duration) * 100) : 0;

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const timeout = window.setTimeout(() => setApiFailed(true), 4500);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      setApiReady(true);
    };
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    } else if (window.YT?.Player) {
      window.clearTimeout(timeout);
      setApiReady(true);
    }
    return () => {
      window.clearTimeout(timeout);
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || !playerHostRef.current || playerRef.current) return;
    playerRef.current = new window.YT!.Player(playerHostRef.current, {
      videoId,
      playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: () => {
          const apiDuration = playerRef.current?.getDuration?.();
          if (apiDuration) setDuration(apiDuration);
        },
        onStateChange: (event) => {
          const state = window.YT?.PlayerState;
          if (event.data === state?.PLAYING) setIsPlaying(true);
          if (event.data === state?.PAUSED || event.data === state?.ENDED) setIsPlaying(false);
          if (event.data === state?.ENDED) setPlaybackSeconds(playerRef.current?.getDuration?.() ?? FALLBACK_DURATION);
        },
      },
    });
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [apiReady, videoId]);

  useEffect(() => {
    if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
    if (!isPlaying) return;
    fallbackTimerRef.current = window.setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime?.() ?? 0;
        const currentDuration = playerRef.current.getDuration?.() ?? duration;
        setPlaybackSeconds(current);
        if (currentDuration > 0) setDuration(currentDuration);
      } else {
        setPlaybackSeconds((current) => (current >= FALLBACK_DURATION ? 0 : current + 0.25));
      }
    }, 250);
    return () => {
      if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
    };
  }, [duration, isPlaying]);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex, isPlaying, selectedId]);

  const chooseTrack = (track: Track) => {
    setSelectedId(track.id);
    setPlaybackSeconds(0);
  };

  const togglePlayback = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
      setIsPlaying((playing) => !playing);
      return;
    }
    setIsPlaying((playing) => !playing);
  }, [isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    setPlaybackSeconds(seconds);
    if (playerRef.current) playerRef.current.seekTo(seconds, true);
  }, []);

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => seekTo(Number(event.target.value));

  const handleLoadVideo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextId = getVideoId(urlDraft);
    if (!nextId) {
      setUrlError('Paste a YouTube link or an 11-character video ID.');
      return;
    }
    setUrlError('');
    setVideoId(nextId);
    setPlaybackSeconds(0);
    setDuration(FALLBACK_DURATION);
    setIsPlaying(false);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('v', nextId);
    window.history.replaceState({}, '', nextUrl);
    setIsModalOpen(false);
  };

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) playerRef.current.unMuteVideo?.();
      else playerRef.current.muteVideo?.();
    }
    setIsMuted((muted) => !muted);
  };

  const tracksBySection = (section: Track['section']) => setlist.filter((track) => track.section === section);

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div className="brand-lockup" data-testid="display-brand">
          <div className="brand-mark" aria-hidden="true">VL</div>
          <span className="brand-name">Video Lyrics Studio</span>
          <span className="brand-kicker">live setlist companion</span>
        </div>
        <div className="topbar-status" data-testid="status-session">
          <span className="status-dot" aria-hidden="true" />
          room ready / {apiReady ? 'player synced' : 'demo clock'}
        </div>
        <button className="share-button" data-testid="button-share-session" onClick={copySessionLink} type="button">
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Copied' : 'Share room'}
        </button>
      </header>

      <main className="app-main">
        <section className="room-heading" aria-labelledby="page-title">
          <div>
            <div className="eyebrow" data-testid="text-room-kicker">the afterhours / summer room tour</div>
            <h1 id="page-title">The room sings <em>back.</em></h1>
          </div>
          <div className="heading-note">
            <span className="heading-rule" />
            <p>Follow the set. Catch the cue.<br />Keep the whole room in time.</p>
          </div>
        </section>

        <section className="legend-strip" aria-label="Transcript color legend">
          <span className="legend-title">READ THE ROOM</span>
          <span className="legend-item"><i className="legend-swatch chant-swatch" /> red / fanchant</span>
          <span className="legend-item"><i className="legend-swatch sing-swatch" /> green / sing-along</span>
          <span className="legend-item"><i className="legend-swatch lyric-swatch" /> black / lyric</span>
          <span className="legend-item"><i className="legend-swatch highlight-swatch" /> yellow / controls</span>
          <span className="legend-track"><ListMusic size={13} /> {setlist.length} cues in tonight&apos;s set</span>
        </section>

        <section className="workspace" aria-label="Setlist, performance player, and synchronized transcript">
          <aside className="setlist-panel" data-testid="panel-setlist">
            <div className="panel-cap">
              <span className="eyebrow">tonight&apos;s running order</span>
              <span className="set-count">10 tracks</span>
            </div>
            <h2 className="setlist-title">SUMMER<br /><span>ROOM TOUR</span></h2>
            <p className="setlist-intro">Choose a song to load its cues into the room.</p>
            <div className="setlist-sections">
              {(['ACT 1', 'ACT 2', 'ENCORE'] as const).map((section) => (
                <section className="set-section" key={section} aria-labelledby={`heading-${section.replace(' ', '-')}`}>
                  <div className="section-heading" id={`heading-${section.replace(' ', '-')}`}>
                    <span>{section}</span><i />
                  </div>
                  <div className="set-rows">
                    {tracksBySection(section).map((track) => (
                      <button
                        className={`set-row ${selectedId === track.id ? 'selected' : ''}`}
                        data-testid={`button-setlist-${track.id}`}
                        key={track.id}
                        onClick={() => chooseTrack(track)}
                        type="button"
                      >
                        <span className="set-number">{String(track.number).padStart(2, '0')}</span>
                        <span className="set-song">{track.title}</span>
                        <span className="set-duration">{track.duration}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          <div className="performance-column">
            <article className="stage-card" data-testid="card-performance">
              <div className="video-wrap">
                <div className="player-frame" ref={playerHostRef}>
                  {!apiReady && (
                    <iframe
                      title={`${selectedTrack.title} YouTube performance`}
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                {!apiReady && !apiFailed && <div className="video-loading" data-testid="status-video-loading">connecting to the stage</div>}
                <div className="video-overlay-label" data-testid="status-video-source">
                  <span className="video-signal"><Radio size={11} /></span>
                  {apiReady ? 'youtube / live sync' : 'youtube / demo sync'}
                </div>
                <div className="video-track-stamp"><span>{String(selectedTrack.number).padStart(2, '0')}</span> {selectedTrack.title}</div>
              </div>
              <div className="stage-controls">
                <div className="progress-track">
                  <span className="timestamp" data-testid="text-current-time">{formatTime(playbackSeconds)}</span>
                  <input aria-label="Seek performance" className="progress-range" data-testid="input-seek" max={duration} min="0" onChange={handleProgressChange} style={{ '--progress': `${progress}%` } as CSSProperties} type="range" value={playbackSeconds} />
                  <span className="timestamp" data-testid="text-duration">{formatTime(duration)}</span>
                </div>
                <div className="control-row">
                  <div className="control-left">
                    <button aria-label={isPlaying ? 'Pause performance' : 'Play performance'} className="play-button" data-testid="button-play-pause" onClick={togglePlayback} type="button">
                      {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                    </button>
                    <div>
                      <div className="control-label">{isPlaying ? 'Playing live' : 'Ready to replay'}</div>
                      <div className="control-meta">{apiReady ? 'YouTube sync' : 'demo clock fallback'}</div>
                    </div>
                  </div>
                  <div className="control-right">
                    <span className="control-meta">{apiFailed && !apiReady ? 'API unavailable' : 'sample performance'}</span>
                    <button aria-label={isMuted ? 'Unmute' : 'Mute'} className="icon-button" data-testid="button-toggle-mute" onClick={toggleMute} type="button">
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <button aria-label="Expand player" className="icon-button" data-testid="button-expand-player" onClick={() => document.querySelector('.video-wrap')?.requestFullscreen?.()} type="button">
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="song-meta">
                <div className="track-info">
                  <span className="track-kicker">NOW PLAYING / TRACK {String(selectedTrack.number).padStart(2, '0')}</span>
                  <h2 className="track-title" data-testid="text-track-title">{selectedTrack.title}</h2>
                  <p className="track-artist" data-testid="text-track-artist">{selectedTrack.artist} · summer room tour</p>
                </div>
                <div className="track-tags">
                  <span className="tag tag-highlight">{selectedTrack.section}</span>
                  <span className="tag">{selectedTrack.duration}</span>
                  <button aria-label={isLiked ? 'Remove from saved rooms' : 'Save this room'} className={`icon-button save-button ${isLiked ? 'saved' : ''}`} data-testid="button-save-room" onClick={() => setIsLiked((liked) => !liked)} type="button">
                    <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </article>

            <div className="under-grid">
              <div className="info-panel" data-testid="panel-sync-info">
                <div className="info-copy">
                  <div className="info-glyph"><Radio size={15} /></div>
                  <div>
                    <p className="info-title">Cues follow the performance</p>
                    <p className="info-description">Tap any line to jump there. The room keeps your place.</p>
                  </div>
                </div>
                <div className="progress-caption" data-testid="text-progress-caption">{Math.round(progress)}%<br />through the set</div>
              </div>
              <button className="info-panel change-button" data-testid="button-change-video" onClick={() => { setUrlDraft(`https://youtu.be/${videoId}`); setIsModalOpen(true); }} type="button">
                <div className="info-copy">
                  <div className="info-glyph link-glyph"><Link2 size={15} /></div>
                  <div>
                    <p className="info-title">Bring your own performance</p>
                    <p className="info-description">Swap in any YouTube URL.</p>
                  </div>
                </div>
                <ChevronDown size={15} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>

          <aside className="lyrics-card" data-testid="card-lyrics">
            <div className="lyrics-head">
              <div className="lyrics-headline">
                <div>
                  <div className="eyebrow">live transcript / {String(selectedTrack.number).padStart(2, '0')}</div>
                  <h2 className="lyrics-title">One room. One cue sheet.</h2>
                </div>
                <div className="sync-status" data-testid="status-sync"><span className="live-dot" aria-hidden="true" />{apiReady ? 'synced' : 'demo sync'}</div>
              </div>
              <div className="transcript-track">{selectedTrack.title} <span>·</span> {selectedTrack.artist}</div>
              <div className="transcript-note">Every cue stays visible together. Tap a line to jump the performance.</div>
            </div>
            <div className="lyric-scroll" data-testid="list-transcript">
              {transcriptLines.map((line, index) => {
                const isActive = isPlaying && index === activeIndex;
                const tone = line.tone ?? 'lyric';
                return (
                  <button className={`lyric-line tone-${tone} source-${line.source.toLowerCase()} ${isActive ? 'active' : ''}`} data-testid={`button-transcript-line-${index}`} key={`${selectedTrack.id}-${line.source}-${line.time}-${index}`} onClick={() => seekTo(line.time)} ref={isActive ? activeLineRef : undefined} type="button">
                    <span className="line-content">
                      <span className="line-text">{line.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }}>
          <form className="modal-card" onSubmit={handleLoadVideo}>
            <div className="modal-top">
              <div><div className="eyebrow">change the performance</div><h2 className="modal-title">Load a YouTube link</h2></div>
              <button aria-label="Close video dialog" className="icon-button" data-testid="button-close-video-dialog" onClick={() => setIsModalOpen(false)} type="button"><X size={16} /></button>
            </div>
            <p className="modal-copy">Use a YouTube watch link, short link, embed link, or video ID. Your room state stays in the URL for easy sharing.</p>
            <label className="mono-label" htmlFor="video-url">youtube url</label>
            <input autoFocus className="url-input" data-testid="input-video-url" id="video-url" onChange={(event) => setUrlDraft(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." value={urlDraft} />
            {urlError && <p className="input-error" data-testid="status-video-error">{urlError}</p>}
            <div className="modal-actions">
              <button className="secondary-action" data-testid="button-cancel-video" onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
              <button className="primary-action" data-testid="button-load-video" type="submit">Load into room</button>
            </div>
          </form>
        </div>
      )}
      {copied && <div className="toast-note" data-testid="status-copied">Room link copied</div>}
    </div>
  );
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey={window.location.pathname}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary><Router /></RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;