import { z } from "zod";

export const SkinToneSchema = z.enum([
  "tone_1", // Very Fair
  "tone_2", // Fair
  "tone_3", // Light Wheatish
  "tone_4", // Wheatish
  "tone_5", // Medium Brown
  "tone_6", // Deep Brown
]);
export type SkinTone = z.infer<typeof SkinToneSchema>;

export const FaceShapeSchema = z.enum(["oval", "round", "square", "heart", "long"]);
export type FaceShape = z.infer<typeof FaceShapeSchema>;

export const AgeGroupSchema = z.enum(["early_20s", "late_20s", "30s", "40s_plus"]);
export type AgeGroup = z.infer<typeof AgeGroupSchema>;

export const GenderSchema = z.enum(["female", "male"]);
export type Gender = z.infer<typeof GenderSchema>;

export const AngleSchema = z.enum(["front", "left", "right", "closeup", "three_quarter"]);
export type Angle = z.infer<typeof AngleSchema>;

export const JewelleryTypeSchema = z.enum([
  "necklace",
  "haar",
  "choker",
  "earrings",
  "jhumka",
  "ring",
  "bangles",
  "kada",
  "maang_tikka",
  "nath",
  "payal",
  "mangalsutra",
  "other",
]);
export type JewelleryType = z.infer<typeof JewelleryTypeSchema>;

export const JobStatusSchema = z.enum([
  "pending",
  "analyzing",
  "generating",
  "judging",
  "completed",
  "failed",
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export interface PresetItem {
  id: string;
  name_en: string;
  name_hi: string;
  description_en?: string;
  description_hi?: string;
  metadata?: Record<string, unknown>;
}

export interface PresetsCatalog {
  skin_tones: PresetItem[];
  face_shapes: PresetItem[];
  age_groups: PresetItem[];
  regions: PresetItem[];
  outfits: PresetItem[];
  occasions: PresetItem[];
  backgrounds: PresetItem[];
  poses: PresetItem[];
  hairstyles: PresetItem[];
  makeups: PresetItem[];
}

