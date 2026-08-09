import { Button } from "@/components/ui/button";

type AccountDnaRecordProps = {
  account: {
    niche: string;
    intendedAudience: string;
    primaryLanguage: string;
    region: string;
  };
  onEdit: () => void;
};

export function AccountDnaRecord({ account, onEdit }: AccountDnaRecordProps) {
  return (
    <section aria-labelledby="account-dna-heading" className="max-w-3xl space-y-5 border-t border-border pt-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight" id="account-dna-heading">Your audience details</h2>
        <p className="text-muted-foreground">These details help make your reel feedback relevant.</p>
      </div>
      <dl className="divide-y divide-border border-y border-border">
        <AccountDnaRecordRow label="Account focus" value={account.niche} />
        <AccountDnaRecordRow label="Intended audience" value={account.intendedAudience} />
        <AccountDnaRecordRow label="Primary language" value={account.primaryLanguage} />
        <AccountDnaRecordRow label="Region" value={account.region} />
      </dl>
      <Button onClick={onEdit} size="lg" variant="outline">Edit audience details</Button>
    </section>
  );
}

export function AccountDnaRecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}
