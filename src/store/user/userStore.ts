import { create } from 'zustand';
import type { VerificationStatus } from '@/types/user';

interface UserState {
  id: string;
  email: string;
  image: string;
  name: string;
  verificationStatus: VerificationStatus;
  setId: (id: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string) => void;
  setName: (name: string) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  email: '',
  image: '',
  name: '',
  verificationStatus: 'not-started',
  setId: (id) => set({ id }),
  setEmail: (email) => set({ email }),
  setImage: (image) => set({ image }),
  setName: (name) => set({ name }),
  setVerificationStatus: (status) => set({ verificationStatus: status }),
}));

export const clearUser = () => {
  useUserStore.setState({
    id: '',
    email: '',
    image: '',
    name: '',
    verificationStatus: 'not-started',
  });
};
