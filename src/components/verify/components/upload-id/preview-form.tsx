import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GovernmentIdInfo } from '@/types/verify';
import { getFormValueOrNull } from '@/lib/utils/helpers';

const PreviewForm = ({
  extractedData,
  setForm,
  setUserData,
}: {
  extractedData: GovernmentIdInfo | null;
  setForm: React.Dispatch<React.SetStateAction<GovernmentIdInfo | null>>;
  setUserData: (u: GovernmentIdInfo | null) => void;
}) => {
  // Refs to avoid re-creating handlers and to minimize re-renders
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const latestExtractedRef = React.useRef<GovernmentIdInfo | null>(
    extractedData
  );
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastSentSnapshotRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    latestExtractedRef.current = extractedData;
  }, [extractedData]);

  // Debounced autosave to avoid excessive updates on every keystroke
  const scheduleAutoSave = React.useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const formEl = formRef.current;
      if (!formEl) return;
      const formData = new FormData(formEl);
      const base = latestExtractedRef.current;

      const updated: GovernmentIdInfo | null = base
        ? {
            ...base,
            idNumber: getFormValueOrNull(formData.get('idNumber')),
            firstName: getFormValueOrNull(formData.get('firstName')),
            middleName: getFormValueOrNull(formData.get('middleName')),
            lastName: getFormValueOrNull(formData.get('lastName')),
            dateOfBirth: getFormValueOrNull(formData.get('dateOfBirth')),
            issueDate: getFormValueOrNull(formData.get('issueDate')),
            expiryDate: getFormValueOrNull(formData.get('expiryDate')),
            address: getFormValueOrNull(formData.get('address')),
            sex: getFormValueOrNull(formData.get('sex')),
          }
        : null;

      // Only propagate if there's a real change to minimize upstream re-renders
      const snapshot = JSON.stringify(updated);
      if (snapshot !== lastSentSnapshotRef.current) {
        setForm(() => updated);
        setUserData(updated);
        lastSentSnapshotRef.current = snapshot;
      }
    }, 300);
  }, [setForm, setUserData]);

  React.useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    []
  );

  return (
    <form
      ref={formRef}
      onInput={scheduleAutoSave}
      onChange={scheduleAutoSave}
      className="mb-8 space-y-4"
    >
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
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            name="idNumber"
            defaultValue={extractedData?.idNumber ?? ''}
            placeholder="ID Number"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={extractedData?.firstName ?? ''}
            placeholder="First Name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            name="middleName"
            defaultValue={extractedData?.middleName ?? ''}
            placeholder="Middle Name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={extractedData?.lastName ?? ''}
            placeholder="Last Name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            defaultValue={extractedData?.dateOfBirth ?? ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sex">Sex</Label>
          <Input
            id="sex"
            name="sex"
            defaultValue={extractedData?.sex ?? ''}
            placeholder="Sex"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            name="issueDate"
            defaultValue={extractedData?.issueDate ?? ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            name="expiryDate"
            defaultValue={extractedData?.expiryDate ?? ''}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <textarea
            id="address"
            name="address"
            defaultValue={extractedData?.address ?? ''}
            rows={3}
            className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-primary w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            placeholder="Address"
          />
        </div>
      </div>
    </form>
  );
};

export default PreviewForm;
