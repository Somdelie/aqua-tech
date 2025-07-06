import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

export const signInWithSocials = async (provider: "google" | "github") => {
     await signIn.social({
        provider: provider,
    })
}
