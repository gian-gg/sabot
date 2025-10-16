import { create } from 'zustand';

interface UserState {
  id: string;
  email: string;
  image: string;
  name: string;
  isVerified: boolean;
  setId: (id: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string) => void;
  setName: (name: string) => void;
  setIsVerified: (isVerified: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  email: '',
  image: '',
  name: '',
  isVerified: false,
  setId: (id) => set({ id }),
  setEmail: (email) => set({ email }),
  setImage: (image) => set({ image }),
  setName: (name) => set({ name }),
  setIsVerified: (isVerified) => set({ isVerified }),
}));

export const clearUser = () => {
  useUserStore.setState({
    id: '',
    email: '',
    image: '',
    name: '',
    isVerified: false,
  });
};
