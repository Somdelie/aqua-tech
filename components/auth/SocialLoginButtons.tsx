import { Button } from "@/components/ui/button";
import { Icons } from "./Icons";
import { signInWithSocials } from '@/lib/auth-client';


export function SocialLoginButtons() {

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      await signInWithSocials(provider);
    } catch (error) {
      console.error("Social login failed:", error);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 w-full">
      <Button type="button" variant="outline" onClick={() => handleSignIn("google")}>
        <Icons.google />
        <span>Google</span>
      </Button>
      <Button type="button" variant="outline" onClick={() => handleSignIn("github")}>
        <Icons.gitHub />
        <span>Github</span>
      </Button>
    </div>
  );
}