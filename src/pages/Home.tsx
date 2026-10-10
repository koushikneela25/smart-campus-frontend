import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get("/events").then((r) => setEvents(r.data.slice(0, 3)));
    api.get("/lostfound").then((r) => setItems(r.data.filter((i: any) => !i.resolved).slice(0, 3)));
    if (user?.role === "STUDENT") api.get("/attendance/me").then((r) => setHistory(r.data.slice(0, 3)));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hi {user?.name.split(" ")[0]}, here is your campus today.</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-medium">{user?.role === "STUDENT" ? "Your latest check-ins" : "Class attendance"}</h2>
          {user?.role === "STUDENT" ? (
            history.length ? history.map((h) => (
              <p key={h.id} className="border-b border-ink/5 py-2 text-sm last:border-0">{h.courseName} <span className="text-ink/50">{new Date(h.markedAt).toLocaleString()}</span></p>
            )) : <p className="text-sm text-ink/60">No check-ins yet. Open Attendance when your class starts.</p>
          ) : <p className="text-sm text-ink/60">Start a session from Attendance to show a live QR code to your class.</p>}
          <Link to="/attendance" className="btn mt-4">Open attendance</Link>
        </section>

        <section className="card">
          <h2 className="mb-3 font-medium">Coming up</h2>
          {events.length ? events.map((e) => (
            <p key={e.id} className="border-b border-ink/5 py-2 text-sm last:border-0">{e.title} <span className="text-ink/50">{new Date(e.startsAt).toLocaleDateString()} at {e.venue}</span></p>
          )) : <p className="text-sm text-ink/60">No events yet.</p>}
          <Link to="/events" className="btn-ghost mt-4">See all events</Link>
        </section>

        <section className="card md:col-span-2">
          <h2 className="mb-3 font-medium">Recently reported</h2>
          {items.length ? items.map((i) => (
            <p key={i.id} className="border-b border-ink/5 py-2 text-sm last:border-0">
              <span className={`mr-2 rounded px-1.5 py-0.5 text-xs ${i.kind === "LOST" ? "bg-signal/30" : "bg-lagoon/20"}`}>{i.kind === "LOST" ? "Lost" : "Found"}</span>
              {i.title} <span className="text-ink/50">{i.location}</span>
            </p>
          )) : <p className="text-sm text-ink/60">Nothing reported. Lost something? Report it in Lost & found.</p>}
        </section>
      </div>
    </div>
  );
}
