export type LineTone = "singalong" | "chant" | "lyric";

export type TimedLine = {
  time: number;
  text: string;
  note?: string;
  tone?: LineTone;
};

export type TranscriptSegment = {
  text: string;
  tone: "lyric" | "chant";
  chantTime?: number;
};

export type TranscriptLine = TimedLine & {
  source: "LYRIC" | "FANCHANT";
  lyricIndex?: number;
  hasFanchant?: boolean;
  segments?: TranscriptSegment[];
};

export type Track = {
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

export const lines = (
  data: Array<[number, string, string?, LineTone?]>,
): TimedLine[] =>
  data.map(([time, text, note, tone]) => ({
    time,
    text,
    note,
    tone,
  }));