import { Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  InputGroup,
  InputLeftAddon,
  Spacer,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseUpdate } from "../models/common/base-update";
import { PatientDTO } from "../models/patientDTO";
import { PatientCreate, patientCreateSchema, PatientUpdate } from "../models/patient";
import { MetriportMedicalApi } from "../client/metriport";
import { Address } from "../models/common/address";
import { PersonalIdentifier } from "../models/demographics";
import { usStateSchema } from "../models/common/us-data";

  
import { isValid } from "driver-license-validator";
import { cloneDeep, get } from "lodash";
import { useCallback, useContext, useState } from "react";
import { z } from "zod";
import { DEFAULT_COUNTRY } from "../../domain/countries";
import { capture } from "../../shared/capture";
import { MedicalAppStateContext } from "../../contexts/medical";
import { MedicalAppStateActionType } from "../../contexts/medical/reducer";
import { Actions, Analytics, Features } from "../../shared/analytics";
import { Button } from "../../shared/Button";
import Constants from "../../shared/constants";
import { filterTruthy } from "../../shared/filter-map-utils";
import DrawerForm from "../../shared/form/Drawer";
import { Input } from "../../shared/form/Input";
import { Select } from "../../shared/form/Select";
import { Label } from "../../shared/Label";
import useMetriportToast from "../../shared/toast";
import { emptyStringToUndefined, mapToOptions } from "../../shared/util";

const DRIVERS_LICENSE = "driversLicense" as const;

const patientFormSchema = patientCreateSchema
  .omit({ personalIdentifiers: true })
  .merge(z.object({ externalId: z.string().optional() }))
  .merge(
    z.object({
      driversLicense: z
        .object({
          value: z.string(),
          state: z.string(),
        })
        .superRefine((input, ctx) => {
          if (!input) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "Missing input",
            });
            return;
          }
          const value = input.value.trim();
          const state = input.state.trim();
          if (value.length <= 0) return; // nothing to check
          if (state.length <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["state"],
              message: "Select a State",
            });
            return;
          }
          const valid = isValid(value, { states: state });
          if (!valid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "Invalid driver's license",
            });
            return;
          }
        }),
    })
  )
  .omit({ contact: true })
  .merge(
    z.object({
      contact: z
        .object({
          phone: z.preprocess(emptyStringToUndefined, z.string().length(10).or(z.undefined())),
          email: z.preprocess(emptyStringToUndefined, z.string().email().or(z.undefined())),
        })
        .optional(),
    })
  )
  .transform(patient => {
    if (
      !Array.isArray(patient.contact) &&
      patient.contact &&
      !patient.contact.email &&
      !patient.contact.phone
    ) {
      return { ...patient, contact: undefined };
    }
    return patient;
  });
type PatientForm = z.infer<typeof patientFormSchema>;

type AddressProperties = keyof Address;

function getAddress(patient: PatientDTO): PatientForm["address"] {
  const state = getAddressProperty(patient.address, "state");
  const parsedState = usStateSchema.parse(state);

  return {
    addressLine1: getAddressProperty(patient.address, "addressLine1"),
    addressLine2: getAddressProperty(patient.address, "addressLine2"),
    city: getAddressProperty(patient.address, "city"),
    state: parsedState,
    zip: getAddressProperty(patient.address, "zip"),
    country: DEFAULT_COUNTRY,
  };
}

function getAddressProperty(
  address: PatientDTO["address"],
  propertyName: AddressProperties
): string {
  return (Array.isArray(address) ? address[0]?.[propertyName] : address?.[propertyName]) ?? "";
}

const apiToForm = (patient: PatientDTO): PatientForm => {
  const driversLicense = patient.personalIdentifiers?.find(id => id.type === DRIVERS_LICENSE) as
    | PersonalIdentifier
    | undefined;
  const patientContact = Array.isArray(patient.contact) ? patient.contact[0] : patient.contact;
  return {
    ...patient,
    contact: patientContact
      ? {
          phone: patientContact?.phone ?? "",
          email: patientContact?.email ?? "",
        }
      : undefined,
    driversLicense: driversLicense
      ? {
          state: driversLicense.state,
          value: driversLicense.value,
        }
      : {
          state: "",
          value: "",
        },
    address: getAddress(patient),
  };
};

