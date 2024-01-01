import { createContext, Dispatch, useReducer, useContext } from "react";

import { initialState, MedicalAppState, MedicalAppStateAction, reducer } from "./reducer";
interface IMedicalAppStateContext {
  medicalState: MedicalAppState;
  medicalDispatch: Dispatch<MedicalAppStateAction>;
}

export const MedicalAppStateContext = createContext<IMedicalAppStateContext>({
  medicalState: initialState,
  medicalDispatch: () => null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MedicalAppStateProvider = ({ children }: { children: any }) => {
  const [medicalState, medicalDispatch] = useReducer(reducer, initialState);

  return (
    <MedicalAppStateContext.Provider value={{ medicalState, medicalDispatch }}>
      {children}
    </MedicalAppStateContext.Provider>
  );
};

export const useMedicalAppContext = () => useContext(MedicalAppStateContext);
