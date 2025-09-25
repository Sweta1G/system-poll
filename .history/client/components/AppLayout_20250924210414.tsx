import Header from "@/components/ui/Header";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container py-6">{children}</main>
      <footer className="border-t mt-12">
        <div className="container py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} LivePoll. All rights reserved.
        </div>
      </footer>
    </div>
  );
}