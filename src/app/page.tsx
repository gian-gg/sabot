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

export default async function LoginPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Card className="w-lg">
        <CardHeader>
          <CardTitle>sabot</CardTitle>
          <CardDescription>Lorem ipsum dolor sit amet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link target="_blank" href="https://github.com/gian-gg/sabot">
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
        <a
          href="https://github.com/gian-gg/sabot"
          target="_blank"
          rel="noreferrer"
        >
          untitled
        </a>
      </div>
    </div>
  );
}
