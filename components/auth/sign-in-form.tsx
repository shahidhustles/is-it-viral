"use client";

import { useSignIn } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/nextjs/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthDivider, AuthError, AuthShell } from "./auth-shell";

const googleStrategy: OAuthStrategy = "oauth_google";

export function SignInForm() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const isSubmitting = fetchStatus === "fetching";
  const errorMessage = errors.global?.[0]?.message;

  async function finishSignIn() {
    await signIn.finalize({
      navigate: ({ decorateUrl }) => router.push(decorateUrl("/post-sign-in")),
    });
  }

  async function continueWithGoogle() {
    await signIn.sso({
      strategy: googleStrategy,
      redirectUrl: "/post-sign-in",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  async function requestEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await signIn.create({ identifier: email });
    if (error) return;

    const result = await signIn.emailCode.sendCode();
    if (!result.error) setIsVerifying(true);
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (!error && signIn.status === "complete") await finishSignIn();
  }

  return (
    <AuthShell>
      {isVerifying ? (
        <form className="space-y-6" onSubmit={verifyEmailCode}>
          <AuthHeading title="Check your inbox" description={`We sent a six-digit sign-in code to ${email}.`} />
          <AuthError message={errorMessage ?? errors.fields.code?.message} />
          <div className="space-y-2">
            <Label htmlFor="code">Email code</Label>
            <Input autoComplete="one-time-code" autoFocus id="code" inputMode="numeric" maxLength={6} name="code" onChange={(event) => setCode(event.target.value)} placeholder="123456" required value={code} />
          </div>
          <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">{isSubmitting ? "Verifying…" : "Continue"}</Button>
          <button className="w-full text-sm font-medium underline underline-offset-4" disabled={isSubmitting} onClick={() => void signIn.emailCode.sendCode()} type="button">Send a new code</button>
          <button className="w-full text-sm text-muted-foreground underline underline-offset-4" onClick={() => setIsVerifying(false)} type="button">Use a different email</button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={requestEmailCode}>
          <AuthHeading title="Welcome back." description="Sign in to review your reel with a private first audience." />
          <Button className="w-full bg-background" disabled={isSubmitting} onClick={() => void continueWithGoogle()} size="lg" type="button" variant="outline"><GoogleMark />Continue with Google</Button>
          <AuthDivider />
          <AuthError message={errorMessage ?? errors.fields.identifier?.message} />
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input autoComplete="email" autoFocus id="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
          </div>
          <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">{isSubmitting ? "Sending code…" : "Continue with email"}</Button>
          <p className="text-center text-sm text-muted-foreground">New here? <Link className="font-medium text-foreground underline underline-offset-4" href="/sign-up">Create an account</Link></p>
        </form>
      )}
    </AuthShell>
  );
}

function AuthHeading({ description, title }: { description: string; title: string }) {
  return <header><h1 className="text-4xl font-semibold tracking-[-0.035em]">{title}</h1><p className="mt-3 max-w-sm leading-7 text-muted-foreground">{description}</p></header>;
}

function GoogleMark() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24"><path d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.69 2.92-4.18 2.92-7.12Z" fill="#4285F4" /><path d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.58-1.98.92-3.29.92-2.53 0-4.68-1.71-5.45-4.01H3.3v2.88A9.72 9.72 0 0 0 12 21.75Z" fill="#34A853" /><path d="M6.55 13.51A5.85 5.85 0 0 1 6.25 12c0-.52.1-1.02.3-1.51V7.61H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.39l3.25-2.88Z" fill="#FBBC05" /><path d="M12 6.48c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.82 3.57 14.62 2.25 12 2.25A9.72 9.72 0 0 0 3.3 7.61l3.25 2.88C7.32 8.19 9.47 6.48 12 6.48Z" fill="#EA4335" /></svg>;
}
