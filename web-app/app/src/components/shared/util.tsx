import { CognitoUser } from "@aws-amplify/auth";
import { CognitoUserAttribute, CognitoUserSession } from "amazon-cognito-identity-js";
import { Auth } from "aws-amplify";
import { capture } from "./capture";
import { MedicalAppState } from "../contexts/medical/reducer";
import Constants from "./constants";

export interface UserKeys {
  apiKey: string;
  clientApiKey: string;
}

export function isSandbox(userId: string): boolean {
  const isSandbox = readLocalStorageValue<{ [key: string]: boolean }>(Constants.isSandboxKey, {
    [userId]: false,
  });

  return isSandbox[userId];
}

export const envTypeEnvVarName = "REACT_APP_ENV_TYPE";
export const envTypeDev = "dev";
export const envTypeSandbox = "sandbox";
export const envTypeStaging = "staging";
export const envTypeProd = "production";

export function getEnvType(): string {
  return getEnvVarOrFail(envTypeEnvVarName);
}
export function isDevEnv(): boolean {
  return getEnvType() === envTypeDev;
}

export function getEnvVar(varName: string): string | undefined {
  return process.env[varName];
}

export function isProdEnv(): boolean {
  return getEnvType() === envTypeProd;
}

export function isStagingEnv(): boolean {
  return getEnvType() === envTypeStaging;
}

export function getEnvVarOrFail(varName: string): string {
  const value = getEnvVar(varName);
  if (!value || value.trim().length < 1) {
    throw new Error(`Missing ${varName} env var`);
  }
  return value;
}

export function bytesToSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}


export function getAPIKeyOrFail(state: MedicalAppState): string {
  // if (!state.keys?.apiKey) throw new Error("Missing API Key");
  // return state.keys?.apiKey;
  return ""
}

export const fetchUserKey = async function (
  username: string,
  bypassCache = false
): Promise<UserKeys> {
  const user: CognitoUser = await Auth.currentAuthenticatedUser({
    bypassCache: bypassCache,
  });
  try {
    const apiKeys = await new Promise<UserKeys>((res, rej) => {
      user.getUserAttributes(
        (err: Error | undefined, attributes: CognitoUserAttribute[] | undefined) => {
          if (err) {
            rej(err);
            return;
          }
          let apiKey = "";
          let clientApiKey = "";
          if (attributes) {
            const prefix = isSandbox(username) ? "sandbox_" : "";
            const apiKeyAttrName = `custom:${prefix}api_keys`;
            const clientApiKeyAttrName = `custom:${prefix}c_api_keys`;

            let apiKeyFound = false;
            let clientApiKeyFound = false;
            for (let index = 0; index < attributes.length; index++) {
              const element = attributes[index];
              if (element.Name === apiKeyAttrName) {
                const obj = JSON.parse(element.Value);
                apiKey = obj.key;
                apiKeyFound = true;
              }
              if (element.Name === clientApiKeyAttrName) {
                const obj = JSON.parse(element.Value);
                clientApiKey = obj.key;
                clientApiKeyFound = true;
              }
              if (apiKeyFound && clientApiKeyFound) {
                res({ apiKey, clientApiKey });
              }
            }
          }
          res({ apiKey, clientApiKey });
        }
      );
    });
    return apiKeys;
  } catch (error) {
    capture.error(error, { extra: { context: `userKey.fetch` } });
    return { apiKey: "", clientApiKey: "" };
  }
};

export const fetchUserToken = async function () {
  const user: CognitoUser = await Auth.currentAuthenticatedUser();
  try {
    const token = await new Promise<string>((res, rej) => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          rej(err);
          return;
        }
        if (session) {
          res(session.getIdToken().getJwtToken());
        }
        res("");
      });
    });
    return token;
  } catch (error) {
    capture.error(error, { extra: { context: `userToken.fetch` } });
    return "";
  }
};

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });

    return undefined;
  }
}

const defaultFormatterParams = {
  style: "currency",
  currency: "USD",
};

export const formatter = new Intl.NumberFormat("en-US", defaultFormatterParams);

export const formatterNoDecimal = new Intl.NumberFormat("en-US", {
  ...defaultFormatterParams,
  minimumFractionDigits: 0,
});

export function readLocalStorageValue<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue

  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);

    return item ? (parseJSON(item) as T) : initialValue;
  } catch (error) {
    capture.error(error, { extra: { context: `localStorage.value.read` } });
    return initialValue;
  }
}

export const sleep = (timeInMs: number) => new Promise(resolve => setTimeout(resolve, timeInMs));

export const emptyStringToUndefined = (v: unknown): string | undefined => {
  const toStr = String(v);
  if (!toStr || toStr.trim().length <= 0) return undefined;
  return toStr;
};

export function mapToOptions(map: { [k: string]: string }): { label: string; value: string }[] {
  return Object.keys(map).map(k => {
    return { label: map[k], value: k };
  });
}
