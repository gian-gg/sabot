// Tell TypeScript this file contains global declarations
export {};

declare global {
  interface AuthUser {
    id: string;
    user_metadata: {
      avatar_url: string;
      full_name: string;
      email: string;
    };
    created_at: string;
    updated_at: string;
    last_sign_in_at: string | null;
  }

  interface User {
    id: string;
    email: string;
    image: string;
    name: string;
    isVerified: boolean;
  }
}
