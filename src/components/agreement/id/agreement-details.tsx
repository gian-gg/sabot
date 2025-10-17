// Agreement Details Component
// Displays key agreement information (type, duration, status, etc.)

import type { Agreement } from '@/lib/mock-data/agreements';

interface AgreementDetailsProps {
  agreement: Agreement;
}

export default function AgreementDetails({ agreement }: AgreementDetailsProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <h3>Key Details</h3>
      <p>Agreement Type: {agreement.type}</p>
      <p>Status: {agreement.status}</p>
      <p>Created: {new Date(agreement.createdAt).toLocaleDateString()}</p>
      <p>Last Updated: {new Date(agreement.updatedAt).toLocaleDateString()}</p>
      {agreement.duration && <p>Duration: {agreement.duration}</p>}
      {agreement.effectiveDate && (
        <p>Effective Date: {agreement.effectiveDate}</p>
      )}
    </div>
  );
}
