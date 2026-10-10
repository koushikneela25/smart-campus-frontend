import { FormEvent, useEffect, useState } from "react";
import { api, errMsg } from "../api";
import { useAuth } from "../auth";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [f, setF] = useState({ title: "", description: "", venue: "", startsAt: "" });
  const [msg, setMsg] = useState("");
  const load = () => api.get("/events").then((r) => setEvents(r.data));
  useEffect(() => { load(); }, []);

  async function rsvp(id: number) {
    setMsg("");
    try { await api.post(`/events/${id}/rsvp`); setMsg("You are going."); load(); } catch (e) { setMsg(errMsg(e)); }
  }
  async function create(e: FormEvent) {
    e.preventDefault(); setMsg("");
    try { await api.post("/events", f); setF({ title: "", description: "", venue: "", startsAt: "" }); load(); } catch (x) { setMsg(errMsg(x)); }
  }
  const canCreate = user?.role !== "STUDENT";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Events</h1>
      {msg && <p role="status" className="text-sm text-ink/70">{msg}</p>}
      {canCreate && (
        <form onSubmit={create} className="card grid gap-3 md:grid-cols-2">
          <input className="input" placeholder="Event title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
          <input className="input" placeholder="Venue" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} />
          <input className="input" type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} required />
          <input className="input" placeholder="Short description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <button className="btn md:col-span-2">Publish event</button>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((e) => (
          <article key={e.id} className="card">
            <h2 className="font-medium">{e.title}</h2>
            <p className="text-sm text-ink/60">{new Date(e.startsAt).toLocaleString()} at {e.venue}</p>
            <p className="mt-2 text-sm">{e.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink/60">{e.rsvpCount} going</span>
              <button className="btn" onClick={() => rsvp(e.id)}>RSVP</button>
            </div>
          </article>
        ))}
        {!events.length && <p className="text-sm text-ink/60">No events yet.</p>}
      </div>
    </div>
  );
}
