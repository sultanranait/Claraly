import { Facility } from "../../medical/models/facility";
import { Organization } from "../../medical/models/organization";
import { PatientDTO } from "../../medical/models/patientDTO";


export type FacilitiesMap = { [index: string]: Facility };
export type PatientsMap = { [index: string]: PatientDTO };

type BaseMedicalAppState = {
  selectedFacility?: Facility;
  store?: {
    organization?: Organization;
    facilities?: FacilitiesMap;
    patients?: PatientsMap;
  };
};

export type MedicalAppState =
  | (BaseMedicalAppState & { isLoaded: false })
  | (Required<BaseMedicalAppState> & { isLoaded: true });

export enum MedicalAppStateActionType {
  update,
}

export interface MedicalAppStateAction {
  type: MedicalAppStateActionType;
  newState: BaseMedicalAppState | MedicalAppState;
}

export const reducer = (state: MedicalAppState, action: MedicalAppStateAction) => {
  switch (action.type) {
    case MedicalAppStateActionType.update:
      return {
        ...state,
        ...action.newState,
      };

    default:
      return state;
  }
};

export const initialState: MedicalAppState = {
  isLoaded: false,
};
