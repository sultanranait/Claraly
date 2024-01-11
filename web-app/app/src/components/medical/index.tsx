import { Box } from "@chakra-ui/react";
import { MetriportMedicalApi } from "./client/metriport";
import axios from "axios";
import { MedicalAppStateProvider } from "../contexts/medical";
import MedicalDash from "./dash";
import { useEffect, useState } from "react";
import { api } from "../shared/api";
export default function Medical() {
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  // ensure user token is loaded into the api
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
    <>
      <Box p={10}>
        <MedicalDash api={metriportAPI}></MedicalDash>
      </Box>
    </>
  );
}
