import { useNavigate } from "@tanstack/react-router";
import { signOut } from "../../server/auth/auth-client";
import { Badge } from "../ui/Badge";

type NavbarProps = {
  userName: string;
  role: "admin" | "pengantin";
  onMenuClick: () => void;
};

const roleLabel: Record<NavbarProps["role"], string> = {
  admin: "Admin",
  pengantin: "Pengantin",
};

export function Navbar({ userName, role, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-(--color-surface-container-lowest) px-4 py-3 shadow-[0_2px_12px_rgba(45,71,57,0.05)] md:px-8">
      <button
        aria-label="Buka menu"
        onClick={onMenuClick}
        className="rounded p-2 hover:bg-(--color-surface-container) md:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 5h16M2 10h16M2 15h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-3 md:ml-auto">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-(--color-on-surface)">
            {userName}
          </p>
          <p className="text-xs text-(--color-on-surface-variant)">
            {roleLabel[role]}
          </p>
        </div>
        <Badge>{userName.charAt(0).toUpperCase()}</Badge>
        <button
          onClick={handleLogout}
          className="rounded border border-(--color-primary) px-4 py-2 text-sm font-medium text-(--color-primary) transition hover:bg-(--color-primary-container)/40"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
