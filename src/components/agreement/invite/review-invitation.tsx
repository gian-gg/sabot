// Review Invitation Component
// Step 1 of invite flow: Display inviter info and agreement type

interface ReviewInvitationProps {
  inviterEmail: string;
  agreementType: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ReviewInvitation({
  inviterEmail,
  agreementType,
  onAccept,
  onDecline,
}: ReviewInvitationProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <p>Review Invitation Component</p>
      <p>From: {inviterEmail}</p>
      <p>Type: {agreementType}</p>
      <button onClick={onAccept}>Accept Invitation</button>
      <button onClick={onDecline}>Decline</button>
    </div>
  );
}
