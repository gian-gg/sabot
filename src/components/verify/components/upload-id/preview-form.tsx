import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GovernmentIdInfo } from '@/types/verify';

interface PreviewFormProps {
  extractedData: GovernmentIdInfo | null;
  setForm: React.Dispatch<React.SetStateAction<GovernmentIdInfo | null>>;
}

const PreviewForm: React.FC<PreviewFormProps> = ({
  extractedData,
  setForm,
}) => {
  return (
    <div className="mb-8 space-y-4">
      {extractedData?.notes && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-900 dark:text-yellow-100"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm">Image quality note: {extractedData.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="idType">ID Type</Label>
          <Input
            id="idType"
            value={extractedData?.idType ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, idType: e.target.value } : prev
              )
            }
            placeholder="e.g., Passport"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            value={extractedData?.idNumber ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, idNumber: e.target.value } : prev
              )
            }
            placeholder="ID Number"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={extractedData?.firstName ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, firstName: e.target.value } : prev
              )
            }
            placeholder="First Name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={extractedData?.middleName ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, middleName: e.target.value } : prev
              )
            }
            placeholder="Middle Name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={extractedData?.lastName ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, lastName: e.target.value } : prev
              )
            }
            placeholder="Last Name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={extractedData?.dateOfBirth ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, dateOfBirth: e.target.value } : prev
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={extractedData?.issueDate ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, issueDate: e.target.value } : prev
              )
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            value={extractedData?.expiryDate ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, expiryDate: e.target.value } : prev
              )
            }
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <textarea
            id="address"
            value={extractedData?.address ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, address: e.target.value } : prev
              )
            }
            rows={3}
            className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            placeholder="Address"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sex">Sex</Label>
          <Input
            id="sex"
            value={extractedData?.sex ?? ''}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, sex: e.target.value } : prev
              )
            }
            placeholder="Sex"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;
