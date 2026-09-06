import type { LineTone, TimedLine } from "./types";

export const lines = (
  texts: Array<[number, string, string?, LineTone?]>,
): TimedLine[] =>
  texts.map(([time, text, note, tone]) => ({
    time,
    text,
    note,
    tone,
  }));