import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Upload, Scan, FileCheck } from 'lucide-react';

const verificationSteps = [
  {
    id: 1,
    title: 'Upload ID',
    description: 'Submit a government-issued identification document',
    icon: Upload,
    status: 'completed',
  },
  {
    id: 2,
    title: 'Face Scan',
    description: 'Complete biometric verification with live face scan',
    icon: Scan,
    status: 'current',
  },
  {
    id: 3,
    title: 'Read Agreements',
    description: 'Review and accept terms of service and privacy policy',
    icon: FileCheck,
    status: 'pending',
  },
];

export function VerificationSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            Account Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete these steps to verify your account and unlock full platform
            access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {verificationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.id}
                  className={`relative overflow-hidden ${
                    step.status === 'completed'
                      ? 'border-primary/50 bg-primary/5'
                      : step.status === 'current'
                        ? 'border-accent/50 bg-accent/5'
                        : 'bg-secondary/30'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                          step.status === 'completed'
                            ? 'bg-primary/20'
                            : step.status === 'current'
                              ? 'bg-accent/20'
                              : 'bg-secondary'
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            step.status === 'completed'
                              ? 'text-primary'
                              : step.status === 'current'
                                ? 'text-accent'
                                : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      {step.status === 'completed' && (
                        <CheckCircle2 className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Step {step.id}
                        </span>
                      </div>
                      <CardTitle className="text-foreground text-lg">
                        {step.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {step.description}
                    </p>
                    <Button
                      className="w-full"
                      variant={
                        step.status === 'current' ? 'default' : 'outline'
                      }
                      disabled={step.status === 'completed'}
                    >
                      {step.status === 'completed'
                        ? 'Completed'
                        : step.status === 'current'
                          ? 'Start Verification'
                          : 'Locked'}
                    </Button>
                  </CardContent>
                  {index < verificationSteps.length - 1 && (
                    <div className="bg-border absolute top-1/2 -right-3 hidden h-0.5 w-6 -translate-y-1/2 md:block" />
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 from-primary/10 bg-gradient-to-br to-transparent">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-foreground font-semibold">
              Need Help with Verification?
            </h3>
            <p className="text-muted-foreground text-sm">
              Our support team is available 24/7 to assist you
            </p>
          </div>
          <Button variant="outline">Contact Support</Button>
        </CardContent>
      </Card>
    </div>
  );
}
