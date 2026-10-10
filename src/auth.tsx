import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "STUDENT" | "FACULTY" | "ADMIN";
export type User = { name: string; email: string; role: Role };
type Ctx = { user: User | null; signIn: (d: User & { token: string }) => void; signOut: () => void };

const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const signIn = (d: User & { token: string }) => {
    const u = { name: d.name, email: d.email, role: d.role };
    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };
  const signOut = () => {
    localStorage.clear();
    setUser(null);
  };
  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
