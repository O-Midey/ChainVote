"use client";
import { ReactNode } from "react";

/**
 * Privy Provider wrapper.
 * 
 * To enable: npm install @privy-io/react-auth
 * Then set NEXT_PUBLIC_PRIVY_APP_ID in .env.local
 * Then uncomment the PrivyProvider import and usage below.
 */

interface Props { children: ReactNode; }

export default function AuthProvider({ children }: Props) {
  // When Privy is installed and APP_ID is set, wrap with PrivyProvider:
  //
  // import { PrivyProvider } from "@privy-io/react-auth";
  // return (
  //   <PrivyProvider
  //     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  //     config={{
  //       loginMethods: ["email", "google", "twitter", "github"],
  //       appearance: { theme: "dark", accentColor: "#d4a853" },
  //       embeddedWallets: { createOnLogin: "users-without-wallets" },
  //     }}
  //   >
  //     {children}
  //   </PrivyProvider>
  // );

  return <>{children}</>;
}
