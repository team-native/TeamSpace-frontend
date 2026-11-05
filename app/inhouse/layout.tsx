import type { ReactNode } from "react";
import AuthGate from "@/components/inhouse/AuthGate";

export default function InhouseLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
