"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      continueSignUpUrl="/sign-up"
      firstFactorUrl="/sign-in"
      resetPasswordUrl="/sign-in"
      secondFactorUrl="/sign-in"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    />
  );
}
