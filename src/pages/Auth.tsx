import { FormEvent, useState } from "react";
import { api, errMsg } from "../api";
import { useAuth } from "../auth";

const spots = [
  { x: 18, y: 28, label: "Block A: Algorithms, 10:00", c: "bg-lagoon" },
  { x: 64, y: 20, label: "Auditorium: Hackathon kickoff", c: "bg-signal" },
  { x: 38, y: 62, label: "Library: black wallet found", c: "bg-white" },
  { x: 74, y: 70, label: "Main gate: geofence zone", c: "bg-lagoon" },
];

export default function Auth() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [role, setRole] = useState<"STUDENT" | "FACULTY">("STUDENT");
  const [f, setF] = useState({ name: "", email: "", password: "", department: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const body = mode === "in" ? { email: f.email, password: f.password } : { ...f, role };
      const { data } = await api.post(mode === "in" ? "/auth/login" : "/auth/register", body);
      signIn(data);
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:block" aria-hidden="true">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <h1 className="relative max-w-sm text-4xl font-bold leading-tight">Your whole campus, happening right now.</h1>
        <p className="relative mt-3 max-w-sm text-white/70">Classes, events and lost things, on one live map.</p>
        {spots.map((s) => (
          <div key={s.label} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <span className="relative flex h-4 w-4">
              <span className={`pulse-ring absolute inset-0 rounded-full ${s.c}`} />
              <span className={`relative h-4 w-4 rounded-full ${s.c}`} />
            </span>
            <span className="mt-2 block whitespace-nowrap rounded-md bg-white/10 px-2 py-1 text-xs backdrop-blur">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-7">
          <div className="grid grid-cols-2 rounded-lg bg-mist p-1 text-sm font-medium">
            {(["in", "up"] as const).map((m) => (
              <button type="button" key={m} onClick={() => { setMode(m); setErr(""); }}
                className={`rounded-md py-2 ${mode === m ? "bg-white shadow-sm" : "text-ink/60"}`}>
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "up" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {(["STUDENT", "FACULTY"] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)}
                    className={`rounded-lg border p-3 text-left text-sm ${role === r ? "border-brand bg-brand/5" : "border-ink/15"}`}>
                    <div className="font-medium">{r === "STUDENT" ? "Student" : "Faculty"}</div>
                    <div className="text-xs text-ink/60">{r === "STUDENT" ? "Mark attendance, join events" : "Run classes, host events"}</div>
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Full name" value={f.name} onChange={set("name")} required />
              <input className="input" placeholder="Department" value={f.department} onChange={set("department")} />
            </>
          )}
          <input className="input" type="email" placeholder="College email" value={f.email} onChange={set("email")} required />
          <input className="input" type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set("password")} minLength={6} required />

          {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <button className="btn w-full" disabled={busy}>{busy ? "Please wait" : mode === "in" ? "Sign in" : "Create account"}</button>
          <p className="text-center text-xs text-ink/50">Admin accounts are created by your college.</p>
        </form>
      </section>
    </div>
  );
}
