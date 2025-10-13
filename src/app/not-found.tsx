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

import { ROUTES } from '@/constants/routes';

export default async function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">404 Error</CardTitle>
          <CardDescription>Resource not found.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" asChild>
            <Link href={ROUTES.ROOT}>Go Back</Link>
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
