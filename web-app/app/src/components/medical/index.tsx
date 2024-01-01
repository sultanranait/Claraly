import {
  Box,
} from "@chakra-ui/react";
import { MetriportMedicalApi } from "./client/metriport";
import axios from "axios";
import { MedicalAppStateProvider } from "../contexts/medical";
import MedicalDash from "./dash";
import { useEffect, useState } from 'react';
import { fetchUserToken } from '../shared/util';
import { api } from '../shared/api';
export default function Medical() {
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  // ensure user token is loaded into the api
  useEffect(() => {
    fetchUserToken()
      .then(token => {
        setIsLoadingToken(false);
        api.defaults.headers.common['Authorization'] = token;
      })
      .catch(err => console.log(err));
  }, []);

  const timeoutMillis = 29000;
  // Verbose so we use more combinations of the SDK's constructor
  const headers: Record<string, string> = {
    [MetriportMedicalApi.headers.clientApp]: "Metriport-Dashboard",
    'Zeta': "zeta-zeta",

  };
  const options = {
    axios,
    baseAddress: "https://app-api.claraly.net",
    timeout: timeoutMillis,
    ...headers,
  };
  const metriportAPI = new MetriportMedicalApi("", options);

  return (
    <>
      <Box p={10}>
        <MedicalAppStateProvider>
          <MedicalDash api={metriportAPI}></MedicalDash>
        </MedicalAppStateProvider>
      </Box>
    </>
  );
}