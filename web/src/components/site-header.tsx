import Link from "next/link";
import { DEFAULT_AREA_LABEL, SITE_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "概要" },
  { href: "/map", label: "地図" },
  { href: "/places", label: "一覧" },
  { href: "/submit", label: "投稿" },
  { href: "/takedown", label: "削除申請" },
  { href: "/admin", label: "管理" },
];

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur">
    <div className="container-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-white">
            SN
          </div>
          <div>
            <p className="heading-display text-xl font-bold">{SITE_NAME}</p>
            <p className="text-sm text-muted">{DEFAULT_AREA_LABEL} 対応の承認制MVP</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-line bg-card px-4 py-2 transition hover:border-accent/40 hover:text-accent-strong"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);
