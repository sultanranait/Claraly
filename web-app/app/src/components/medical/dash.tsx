import { Box, Skeleton } from "@chakra-ui/react";
import { useEffect } from "react";
import { capture } from "../shared/capture";
import { useMedicalAppContext } from "../contexts/medical";
import { FacilitiesMap, MedicalAppStateActionType } from "../contexts/medical/reducer";
import Facilities from "./facilities";
import OrganizationManager from "./organization";
import Patients from "./patients";
import { MetriportMedicalApiProps } from "./shared";
import { isAxiosNetworkError, retryWithExponentialBackoff } from "../shared/retry";
import useMetriportToast from "../shared/toast";

export default function MedicalDash({ api }: MetriportMedicalApiProps) {
  const { medicalState, medicalDispatch } = useMedicalAppContext();
  const toast = useMetriportToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const getOrg = () => api.getOrganization();
        const getFacs = () => api.listFacilities();
        const organization = await retryWithExponentialBackoff(
          getOrg,
          "mapi.dash.getOrganization",
          isAxiosNetworkError
        );
        const facilitiesMap: FacilitiesMap = {};
        const facilities = await retryWithExponentialBackoff(
          getFacs,
          "mapi.dash.getListFacilities",
          isAxiosNetworkError
        );
        for (const facility of facilities) {
          facilitiesMap[facility.id] = facility;
        }
        medicalDispatch({
          type: MedicalAppStateActionType.update,
          newState: {
            isLoaded: true,
            store: { ...medicalState.store, organization: organization, facilities: facilitiesMap },
          },
        });
      } catch (err) {
        capture.error(err, { extra: { context: `mapi.dash.init` } });
        toast.error({
          title: "Failed to load organization/facility. Please reload the page.",
          duration: 5000,
        });
      }
    }
    fetchData();
  }, []);

  return (
    <Box>
      <Skeleton isLoaded={medicalState.isLoaded}>
        <OrganizationManager api={api}></OrganizationManager>
        {medicalState.store?.organization ? <Facilities api={api}></Facilities> : null}
        {/* {medicalState.selectedFacility ? <Patients api={api}></Patients> : null} */}
      </Skeleton>
    </Box>
  );
}
