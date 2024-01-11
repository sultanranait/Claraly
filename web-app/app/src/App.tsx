import axios from "axios";
import { ChakraProvider, theme } from "@chakra-ui/react";
import Navbar from "./components/nav/navbar";
import Settings from "./components/settings/settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
// import Home from "./components/home/home";
import Medical from "./components/medical";
import Patients from "./components/medical/patients";
// import { MetriportMedicalApi } from "./components/medical/client/metriport";
import { MetriportMedicalApi } from "@metriport/api-sdk";
import Auth from "./components/auth";
import { MedicalAppStateProvider } from "./components/contexts/medical";

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
          <MedicalAppStateProvider>
            <Navbar
              children={
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Medical></Medical>} />
                  <Route path="patients" element={<Patients api={metriportAPI}/>} />÷
                  <Route path="settings" element={<Settings></Settings>} />
                </Routes>
              }
              signOut={() => console.log("signOut")}
              user={undefined}
            />
          </MedicalAppStateProvider>
        </ChakraProvider>
      </BrowserRouter>
    </main>
  );
};
