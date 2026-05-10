"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, List, Menu, X, User, Heart, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/useUserStore";

const navItems = [
  { href: "/", label: "지도", icon: MapPin },
  { href: "/explore", label: "탐색", icon: List },
  { href: "/wishlist", label: "가고싶다", icon: Heart },
  { href: "/visited", label: "다녀왔어요", icon: CheckCircle2 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { nickname, hydrated } = useUserStore();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
              🤔
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: "#0f172a" }}>
              오늘 <span style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>뭐하지?</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === href
                    ? "text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                )}
                style={pathname === href
                  ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" }
                  : {}}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {hydrated && (
              <Link
                href="/profile"
                title={nickname || "프로필"}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-bold transition-all",
                  pathname === "/profile"
                    ? "text-white shadow-sm"
                    : "text-slate-600 hover:bg-white/60"
                )}
                style={pathname === "/profile" ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
              >
                {nickname ? (
                  <>
                    <span className="text-base leading-none">{nickname.split(" ")[0]}</span>
                    <span className="text-xs hidden sm:inline max-w-[80px] truncate">{nickname.split(" ").slice(1).join(" ") || nickname}</span>
                  </>
                ) : (
                  <>
                    <User size={15} />
                    <span className="text-xs hidden sm:inline">로그인</span>
                  </>
                )}
              </Link>
            )}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/20 px-4 py-3 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  pathname === href
                    ? "text-white"
                    : "text-slate-600 hover:bg-white/60"
                )}
                style={pathname === href ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
