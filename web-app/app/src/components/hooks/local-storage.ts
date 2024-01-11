import { useState } from "react";
import { ILocalStorageData } from "./auth-context";
import { readLocalStorageValue, saveToLocalStorage } from "../shared/util";

export const useLocalStorage = (keyName: string, defaultValue: ILocalStorageData) => {
  const [storedValue, setStoredValue] = useState<ILocalStorageData | null>(() => {

    const value = readLocalStorageValue(keyName, defaultValue);
    const tokenCreationTime = new Date(value?.date);
    const expiryTime = new Date(tokenCreationTime.setHours(tokenCreationTime.getHours() + 1))
    const currentTime = new Date()

    if (expiryTime > currentTime) {
      return value;
    } else {
      saveToLocalStorage(keyName, JSON.stringify(defaultValue));
      return defaultValue;
    }
  });

  const setValue = (newValue: ILocalStorageData | null): void => {
    saveToLocalStorage(keyName, newValue);
    if (newValue) setStoredValue(newValue);
    else setStoredValue(null)
  };

  return { session: storedValue, setSession: setValue };
};