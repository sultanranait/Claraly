import posthog from "posthog-js";

posthog.init(
  process.env.REACT_APP_PUBLIC_POST_HOG_KEY ? process.env.REACT_APP_PUBLIC_POST_HOG_KEY : "",
  {
    api_host: process.env.REACT_APP_PUBLIC_POST_HOG_HOST,
    autocapture: false,
    session_recording: {
      maskAllInputs: true,
    },
  }
);

export enum Features {
  medicalRequest = "medical request",
  organization = "organization",
  facility = "facility",
  patient = "patient(s)",
  link = "link",
  document = "document(s)",
  fhir = "fhir",
  subscription = "subscription",
  sandbox = "sandbox",
  invoices = "invoices",
  webhookUrl = "webhook url",
  user = "user",
  form = "form",
  apiKey = "api key",
  clientApiKey = "client api key",
}

export enum Actions {
  get = "get",
  create = "create",
  update = "update",
  delete = "delete",
  remove = "remove",
  download = "download",
  open = "open",
  close = "close",
  submit = "submit",
  revoke = "revoke",
  generate = "generate",
  test = "test",
  retry = "retry",
  signIn = "sign-in",
  signUp = "sign-up",
  cancel = "cancel",
  toggle = "toggle",
  view = "view",
  navigate = "navigate",
  manage = "manage",
}

export class Analytics {
  static emit(eventAction: Actions, eventFeature: Features | string, properties?: object) {
    const event = `${eventAction} ${eventFeature}`;

    if (event) {
      posthog.capture(event, {
        ...properties,
        platform: "dashboard",
      });
    }
  }

  static identify(id: string) {
    posthog.identify(id);
  }
}
