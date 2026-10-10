import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import Shell from "./components/Shell";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import Events from "./pages/Events";
import LostFound from "./pages/LostFound";

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route element={user ? <Shell /> : <Navigate to="/auth" replace />}>
        <Route index element={<Home />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="events" element={<Events />} />
        <Route path="lostfound" element={<LostFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
