import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountGame } from "@/components/game/account-game";
import { GuestGate } from "@/components/game/guest-gate";
import { getSessionUser, socketToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Jugar · Chamusqueros" };

export default async function PlayPage() {
  const user = await getSessionUser();
  if (user) return <AccountGame token={socketToken(user)} />;
  if (process.env.NEXT_PUBLIC_ALLOW_GUESTS === "true") return <GuestGate />;
  redirect("/login?next=/jugar");
}
