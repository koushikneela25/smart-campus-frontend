import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

const links = [
  { to: "/", label: "Today" },
  { to: "/attendance", label: "Attendance" },
  { to: "/events", label: "Events" },
  { to: "/lostfound", label: "Lost & found" },
];

export default function Shell() {
  const { user, signOut } = useAuth();
  const cls = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand text-white" : "text-ink/70 hover:bg-ink/5"}`;
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-ink/10 bg-white p-4 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="mb-4 flex items-center justify-between md:mb-8 md:block">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="relative inline-flex h-3 w-3">
              <span className="pulse-ring absolute inset-0 rounded-full bg-signal" />
              <span className="relative h-3 w-3 rounded-full bg-signal" />
            </span>
            CampusPulse
          </div>
          <div className="text-right text-xs text-ink/60 md:mt-4 md:text-left">
            <div className="font-medium text-ink">{user?.name}</div>
            <div>{user?.role.toLowerCase()}</div>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={cls}>{l.label}</NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="btn-ghost mt-4 w-full md:mt-8">Sign out</button>
      </aside>
      <main className="mx-auto w-full max-w-4xl p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
