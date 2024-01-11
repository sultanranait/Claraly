import { createContext, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "./local-storage";

export interface ILocalStorageData {
  email: string,
  token: string,
  date: string
}

interface IAuthContext {
  email: string,
  token: string,
  date: string,
  login: (value: ILocalStorageData) => void,
  logout: () => void
}

const AuthContext = createContext<IAuthContext>({
  email: "",
  token: "",
  date: "",
  login: (value: ILocalStorageData) => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {session, setSession} = useLocalStorage("session", { email: "", token: "", date: "" });

  const login = (value: ILocalStorageData): void => {
    setSession(value);
  };

  const logout = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({
      email: session?.email ?? '',
      token: session?.token ?? '',
      date: session?.date ?? '',
      login,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};