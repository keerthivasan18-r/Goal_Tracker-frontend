export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  onboarded: boolean;
}

export interface Settings {
  id: string;
  userId: string;
  morningReminder: boolean;
  hydrationReminder: boolean;
  workoutReminder: boolean;
  readingReminder: boolean;
  sleepReminder: boolean;
  weeklyReportEmail: boolean;
  monthlyReportEmail: boolean;
}

export interface GoalTemplate {
  id: string;
  name: string;
  category: string;
  unit: string;
  defaultTarget: number;
  description: string | null;
  isStatic: boolean;
}

export interface CustomGoal {
  id: string;
  userId: string;
  name: string;
  category: string;
  unit: string;
  defaultTarget: number;
  description: string | null;
  createdAt: string;
}

export interface DailyGoal {
  id: string;
  userId: string;
  templateId: string | null;
  template?: GoalTemplate | null;
  customGoalId: string | null;
  customGoal?: CustomGoal | null;
  date: string;
  targetValue: number;
  completedValue: number;
  unit: string;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalHistory {
  id: string;
  userId: string;
  date: string;
  completionPercentage: number;
  xpGained: number;
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  averageCompletion: number;
  strongestCategory: string | null;
  improvementSuggestions: string | null;
  reportPdfPath: string | null;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: number;
  year: number;
  averageCompletion: number;
  strongestCategory: string | null;
  improvementSuggestions: string | null;
  reportPdfPath: string | null;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  unlockedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'ACHIEVEMENT' | 'REPORT';
  isRead: boolean;
  sendAt: string;
}
