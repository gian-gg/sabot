// Tell TypeScript this file contains global declarations
export {};

declare global {
  interface User {
    name: string;
    email: string;
    image?: string;
    id?: string;
  }
}
