import { useLocalStorage } from "usehooks-ts";
import Constants from "./constants";
import { MedicalAppState } from "../contexts/medical/reducer";

export const useIsUserInSandbox = (
  state: MedicalAppState
): { isSandboxMap: { [key: string]: boolean }; userIsSandbox: boolean } => {
  // const username = state.user?.username || "";
  const username = "";

  const [isSandbox] = useLocalStorage<{ [key: string]: boolean }>(Constants.isSandboxKey, {
    [username]: false,
  });

  const userIsSandbox = isSandbox[username];

  return {
    isSandboxMap: isSandbox,
    userIsSandbox,
  };
};
