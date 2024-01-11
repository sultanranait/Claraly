import axios from "axios";
import { ChakraProvider, theme } from "@chakra-ui/react";
import Navbar from "./components/nav/navbar";
import Settings from "./components/settings/settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Medical from "./components/medical";
import Patients from "./components/medical/patients";
import { MetriportMedicalApi } from "@metriport/api-sdk";
import Auth from "./components/auth";
import { MedicalAppStateProvider } from "./components/contexts/medical";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { AuthProvider } from "./components/hooks/auth-context";

export const App = () => {
  const timeoutMillis = 29000;
  // Verbose so we use more combinations of the SDK's constructor
  const headers: Record<string, string> = {
    [MetriportMedicalApi.headers.clientApp]: "Metriport-Dashboard",
    Zeta: "zeta-zeta",
  };

  const options = {
    axios,
    baseAddress: "https://api.sandbox.metriport.com",
    timeout: timeoutMillis,
    crossOriginIsolated: true,
    ...headers,
  };
  const metriportAPI = new MetriportMedicalApi(
    process.env.REACT_APP_METRIPORT_API_KEY ?? "",
    options
  );

  return (
    <main>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <MedicalAppStateProvider>
              <Navbar
                children={
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Medical />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="patients"
                      element={<ProtectedRoute><Patients api={metriportAPI} /></ProtectedRoute>}
                    />
                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                }
                user={undefined}
              />
            </MedicalAppStateProvider>
          </AuthProvider>
        </ChakraProvider>
      </BrowserRouter>
    </main>
  );
};
