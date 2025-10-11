import { create } from 'zustand';

interface UserState extends User {
  setId: (id: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  name: '',
  email: '',
  image: '',
  setId: (id) => set({ id }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setImage: (image) => set({ image }),
}));

export const populateUser = (user: User) => {
  useUserStore.setState({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  });
};

export const clearUser = () => {
  useUserStore.setState({
    id: '',
    name: '',
    email: '',
    image: '',
  });
};
