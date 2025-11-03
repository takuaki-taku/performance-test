export type MockInProgressTraining = {
  id: number | string;
  title: string;
  description?: string;
  startedAt?: string; // ISO string
  progress?: number; // 0-100
};

export type MockRecentTraining = {
  id: number | string;
  title: string;
  href: string;
  accessedAt?: string; // ISO string
};

export const mockInProgressTrainings: MockInProgressTraining[] = [
  {
    id: 1,
    title: 'Stretch Routine',
    description: 'Hamstring & hip mobility',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    progress: 40,
  },
  {
    id: 2,
    title: 'Sprint Drills',
    description: 'Acceleration & mechanics',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    progress: 20,
  },
];

export const mockRecentTrainings: MockRecentTraining[] = [
  {
    id: 'r-101',
    title: 'Stretch Routine',
    href: '/flexibility',
    accessedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'r-202',
    title: 'Sprint Drills',
    href: '/test-results',
    accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'r-303',
    title: 'Core Stability',
    href: '/about',
    accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'r-404',
    title: 'Agility Ladder',
    href: '/contact',
    accessedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export function seedMyPageMocksToLocalStorage() {
  try {
    const hasInProgress = !!localStorage.getItem('inProgressTrainings');
    const hasRecent = !!localStorage.getItem('recentTrainings');
    if (!hasInProgress) {
      localStorage.setItem(
        'inProgressTrainings',
        JSON.stringify(mockInProgressTrainings)
      );
    }
    if (!hasRecent) {
      localStorage.setItem('recentTrainings', JSON.stringify(mockRecentTrainings));
    }
  } catch {
    // noop
  }
}


