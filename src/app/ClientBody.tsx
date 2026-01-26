"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface ClientBodyProps {
  children: ReactNode;
}

export default function ClientBody({ children }: ClientBodyProps) {
  return <SessionProvider>{children}</SessionProvider>;
}