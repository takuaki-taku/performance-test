export interface Result {
  id: number;
  user_id: string; // UUID型に変更
  date: string;
  long_jump_cm: number;
  fifty_meter_run_ms: number;
  spider_ms: number;
  eight_shape_run_count: number;
  ball_throw_cm: number;
} 