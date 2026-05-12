export type MascotMood =
  | 'happy'
  | 'excited'
  | 'sleepy'
  | 'curious'
  | 'encouraging'
  | 'celebrating'
  | 'concerned'
  | 'neutral'

export interface MascotConfig {
  name: string
  mood: MascotMood
  energy: number // 0-100
}

export interface MascotReaction {
  mood: MascotMood
  messages: string[]
  emoji: string
}

export type MascotTrigger =
  | 'task_completed'
  | 'streak_milestone'
  | 'routine_completed'
  | 'grocery_session_done'
  | 'morning_greeting'
  | 'evening_summary'
  | 'all_tasks_done'
  | 'routine_missed'
  | 'bill_due'
  | 'maintenance_due'
  | 'encouragement'
  | 'low_activity'
  | 'weekly_recap'
