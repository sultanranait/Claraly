import * as Sentry from "@sentry/react";
import { envTypeSandbox, getEnvType, isProdEnv } from "./util";

export type CaptureContext = {
  user: { id?: string; email?: string };
  extra: Record<string, unknown>;
  tags: {
    [key: string]: string;
  };
};

export type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

export type UserData = Pick<Sentry.User, "id" | "email">;

export const capture = {
  environment: getEnvType(),

  setUser: (user: UserData): void => {
    Sentry.setUser(user);
  },
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param error — An Error object.
   * @param captureContext — Additional scope data to apply to exception event.
   * @returns — The generated eventId.
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (error: any, captureContext?: Partial<CaptureContext>): string => {
    return Sentry.captureException(error, captureContext);
  },

  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param message The message to send to Sentry.
   * @param captureContext — Additional scope data to apply to exception event.
   * @returns — The generated eventId.
   */
  message: (message: string, captureContext?: Partial<CaptureContext> | SeverityLevel): string => {
    return Sentry.captureMessage(message, captureContext);
  },

  getEnvironment: () => {
    return capture.environment;
  },

  /**
   * Updates the Sentry environment to Sandbox if we are in production and the user is in sandbox mode.
   *
   * @param isSandbox whether the user is in sandbox mode.
   */
  updateSandboxEnvironment(isSandbox: boolean): void {
    capture.environment = isProdEnv() && isSandbox ? envTypeSandbox : getEnvType();
    Sentry.configureScope(function (scope) {
      scope.addEventProcessor(function (event) {
        event.environment = capture.getEnvironment();
        return event;
      });
    });
  },
};
