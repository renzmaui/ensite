import { lines, type Track } from "./types";

export const stealer: Track = {
  id: "STEALER",
  number: 3,
  title: "STEALER",
  artist: "ENHYPEN",
  type: "BLOOD SAGA in SEOUL",
  section: "SONGS",
  duration: "3:03",
  videoId: "tWM5t3_v8KA",

  lyrics: lines([
    [0, "The room is bright enough to see you", "opening"],
    [24, "Every little voice becomes a choir", "verse"],
    [55, "Keep the home light burning", "chorus"],
    [94, "We will carry what we came here for", "chorus"],
    [133, "If you get lost, look for the windows", "bridge"],
    [176, "Keep the home light burning", "final chorus"],
    [220, "Goodnight, goodnight, goodnight", "close"],
  ]),

  fanchant: lines([
    [0, "HEY! HEY!", "opening"],
    [55, "HOME LIGHT!", "response"],
    [94, "CARRY IT HOME!", "all fans"],
    [133, "LOOK FOR THE WINDOWS!", "call"],
    [176, "HOME LIGHT!", "final response"],
    [220, "GOODNIGHT!", "close"],
  ]),
};