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
    <div className="bg-muted flex h-screen w-screen items-center justify-center">
      <Card className="w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">404 Error</CardTitle>
          <CardDescription>Resource not found.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-muted-foreground text-sm">
            Lorem ipsum dolor sit amet.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
