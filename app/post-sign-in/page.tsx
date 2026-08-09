import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PostSignInRedirect } from "@/components/auth/post-sign-in-redirect";

export default async function PostSignInPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/post-sign-in");
  }

  return <PostSignInRedirect />;
}
