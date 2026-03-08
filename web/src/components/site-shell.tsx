import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const SiteShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen">
    <SiteHeader />
    <main className="container-shell pb-20 pt-8">{children}</main>
    <SiteFooter />
  </div>
);
