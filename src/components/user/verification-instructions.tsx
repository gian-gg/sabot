import { Card } from '@/components/ui/card';
import {
  Bell,
  CreditCard,
  QrCode,
  ScanFace,
  Smartphone,
  UserCheck,
} from 'lucide-react';

export function VerificationInstructions() {
  const steps = [
    {
      icon: CreditCard,
      title: 'ID Verification',
      description:
        "Upload a clear photo of your valid government-issued ID (passport, driver's license, or national ID card).",
      color: 'blue',
    },
    {
      icon: ScanFace,
      title: 'Liveness Check',
      description:
        "Complete a live selfie capture to verify you're a real person. Follow the on-screen prompts.",
      color: 'purple',
    },
    {
      icon: UserCheck,
      title: 'Face Match',
      description:
        'Our system will automatically verify that your selfie matches the photo on your ID.',
      color: 'green',
    },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-400 uppercase">
          Verification Process
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-neutral-800 bg-black/40 p-6 transition-colors hover:border-neutral-700"
              >
                <div className="bg-grid-white/[0.02] absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        step.color === 'blue'
                          ? 'bg-blue-500/10 text-blue-500'
                          : step.color === 'purple'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-green-500/10 text-green-500'
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="flex size-6 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-400">
                      {index + 1}
                    </span>
                  </div>

                  <h4 className="mb-2 font-semibold text-white">
                    {step.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Information */}
      <Card className="border-neutral-800 bg-black/40 p-6">
        <div className="space-y-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-neutral-400 uppercase">
              How It Works
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <Smartphone className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Powered by Didit
                  </p>
                  <p className="text-sm text-neutral-400">
                    Clicking &quot;Verify Identity&quot; redirects you to
                    Didit&apos;s secure verification platform.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <QrCode className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mobile Only</p>
                  <p className="text-sm text-neutral-400">
                    Verification requires a mobile device. On desktop, scan the
                    QR code with your phone to continue.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                  <Bell className="size-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Pending Review
                  </p>
                  <p className="text-sm text-neutral-400">
                    After completing all steps, your submission will be reviewed
                    by our team. You&apos;ll be notified once approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
