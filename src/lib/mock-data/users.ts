import { User } from '@/types/user';

// Mock data for demonstration - will be replaced with real database queries
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    isVerified: true,
    rating: 4.8,
    joinDate: new Date('2023-01-15'),
    transactionCount: 24,
    trustScore: 92,
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    isVerified: true,
    rating: 4.9,
    joinDate: new Date('2023-03-20'),
    transactionCount: 18,
    trustScore: 95,
  },
  {
    id: 'user-3',
    name: 'Carlos Martinez',
    email: 'carlos.martinez@example.com',
    isVerified: true,
    rating: 4.7,
    joinDate: new Date('2023-06-10'),
    transactionCount: 15,
    trustScore: 88,
  },
  {
    id: 'user-4',
    name: 'Anna Lopez',
    email: 'anna.lopez@example.com',
    isVerified: true,
    rating: 4.6,
    joinDate: new Date('2023-08-05'),
    transactionCount: 12,
    trustScore: 85,
  },
  {
    id: 'user-5',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@example.com',
    isVerified: true,
    rating: 4.9,
    joinDate: new Date('2023-02-28'),
    transactionCount: 20,
    trustScore: 94,
  },
  {
    id: 'user-6',
    name: 'Miguel Perez',
    email: 'miguel.perez@example.com',
    isVerified: true,
    rating: 4.5,
    joinDate: new Date('2023-09-12'),
    transactionCount: 8,
    trustScore: 82,
  },
  {
    id: 'user-7',
    name: 'Elena Vargas',
    email: 'elena.vargas@example.com',
    isVerified: true,
    rating: 4.8,
    joinDate: new Date('2023-04-18'),
    transactionCount: 16,
    trustScore: 90,
  },
  {
    id: 'user-8',
    name: 'Ricardo Torres',
    email: 'ricardo.torres@example.com',
    isVerified: true,
    rating: 4.7,
    joinDate: new Date('2023-07-22'),
    transactionCount: 11,
    trustScore: 87,
  },
  {
    id: 'user-9',
    name: 'Luis Garcia',
    email: 'luis.garcia@example.com',
    isVerified: true,
    rating: 4.6,
    joinDate: new Date('2023-10-01'),
    transactionCount: 9,
    trustScore: 83,
  },
  {
    id: 'user-10',
    name: 'Carmen Flores',
    email: 'carmen.flores@example.com',
    isVerified: true,
    rating: 4.9,
    joinDate: new Date('2023-05-14'),
    transactionCount: 22,
    trustScore: 96,
  },
];

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

// Helper function to get user by email
export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}
