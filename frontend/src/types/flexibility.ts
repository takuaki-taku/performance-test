// Training型
export interface Training {
  id: number;
  training_type: number; // 1: FLEXIBILITY, 2: CORE, 3: STRENGTH, 4: LADDER, 5: WARMUP, 6: COOLDOWN
  title: string;
  image_path: string | null;
  description: string;
  instructions: string | null;
  series_name: string | null;
  series_number: number | null;
  page_number: number | null;
  created_at: string;
  updated_at: string;
}

// TrainingType Enum
export enum TrainingType {
  FLEXIBILITY = 1,
  CORE = 2,
  STRENGTH = 3,
  LADDER = 4,
  WARMUP = 5,
  COOLDOWN = 6,
} 