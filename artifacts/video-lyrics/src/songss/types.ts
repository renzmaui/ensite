export type LineTone = "singalong" | "chant" | "lyric";

export type TimedLine = {
  time: number;
  text: string;
  note?: string;
  tone?: LineTone;
};

export type Track = {
  id: string;
  number: number;
  title: string;
  artist: string;
  type?: string;
  section: string;
  duration: string;
  videoId: string;
  lyrics: TimedLine[];
  fanchant: TimedLine[];
};