const formToApi = (form: PatientForm): (PatientCreate | PatientUpdate) & Partial<BaseUpdate> => {
  const formCopy = cloneDeep(form);
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (formCopy as any).driversLicense; // safe on this context, don't use formCopy for anything else
  const personalIdentifiers: PersonalIdentifier[] = [
    // ...(patient?.personalIdentifiers ?? []).filter(id => id.type !== DRIVERS_LICENSE), // #1137 TODO: uncomment if we support PersonalIdentifiers other than a driversLicense
    form.driversLicense.value && form.driversLicense.state
      ? {
          type: DRIVERS_LICENSE,
          value: form.driversLicense.value,
          state: usStateSchema.parse(form.driversLicense.state),
        }
      : undefined,
  ]
    .flatMap(filterTruthy)
    .filter(pid => pid.type.trim().length > 0 && pid.value.trim().length > 0);
  return {
    ...formCopy,
    personalIdentifiers,
  };
};

export default function PatientForm({
  isOpen,
  patientId,
  onClose,
  api,
}: {
  isOpen: boolean;
  patientId?: string;
  onClose: () => void;
  api: MetriportMedicalApi;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { medicalState, medicalDispatch } = useContext(MedicalAppStateContext);
  const { success, error } = useMetriportToast();
  const [isLargerThan1000] = useMediaQuery("(min-width: 1000px)");

  const selectedFacility = medicalState.selectedFacility;
  const medicalStatePatient =
    !!patientId && medicalState.store?.patients
      ? medicalState.store.patients[patientId]
      : undefined;

  const currentPatient = medicalStatePatient ? apiToForm(medicalStatePatient) : undefined;

  if (!selectedFacility) {
    throw new Error("Programming error: no facility has been selected");
  }

  const createOrUpdate = async (patientForm: PatientForm) => {
    const patient = formToApi(patientForm);
    try {
      setIsSubmitting(true);

      let resp: PatientDTO;
      if (medicalStatePatient) {
        Analytics.emit(Actions.update, Features.patient);
        resp = await api.updatePatient(
          {
            ...patient,
            id: medicalStatePatient.id,
          },
          selectedFacility.id
        );
      } else {
        Analytics.emit(Actions.create, Features.patient);
        resp = await api.createPatient(patient, selectedFacility.id);
      }
      updatePatients(resp);

      success({ title: "Patient saved." });
      onClose();
    } catch (err) {
      capture.error(err, {
        extra: {
          patientId: patient.id,
          facilityId: selectedFacility.id,
          context: `patient.createOrUpdate`,
        },
      });
      error();
    }
    setIsSubmitting(false);
  };

  const updatePatients = useCallback(
    (patient: PatientDTO) => {
      const patients = medicalState.store?.patients ?? {};
      patients[patient.id] = patient;
      medicalDispatch({
        type: MedicalAppStateActionType.update,
        newState: { store: { ...medicalState.store, patients } },
      });
    },
    [medicalDispatch]
  );

  function onPreviewMatches(): void {
    // TODO: implement
    return;
  }

  const patientAddress = Array.isArray(currentPatient?.address)
    ? currentPatient?.address[0]
    : currentPatient?.address;
  const patientContact = Array.isArray(currentPatient?.contact)
    ? currentPatient?.contact[0]
    : currentPatient?.contact;
  return (
    <DrawerForm<PatientForm>
      title={`${currentPatient ? "Edit" : "Create"} Patient`}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      onSubmit={createOrUpdate}
      onClose={onClose}
      resolver={zodResolver(patientFormSchema)}
      defaultValues={{
        firstName: currentPatient?.firstName,
        lastName: currentPatient?.lastName,
        dob: currentPatient?.dob,
        genderAtBirth: currentPatient?.genderAtBirth,
        driversLicense: {
          value: currentPatient?.driversLicense.value,
          state: currentPatient?.driversLicense.state,
        },
        externalId: currentPatient?.externalId,
        address: {
          addressLine1: patientAddress?.addressLine1,
          addressLine2: patientAddress?.addressLine2,
          city: patientAddress?.city,
          state: patientAddress?.state,
          zip: patientAddress?.zip,
          country: patientAddress?.country || DEFAULT_COUNTRY,
        },
        contact: patientContact,
      }}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Heading as="h4" size="sm">
            Basic Info
          </Heading>
          <Input
            {...register("firstName")}
            isRequired
            label="First Name *"
            error={get(errors, "firstName[0]")}
          />
          <Input
            {...register("lastName")}
            isRequired
            label="Last Name *"
            error={get(errors, "lastName[0]")}
          />
          <Input
            {...register("dob")}
            type="date"
            isRequired
            label="Date of Birth *"
            error={get(errors, "dob")}
          />
          <Select
            {...register("genderAtBirth")}
            isRequired
            label="Gender at Birth *"
            placeholder="Select gender"
            options={mapToOptions(Constants.gendersAtBirth)}
            error={get(errors, "genderAtBirth")}
          />

          <Label>Driver's License</Label>
          <Flex w={"100%"} direction={isLargerThan1000 ? "row" : "column"}>
            <Input
              {...register("driversLicense.value")}
              error={get(errors, "driversLicense.value")}
            />
            <Spacer padding={2} flex={0} />
            <Select
              {...register("driversLicense.state")}
              options={Constants.usStatesForAddress}
              placeholder="Select State"
              error={get(errors, "driversLicense.state")}
            />
          </Flex>

          <Input
            {...register("externalId")}
            label="External ID"
            error={get(errors, "externalId")}
          />

          <Heading as="h4" size="sm" pt={50}>
            Address
          </Heading>
          <Input
            {...register("address.addressLine1")}
            isRequired
            label="Address Line 1 *"
            error={get(errors, "address.addressLine1")}
          />
          <Input
            {...register("address.addressLine2")}
            label="Address Line 2"
            error={get(errors, "address.addressLine2")}
          />
          <Input
            {...register("address.city")}
            isRequired
            label="City *"
            error={get(errors, "address.city")}
          />
          <Select
            {...register("address.state")}
            isRequired
            label="State *"
            name="address.state"
            options={Constants.usStatesForAddress}
            placeholder="Select State"
            error={get(errors, "address.state")}
          />
          <Input
            {...register("address.zip")}
            isRequired
            label="Zip *"
            error={get(errors, "address.zip")}
          />
          <Input
            {...register("address.country")}
            label="Country"
            error={get(errors, "address.country")}
            disabled={true}
          />
          <Heading as="h4" size="sm" pt={50}>
            Contact
          </Heading>
          <Text>{errors.contact?.message}</Text>
          <Label>Phone</Label>
          <InputGroup>
            <InputLeftAddon children="+1" />
            <Input
              type="number"
              placeholder="4155404451"
              {...register("contact.phone")}
              error={get(errors, "contact.phone")}
            />
          </InputGroup>
          <Input
            label="Email"
            {...register("contact.email")}
            error={get(errors, "contact.email")}
          />
          {!currentPatient ? (
            <Box>
              <Heading as="h4" size="sm" mb={5} pt={50}>
                Preview Potential Matches (coming soon)
              </Heading>
              <Button
                onClick={onPreviewMatches}
                isActive={false}
                isDisabled={true}
                leftIcon={<Search2Icon />}
              >
                Search for Potential Matches
              </Button>
            </Box>
          ) : null}
        </>
      )}
    </DrawerForm>
  );
}
