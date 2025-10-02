import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

const handler = () => toNextJsHandler(auth); // Ensures auth is only accessed at request time, not at module evaluation during build

export const POST = (req: Request) => handler().POST(req);
export const GET = (req: Request) => handler().GET(req);
