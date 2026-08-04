import { profiles1to4 } from "./volume/profiles-1-4";
import { profiles5to8 } from "./volume/profiles-5-8";
import { profiles9to13 } from "./volume/profiles-9-13";
import { buildDeepChapter, countDeepChapterCharacters } from "./volume/types";
import type { DeepChapter } from "./volume/types";

const profiles = [...profiles1to4, ...profiles5to8, ...profiles9to13];

export const deepChapters: Record<number, DeepChapter> = Object.fromEntries(
  profiles.map((profile) => [profile.number, buildDeepChapter(profile)]),
);

export const deepVolumeCjkCharacters = Object.values(deepChapters).reduce(
  (sum, chapter) => sum + countDeepChapterCharacters(chapter),
  0,
);
