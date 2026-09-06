import type { Track } from "./types";
import { lines } from "./helpers";

export const stealer: Track = {
  id: "STEALER",
  number: 3,
  title: "STEALER",
  artist: "ENHYPEN",
  section: "BLOOD SAGA in SEOUL",
  duration: "3:03",
  videoId: "tWM5t3_v8KA",

  lyrics: lines([
    [0, "The room is bright enough to see you", "opening"],
    [24, "Every little voice becomes a choir", "verse", "singalong"],
    [55, "Keep the home light burning", "chorus", "singalong"],
    [94, "We will carry what we came here for", "chorus"],
    [133, "If you get lost, look for the windows", "bridge", "singalong"],
    [176, "Keep the home light burning", "final chorus", "singalong"],
    [220, "Goodnight, goodnight, goodnight", "close"],
  ]),

  fanchant: lines([
    [0, "HEY! HEY!", "opening", "chant"],
    [55, "HOME LIGHT!", "response", "chant"],
    [94, "CARRY IT HOME!", "all fans", "chant"],
    [133, "LOOK FOR THE WINDOWS!", "call", "chant"],
    [176, "HOME LIGHT!", "final response", "chant"],
    [220, "GOODNIGHT!", "close", "chant"],
  ]),
};