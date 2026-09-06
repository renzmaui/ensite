import type { Track } from "./types";
import { lines } from "./helpers";

export const xo: Track = {
  id: "XO",
  number: 2,
  title: "XO (Only If You Say Yes)",
  artist: "ENHYPEN",
  section: "WEVERSE CON FESTIVAL 2026",
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
};