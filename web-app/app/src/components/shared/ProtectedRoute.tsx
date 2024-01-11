import { ReactElement, useEffect } from "react"
import { useAuth } from "../hooks/auth-context"
import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const auth = useAuth()
  return !!auth?.token ? children : <Navigate to={"/auth"} /> 
}

export default ProtectedRoute;