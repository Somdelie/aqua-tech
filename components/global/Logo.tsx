import Link from "next/link";
import React from "react";
import HubStackLogo from "./kit-logo";
import { Building2 } from "lucide-react";

export default function Logo({
  variant = "light",
  href = "/",
}: {
  variant?: "dark" | "light";
  href?: string;
}) {
  if (variant === "light") {
    return (
      <Link href={href} className="flex items-center space-x-2">
        <div className="flex items-center gap-2">
                   <Building2 className="h-6 w-6 text-sky-600" />
                   <span className="font-bold text-lg text-sky-600">WalterProjects</span>
                 </div>
      </Link>
    );
  } else {
    return (
      <Link href={"/"} className="flex items-center space-x-2">
         <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-sky-600" />
                    <span className="font-bold text-lg text-sky-600">WalterProjects</span>
                  </div>
      </Link>
    );
  }
}
