import { FhirResource, fhirVersions } from 'fhir-react';
import 'fhir-react/build/style.css';
import 'fhir-react/build/bootstrap-reboot.min.css';

export const FHIRResource = ({ ...props }) => {
  return (
    <FhirResource
      {...props}
      fhirVersion={fhirVersions.R4}
      withCarinBBProfile
    />
  );
};
