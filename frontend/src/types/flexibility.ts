// Training型
export interface Training {
  id: number;
  training_type: number; // 1: FLEXIBILITY, 2: CORE, 3: STRENGTH, 4: LADDER
  title: string;
  image_path: string | null;
  description: string;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

// TrainingType Enum
export enum TrainingType {
  FLEXIBILITY = 1,
  CORE = 2,
  STRENGTH = 3,
  LADDER = 4,
} 