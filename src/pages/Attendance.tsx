import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api, errMsg } from "../api";
import { useAuth } from "../auth";

export default function Attendance() {
  const { user } = useAuth();
  return user?.role === "STUDENT" ? <StudentView /> : <FacultyView />;
}

function StudentView() {
  const [sessionId, setSessionId] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const load = () => api.get("/attendance/me").then((r) => setHistory(r.data));
  useEffect(() => { load(); }, []);

  function mark() {
    setMsg(null); setBusy(true);
    if (!navigator.geolocation) { setMsg({ ok: false, text: "Your browser cannot share location." }); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post("/attendance/mark", { sessionId: Number(sessionId), token, lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMsg({ ok: true, text: "Attendance marked." }); setToken(""); load();
        } catch (e) { setMsg({ ok: false, text: errMsg(e) }); } finally { setBusy(false); }
      },
      () => { setMsg({ ok: false, text: "Allow location access to check in." }); setBusy(false); }
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      <section className="card max-w-md space-y-3">
        <p className="text-sm text-ink/60">Enter the session number and the code shown by your faculty. The code changes every 30 seconds. Camera scanning is available in the mobile app.</p>
        <input className="input" inputMode="numeric" placeholder="Session number" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        <input className="input uppercase tracking-widest" placeholder="Code" value={token} onChange={(e) => setToken(e.target.value)} />
        {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-lagoon/15 text-teal-900" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button className="btn w-full" disabled={busy || !sessionId || !token} onClick={mark}>{busy ? "Checking location" : "Mark attendance"}</button>
      </section>
      <section className="card">
        <h2 className="mb-2 font-medium">History</h2>
        {history.length ? history.map((h) => (
          <p key={h.id} className="border-b border-ink/5 py-2 text-sm last:border-0">{h.courseName} <span className="text-ink/50">{new Date(h.markedAt).toLocaleString()}</span></p>
        )) : <p className="text-sm text-ink/60">No attendance recorded yet.</p>}
      </section>
    </div>
  );
}

function FacultyView() {
  const [zones, setZones] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [session, setSession] = useState<any>(null);
  const [code, setCode] = useState<{ token: string; expiresInSeconds: number } | null>(null);
  const [left, setLeft] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => { api.get("/attendance/zones").then((r) => { setZones(r.data); if (r.data[0]) setZoneId(String(r.data[0].id)); }); }, []);

  const refresh = useCallback(async () => {
    if (!session) return;
    const { data } = await api.get(`/attendance/sessions/${session.id}/token`);
    setCode(data); setLeft(data.expiresInSeconds);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    refresh();
    const rotate = setInterval(refresh, 25000);
    const tick = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    const poll = setInterval(() => api.get(`/attendance/sessions/${session.id}/records`).then((r) => setRecords(r.data)), 4000);
    return () => { clearInterval(rotate); clearInterval(tick); clearInterval(poll); };
  }, [session, refresh]);

  async function start() {
    setErr("");
    try { const { data } = await api.post("/attendance/sessions", { courseName: course, zoneId: Number(zoneId) }); setSession(data); setRecords([]); }
    catch (e) { setErr(errMsg(e)); }
  }
  async function end() { await api.post(`/attendance/sessions/${session.id}/end`); setSession(null); setCode(null); }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>
      {!session ? (
        <section className="card max-w-md space-y-3">
          <input className="input" placeholder="Course name" value={course} onChange={(e) => setCourse(e.target.value)} />
          <select className="input" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name} ({z.radiusMeters} m)</option>)}
          </select>
          {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
          <button className="btn w-full" disabled={!course || !zoneId} onClick={start}>Start session</button>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-ink/60">{session.courseName}. Session number <b className="text-ink">{session.id}</b></p>
            {code && <QRCodeSVG value={JSON.stringify({ s: session.id, t: code.token })} size={200} />}
            <p className="text-3xl font-bold tracking-[0.3em]">{code?.token ?? "..."}</p>
            <div className="h-1.5 w-full overflow-hidden rounded bg-mist"><div className="h-full bg-lagoon transition-all duration-1000" style={{ width: `${(left / 30) * 100}%` }} /></div>
            <p className="text-xs text-ink/60">New code in {left}s</p>
            <button className="btn-ghost" onClick={end}>End session</button>
          </section>
          <section className="card">
            <h2 className="mb-2 font-medium">Checked in ({records.length})</h2>
            {records.length ? records.map((r) => <p key={r.id} className="border-b border-ink/5 py-2 text-sm last:border-0">{r.studentName}</p>) : <p className="text-sm text-ink/60">Students appear here as they check in.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
