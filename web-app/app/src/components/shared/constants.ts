import { OrgType } from "../medical/models/organization";
import { sortBy } from "lodash";

export const genderAtBirthTypes = ["F", "M"] as const;
export type GenderAtBirth = (typeof genderAtBirthTypes)[number];

class Constants {
  static readonly supportEmail = "support@metriport.com";
  static readonly reachoutToUs = `Please try again later or reachout to us on ${Constants.supportEmail}`;
  static readonly errorDefaultMessage = `Something went wrong. ${Constants.reachoutToUs}`;

  static readonly stripeConnectionFailure = `Could not initiate session with Stripe. ${Constants.reachoutToUs}`;
  static readonly isSandboxKey = "isSandbox";
  static contactEmail = "contact@metriport.com";
  static docsUrl = "https://docs.metriport.com/";
  static githubUrl = "https://github.com/metriport/metriport";
  static developersUrl = "/developers";
  static orgTypes: { [k in OrgType]: string } = {
    [OrgType.acuteCare]: "Acute Care",
    [OrgType.ambulatory]: "Ambulatory",
    [OrgType.hospital]: "Hospital",
    [OrgType.labSystems]: "Lab Systems",
    [OrgType.pharmacy]: "Pharmacy",
    [OrgType.postAcuteCare]: "Post Acute Care",
  };
  static gendersAtBirth: { [k in GenderAtBirth]: string } = {
    F: "Female",
    M: "Male",
  };
  static usStates = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    // { label: "American Samoa", value: "AS" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District Of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    // { label: "Guam", value: "GU" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    // { label: "Puerto Rico", value: "PR" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" },
  ];
  static usStatesForAddress = sortBy(Constants.usStates, "label");
}

export default Constants;
