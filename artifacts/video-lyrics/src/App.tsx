import { type ChangeEvent, type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import {
  Check,
  ChevronDown,
  Heart,
  Link2,
  Maximize2,
  Pause,
  Play,
  Radio,
  Share2,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type Mode = 'lyrics' | 'fanchant';

type TimedLine = {
  time: number;
  text: string;
  note?: string;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
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
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const queryClient = new QueryClient();
const FALLBACK_DURATION = 212;
const INITIAL_URL = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';

const lyrics: TimedLine[] = [
  { time: 0, text: 'Lights down, breathe in', note: 'opening' },
  { time: 12, text: 'We found a little fire in the quiet', note: 'verse 01' },
  { time: 27, text: 'Hands up, let the whole room know', note: 'pre-chorus' },
  { time: 41, text: 'We are louder when we sing together', note: 'chorus' },
  { time: 57, text: 'Stay with me through the afterglow', note: 'chorus' },
  { time: 75, text: 'Every heartbeat keeps the rhythm', note: 'verse 02' },
  { time: 91, text: 'Call my name, I will answer back', note: 'build' },
  { time: 107, text: 'This is our night, our little orbit', note: 'bridge' },
  { time: 126, text: 'One more time, make the ceiling shake', note: 'final chorus' },
  { time: 145, text: 'Hold the moment, do not let it fade', note: 'final chorus' },
  { time: 170, text: 'Lights up, we are still here', note: 'outro' },
  { time: 194, text: 'See you at the next replay', note: 'outro' },
];

const fanchant: TimedLine[] = [
  { time: 0, text: '— settle in', note: 'all fans / soft' },
  { time: 12, text: 'HEY! HEY!', note: 'count it in' },
  { time: 27, text: 'Hands up! Hands up!', note: 'call' },
  { time: 41, text: 'WE SING TOGETHER!', note: 'response' },
  { time: 57, text: 'STAY! STAY! STAY!', note: 'response' },
  { time: 75, text: 'Oh-oh-oh-oh', note: 'keep the pulse' },
  { time: 91, text: 'Your name! Your name!', note: 'call and answer' },
  { time: 107, text: 'THIS IS OUR NIGHT!', note: 'all fans / loud' },
  { time: 126, text: 'ONE MORE TIME!', note: 'call' },
  { time: 145, text: 'WE ARE STILL HERE!', note: 'response' },
  { time: 170, text: 'HEY! HEY! HEY!', note: 'final lift' },
  { time: 194, text: 'See you next time', note: 'soft landing' },
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
  const [mode, setMode] = useState<Mode>('lyrics');
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

  const activeLines = mode === 'lyrics' ? lyrics : fanchant;
  const activeIndex = useMemo(() => {
    let index = 0;
    activeLines.forEach((line, lineIndex) => {
      if (line.time <= playbackSeconds) index = lineIndex;
    });
    return index;
  }, [activeLines, playbackSeconds]);
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
          if (event.data === state?.ENDED) setPlaybackSeconds(duration);
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
  }, [activeIndex, mode]);

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

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(event.target.value));
  };

  const handleLoadVideo = (event: React.FormEvent<HTMLFormElement>) => {
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
    const sessionUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <div className="brand-lockup" data-testid="display-brand">
          <div className="brand-mark" aria-hidden="true">VL</div>
          <span className="brand-name">Video Lyrics Studio</span>
          <span className="brand-kicker">room 01</span>
        </div>
        <div className="topbar-status" data-testid="status-session">
          <span className="status-dot" aria-hidden="true" />
          session ready
        </div>
        <div className="topbar-actions">
          <button
            className="share-button"
            data-testid="button-share-session"
            onClick={copySessionLink}
            type="button"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share room'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="room-heading" aria-labelledby="page-title">
          <div>
            <div className="eyebrow" data-testid="text-room-kicker">private concert room / fan practice mode</div>
            <h1 id="page-title">Sing it like <em>you were there.</em></h1>
          </div>
          <p className="heading-note">
            A focused replay space for the lyric, the breath, and the exact moment the room sings back.
          </p>
        </section>

        <section className="live-layout" aria-label="Performance player and synchronized words">
          <div>
            <article className="stage-card" data-testid="card-performance">
              <div className="video-wrap">
                <div className="player-frame" ref={playerHostRef}>
                  {!apiReady && (
                    <iframe
                      title="Sample YouTube performance"
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                {!apiReady && !apiFailed && (
                  <div className="video-loading" data-testid="status-video-loading">connecting to the stage</div>
                )}
                <div className="video-overlay-label" data-testid="status-video-source">
                  <span className="video-signal"><Radio size={11} /></span>
                  sample performance / {apiReady ? 'live sync' : 'demo sync'}
                </div>
              </div>
              <div className="stage-controls">
                <div className="progress-track">
                  <span className="timestamp" data-testid="text-current-time">{formatTime(playbackSeconds)}</span>
                  <input
                    aria-label="Seek performance"
                    className="progress-range"
                    data-testid="input-seek"
                    max={duration}
                    min="0"
                    onChange={handleProgressChange}
                    style={{ '--progress': `${progress}%` } as CSSProperties}
                    type="range"
                    value={playbackSeconds}
                  />
                  <span className="timestamp" data-testid="text-duration">{formatTime(duration)}</span>
                </div>
                <div className="control-row">
                  <div className="control-left">
                    <button
                      aria-label={isPlaying ? 'Pause performance' : 'Play performance'}
                      className="play-button"
                      data-testid="button-play-pause"
                      onClick={togglePlayback}
                      type="button"
                    >
                      {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                    </button>
                    <div>
                      <div className="control-label">{isPlaying ? 'Playing live' : 'Ready to replay'}</div>
                      <div className="control-meta">{apiReady ? 'YouTube sync' : 'demo clock fallback'}</div>
                    </div>
                  </div>
                  <div className="control-right">
                    <span className="control-meta">{apiFailed && !apiReady ? 'API unavailable' : 'sample video'}</span>
                    <button
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="icon-button"
                      data-testid="button-toggle-mute"
                      onClick={() => setIsMuted((muted) => !muted)}
                      type="button"
                    >
                      <Volume2 size={15} style={{ opacity: isMuted ? 0.4 : 1 }} />
                    </button>
                    <button aria-label="Expand player" className="icon-button" data-testid="button-expand-player" onClick={() => document.querySelector('.video-wrap')?.requestFullscreen?.()} type="button">
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="song-meta">
                <div className="track-info">
                  <h2 className="track-title" data-testid="text-track-title">Night Bloom — live room take</h2>
                  <p className="track-artist" data-testid="text-track-artist">sample performance · sync demo by Video Lyrics Studio</p>
                </div>
                <div className="track-tags">
                  <span className="tag tag-highlight">practice cut</span>
                  <span className="tag">3:32</span>
                  <button
                    aria-label={isLiked ? 'Remove from saved rooms' : 'Save this room'}
                    className="icon-button"
                    data-testid="button-save-room"
                    onClick={() => setIsLiked((liked) => !liked)}
                    type="button"
                  >
                    <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} color={isLiked ? 'hsl(335 83% 67%)' : 'currentColor'} />
                  </button>
                </div>
              </div>
            </article>

            <div className="under-grid">
              <div className="info-panel" data-testid="panel-sync-info">
                <div className="info-copy">
                  <div className="info-glyph"><Sparkles size={16} /></div>
                  <div>
                    <p className="info-title">Words follow the moment</p>
                    <p className="info-description">Tap any line to jump there. The room will keep your place.</p>
                  </div>
                </div>
                <div className="progress-caption" data-testid="text-progress-caption">
                  {Math.round(progress)}%<br />through the set
                </div>
              </div>
              <button className="info-panel change-button" data-testid="button-change-video" onClick={() => { setUrlDraft(`https://youtu.be/${videoId}`); setIsModalOpen(true); }} type="button">
                <div className="info-copy">
                  <div className="info-glyph"><Link2 size={16} /></div>
                  <div>
                    <p className="info-title">Bring your own performance</p>
                    <p className="info-description">Swap the sample for a YouTube URL.</p>
                  </div>
                </div>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>

          <aside className="lyrics-card" data-testid="card-lyrics">
            <div className="lyrics-head">
              <div className="lyrics-headline">
                <div>
                  <div className="eyebrow">live transcript</div>
                  <h2 className="lyrics-title">{mode === 'lyrics' ? 'Follow the lyric' : 'Join the room'}</h2>
                </div>
                <div className="sync-status" data-testid="status-sync">
                  <span className="live-dot" aria-hidden="true" />
                  {apiReady ? 'synced' : 'demo sync'}
                </div>
              </div>
              <div className="mode-switch" role="tablist" aria-label="Transcript mode">
                <button className={`mode-button ${mode === 'lyrics' ? 'active' : ''}`} data-testid="button-mode-lyrics" onClick={() => setMode('lyrics')} role="tab" aria-selected={mode === 'lyrics'} type="button">Lyrics</button>
                <button className={`mode-button ${mode === 'fanchant' ? 'active' : ''}`} data-testid="button-mode-fanchant" onClick={() => setMode('fanchant')} role="tab" aria-selected={mode === 'fanchant'} type="button">Fanchant</button>
              </div>
            </div>
            <div className={`lyric-scroll ${mode === 'fanchant' ? 'chant' : ''}`} data-testid={`list-${mode}`}>
              {activeLines.map((line, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    className={`lyric-line ${isActive ? 'active' : ''} ${mode === 'fanchant' ? 'chant' : ''}`}
                    data-testid={`button-${mode}-line-${index}`}
                    key={`${mode}-${line.time}`}
                    onClick={() => seekTo(line.time)}
                    ref={isActive ? activeLineRef : undefined}
                    type="button"
                  >
                    <span className="line-time">{formatTime(line.time)}</span>
                    <span className="line-content">
                      <span className="line-text">{line.text}</span>
                      {line.note && <span className="line-note">{line.note}</span>}
                    </span>
                    <span className="line-pulse" aria-hidden="true" />
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
              <div>
                <div className="eyebrow">change the stage</div>
                <h2 className="modal-title">Load a performance</h2>
              </div>
              <button aria-label="Close video dialog" className="icon-button" data-testid="button-close-video-dialog" onClick={() => setIsModalOpen(false)} type="button"><X size={16} /></button>
            </div>
            <p className="modal-copy">Use a YouTube watch link, short link, embed link, or video ID. Your room state stays in the URL for easy sharing.</p>
            <label className="mono-label" htmlFor="video-url">youtube url</label>
            <input
              autoFocus
              className="url-input"
              data-testid="input-video-url"
              id="video-url"
              onChange={(event) => setUrlDraft(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              value={urlDraft}
            />
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
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey={window.location.pathname}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Router />
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
