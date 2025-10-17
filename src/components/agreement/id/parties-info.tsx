// Parties Info Component
// Displays information about both parties in the agreement

import type { Party } from '@/lib/mock-data/agreements';

interface PartiesInfoProps {
  parties: Party[];
}

export default function PartiesInfo({ parties }: PartiesInfoProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <h3>Agreement Parties</h3>
      {parties.map((party) => (
        <div key={party.id}>
          <p>
            {party.name} - {party.email}
          </p>
          <p>Verified: {party.verified ? 'Yes' : 'No'}</p>
          {party.trustScore && <p>Trust Score: {party.trustScore}</p>}
        </div>
      ))}
    </div>
  );
}
