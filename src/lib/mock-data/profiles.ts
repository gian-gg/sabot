import type { PublicUserProfile, ProfileTransaction } from '@/types/profile';
import type { TransactionType } from '@/types/transaction';

// Sample transaction histories for different users
const createMockTransactions = (
  userId: string,
  count: number
): ProfileTransaction[] => {
  const transactions: ProfileTransaction[] = [];
  const types: TransactionType[] = [
    'electronics',
    'services',
    'fashion',
    'home-goods',
    'vehicles',
  ];
  const statuses = ['completed', 'active', 'pending', 'reported', 'disputed'];
  const titles = [
    'iPhone 13 Pro Max',
    'MacBook Pro 2021',
    'Gaming PC Setup',
    'Web Design Services',
    'Photography Session',
    'Vintage Leather Jacket',
    'Designer Handbag',
    'Office Furniture Set',
    'Mountain Bike',
    'Honda Civic 2018',
  ];

  for (let i = 0; i < count; i++) {
    const createdDate = new Date();
    createdDate.setDate(
      createdDate.getDate() - Math.floor(Math.random() * 180)
    );

    const status =
      i < count * 0.8 ? 'completed' : statuses[i % statuses.length];
    const hasAmount = Math.random() > 0.3;

    transactions.push({
      id: `tx-${userId}-${i}`,
      type: types[i % types.length],
      status: status as ProfileTransaction['status'],
      title: titles[i % titles.length],
      amount: hasAmount ? Math.floor(Math.random() * 5000) + 100 : undefined,
      currency: hasAmount ? '$' : undefined,
      counterpartyName: `User ${Math.floor(Math.random() * 100)}`,
      completedAt:
        status === 'completed'
          ? new Date(createdDate.getTime() + 86400000 * 7).toISOString()
          : undefined,
      createdAt: createdDate.toISOString(),
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Calculate realistic stats based on transactions
const calculateStats = (transactions: ProfileTransaction[]) => {
  const completed = transactions.filter((t) => t.status === 'completed').length;
  const active = transactions.filter((t) =>
    ['active', 'pending', 'both_joined'].includes(t.status)
  ).length;

  return {
    totalTransactions: transactions.length,
    completedTransactions: completed,
    activeTransactions: active,
    completionRate:
      transactions.length > 0
        ? Math.round((completed / transactions.length) * 100)
        : 0,
  };
};

export const mockUserProfiles: PublicUserProfile[] = [
  {
    id: 'user-1',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    avatar: undefined,
    isVerified: true,
    stats: {
      ...calculateStats(createMockTransactions('user-1', 24)),
      trustScore: 92,
      rating: 4.8,
      joinDate: new Date('2023-01-15').toISOString(),
      responseTime: 'within 1 hour',
    },
    recentTransactions: createMockTransactions('user-1', 24),
    memberSince: 'January 2023',
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    avatar: undefined,
    isVerified: true,
    stats: {
      ...calculateStats(createMockTransactions('user-2', 18)),
      trustScore: 95,
      rating: 4.9,
      joinDate: new Date('2023-03-20').toISOString(),
      responseTime: 'within 2 hours',
    },
    recentTransactions: createMockTransactions('user-2', 18),
    memberSince: 'March 2023',
  },
  {
    id: 'user-3',
    name: 'Carlos Martinez',
    email: 'carlos.martinez@example.com',
    avatar: undefined,
    isVerified: true,
    stats: {
      ...calculateStats(createMockTransactions('user-3', 15)),
      trustScore: 88,
      rating: 4.7,
      joinDate: new Date('2023-06-10').toISOString(),
      responseTime: 'within 3 hours',
    },
    recentTransactions: createMockTransactions('user-3', 15),
    memberSince: 'June 2023',
  },
  {
    id: 'user-4',
    name: 'Anna Lopez',
    email: 'anna.lopez@example.com',
    avatar: undefined,
    isVerified: true,
    stats: {
      ...calculateStats(createMockTransactions('user-4', 12)),
      trustScore: 85,
      rating: 4.6,
      joinDate: new Date('2023-08-05').toISOString(),
      responseTime: 'within 2 hours',
    },
    recentTransactions: createMockTransactions('user-4', 12),
    memberSince: 'August 2023',
  },
  {
    id: 'user-5',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@example.com',
    avatar: undefined,
    isVerified: true,
    stats: {
      ...calculateStats(createMockTransactions('user-5', 20)),
      trustScore: 94,
      rating: 4.9,
      joinDate: new Date('2023-02-28').toISOString(),
      responseTime: 'within 30 minutes',
    },
    recentTransactions: createMockTransactions('user-5', 20),
    memberSince: 'February 2023',
  },
];

/**
 * Get user profile by ID
 */
export function getUserProfile(userId: string): PublicUserProfile | undefined {
  return mockUserProfiles.find((profile) => profile.id === userId);
}

/**
 * Get user profile with fallback for unknown users
 */
export function getUserProfileOrDefault(userId: string): PublicUserProfile {
  const profile = getUserProfile(userId);

  if (profile) {
    return profile;
  }

  // Return a default profile for unknown users
  return {
    id: userId,
    name: 'Unknown User',
    isVerified: false,
    stats: {
      totalTransactions: 0,
      completedTransactions: 0,
      activeTransactions: 0,
      trustScore: 0,
      rating: 0,
      joinDate: new Date().toISOString(),
    },
    recentTransactions: [],
    memberSince: 'Recently',
  };
}
