import { Zap } from "lucide-react";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(20rem,0.9fr)_minmax(28rem,1.1fr)]">
      <section className="relative hidden overflow-hidden border-r border-foreground bg-[radial-gradient(circle_at_24%_22%,rgba(163,230,53,0.36),transparent_25rem)] p-10 lg:flex lg:flex-col">
        <Link className="flex w-fit items-center gap-3 font-semibold tracking-tight" href="/">
          <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-foreground bg-primary">
            <Zap aria-hidden="true" className="size-4" />
          </span>
          Is It Viral
        </Link>
        <div className="my-auto max-w-md">
          <p className="text-sm font-medium">A first audience for every draft.</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.04em]">
            Make the next edit before the real post goes live.
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-8 text-muted-foreground">
            Tell us who you want to reach, then see how a reel could land before you post.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Clear feedback. Your call, always.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link className="mb-12 flex w-fit items-center gap-3 font-semibold tracking-tight lg:hidden" href="/">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-foreground bg-primary">
              <Zap aria-hidden="true" className="size-4" />
            </span>
            Is It Viral
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      or continue with email
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive" role="alert">{message}</p>;
}
