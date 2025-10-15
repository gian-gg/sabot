import { create } from 'zustand';

interface UserState {
  id: string;
  email: string;
  image: string;
  name: string;
  setId: (id: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string) => void;
  setName: (name: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: '',
  email: '',
  image: '',
  name: '',
  setId: (id) => set({ id }),
  setEmail: (email) => set({ email }),
  setImage: (image) => set({ image }),
  setName: (name) => set({ name }),
}));

export const populateUser = (
  id: string,
  email: string,
  image: string,
  name: string
) => {
  useUserStore.setState({
    id: id,
    email: email,
    image: image,
    name: name,
  });
};

export const clearUser = () => {
  useUserStore.setState({
    id: '',
    email: '',
    image: '',
    name: '',
  });
};
