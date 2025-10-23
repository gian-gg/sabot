import { create } from 'zustand';
import type { VerificationStatus, UserRole } from '@/types/user';

interface UserState extends User {
  setId: (id: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string) => void;
  setName: (name: string) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setUserRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  email: '',
  image: '',
  name: '',
  verificationStatus: 'not-started',
  role: 'user',
  setId: (id) => set({ id }),
  setEmail: (email) => set({ email }),
  setImage: (image) => set({ image }),
  setName: (name) => set({ name }),
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  setUserRole: (role) => set({ role }),
}));

export const clearUser = () => {
  useUserStore.setState({
    id: '',
    email: '',
    image: '',
    name: '',
    verificationStatus: 'not-started',
    role: 'user',
  });
};
