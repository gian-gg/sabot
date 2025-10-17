// Agreement Link Component
// Displays shareable link with copy functionality and email invitation option

interface AgreementLinkProps {
  link: string;
  onCopy: () => void;
  copied: boolean;
  onOpenDialog: () => void;
}

export default function AgreementLink({
  link,
  onCopy,
  copied,
  onOpenDialog,
}: AgreementLinkProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <p>Agreement Link Component</p>
      <p>Link: {link}</p>
      <button onClick={onCopy}>{copied ? 'Copied!' : 'Copy Link'}</button>
      <button onClick={onOpenDialog}>Send via Email</button>
    </div>
  );
}
