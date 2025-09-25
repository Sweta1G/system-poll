import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Header() {
  const { pathname } = useLocation();
  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === to
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary" />
          <span className="font-bold tracking-tight">LivePoll</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" label="Home" />
          <NavLink to="/teacher" label="Teacher" />
          <NavLink to="/student" label="Student" />
        </nav>
      </div>
    </header>
  );
}
