import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSession } from '@/lib/auth/server';

import { ROUTES } from '@/constants/routes';

export default async function LoginPage() {
  const session = await getSession();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Card className="w-lg">
        <CardHeader>
          <CardTitle>sabot</CardTitle>
          <CardDescription>Lorem ipsum dolor sit amet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full">
            {session ? (
              <Link href={ROUTES.HOME.ROOT}>Home</Link>
            ) : (
              <Link href={ROUTES.AUTH.SIGN_UP}>Get Started</Link>
            )}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link target="_blank" href={ROUTES.SOCIALS.GITHUB}>
              GitHub Repo
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground text-sm">
            Lorem ipsum dolor sit amet.
          </p>
        </CardFooter>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Made with ♥ by{' '}
        <a href={ROUTES.SOCIALS.GITHUB} target="_blank" rel="noreferrer">
          untitled
        </a>
      </div>
    </div>
  );
}
