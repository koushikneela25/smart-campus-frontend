import { FormEvent, useEffect, useState } from "react";
import { api, errMsg } from "../api";

const empty = { kind: "LOST", title: "", description: "", category: "", location: "", imageUrl: "" };

export default function LostFound() {
  const [items, setItems] = useState<any[]>([]);
  const [f, setF] = useState(empty);
  const [matches, setMatches] = useState<Record<number, any[]>>({});
  const [msg, setMsg] = useState("");
  const load = () => api.get("/lostfound").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const set = (k: string) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });

  async function report(e: FormEvent) {
    e.preventDefault(); setMsg("");
    try { await api.post("/lostfound", f); setF(empty); load(); } catch (x) { setMsg(errMsg(x)); }
  }
  async function find(id: number) {
    const { data } = await api.get(`/lostfound/${id}/matches`);
    setMatches({ ...matches, [id]: data });
  }
  async function resolve(id: number) {
    try { await api.patch(`/lostfound/${id}/resolve`); load(); } catch (x) { setMsg(errMsg(x)); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lost & found</h1>
      <form onSubmit={report} className="card grid gap-3 md:grid-cols-2">
        <select className="input" value={f.kind} onChange={set("kind")}>
          <option value="LOST">I lost something</option>
          <option value="FOUND">I found something</option>
        </select>
        <input className="input" placeholder="What is it? (black wallet)" value={f.title} onChange={set("title")} required />
        <input className="input" placeholder="Category (wallet, phone, ID card)" value={f.category} onChange={set("category")} />
        <input className="input" placeholder="Where (Library, Block A)" value={f.location} onChange={set("location")} />
        <input className="input md:col-span-2" placeholder="Details that identify it" value={f.description} onChange={set("description")} />
        <input className="input md:col-span-2" placeholder="Photo link (optional)" value={f.imageUrl} onChange={set("imageUrl")} />
        {msg && <p role="alert" className="text-sm text-red-700 md:col-span-2">{msg}</p>}
        <button className="btn md:col-span-2">Post report</button>
      </form>

      <div className="space-y-3">
        {items.filter((i) => !i.resolved).map((i) => (
          <article key={i.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className={`mr-2 rounded px-1.5 py-0.5 text-xs ${i.kind === "LOST" ? "bg-signal/30" : "bg-lagoon/20"}`}>{i.kind === "LOST" ? "Lost" : "Found"}</span>
                <b>{i.title}</b> <span className="text-sm text-ink/60">{i.location}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => find(i.id)}>Find matches</button>
                <button className="btn-ghost" onClick={() => resolve(i.id)}>Mark resolved</button>
              </div>
            </div>
            {i.description && <p className="mt-2 text-sm text-ink/70">{i.description}</p>}
            {matches[i.id] && (
              <div className="mt-3 border-t border-ink/10 pt-3 text-sm">
                {matches[i.id].length ? matches[i.id].map((m) => (
                  <p key={m.item.id}><b>{m.score}% match</b>: {m.item.title}, {m.item.location}</p>
                )) : <p className="text-ink/60">No close matches yet. We will keep looking as new reports come in.</p>}
              </div>
            )}
          </article>
        ))}
        {!items.some((i) => !i.resolved) && <p className="text-sm text-ink/60">Nothing reported yet.</p>}
      </div>
    </div>
  );
}
