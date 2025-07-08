"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { signOut } from '@/lib/auth-client';

export default function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
