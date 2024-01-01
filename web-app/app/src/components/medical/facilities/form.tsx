import { Heading } from "@chakra-ui/react";

import { addressSchema } from "../models/common/address";
import { Facility, FacilityCreate, facilityCreateSchema } from "../models/facility";
import { MetriportMedicalApi } from "../client/metriport";

import { useContext, useState } from "react";
import { cloneDeep } from "lodash";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { get } from "lodash";
import { MedicalAppStateContext } from "../../contexts/medical";
import { MedicalAppStateActionType } from "../../contexts/medical/reducer";
import { Actions, Analytics, Features } from "../../shared/analytics";
import Constants from "../../shared/constants";
import useMetriportToast from "../../shared/toast";
import DrawerForm from "../../shared/form/Drawer";
import { Input } from "../../shared/form/Input";
import { Select } from "../../shared/form/Select";
import { capture } from "../../shared/capture";
import { DEFAULT_COUNTRY } from "../../domain/countries";

const facilitySchemaForm = facilityCreateSchema;
type FacilityForm = z.infer<typeof facilitySchemaForm>;

const formToCreate = (form: FacilityForm): FacilityCreate => {
  const formCopy = cloneDeep(form);
  return {
    ...formCopy,
    address: addressSchema.parse(formCopy.address),
  };
};

export default function FacilitiesForm({
  isOpen,
  facilityId,
  onClose,
  api,
}: {
  isOpen: boolean;
  facilityId?: string;
  onClose: () => void;
  api: MetriportMedicalApi;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { medicalState, medicalDispatch } = useContext(MedicalAppStateContext);
  const toast = useMetriportToast();

  const currentFacility =
    !!facilityId && medicalState.store?.facilities
      ? medicalState.store.facilities[facilityId]
      : undefined;

  const createOrUpdate = async (facility: FacilityForm) => {
    try {
      setIsSubmitting(true);

      let newFacility: Facility;
      if (currentFacility) {
        Analytics.emit(Actions.update, Features.facility);
        newFacility = await api.updateFacility({
          ...facility,
          id: currentFacility.id,
        });
      } else {
        Analytics.emit(Actions.create, Features.facility);
        newFacility = await api.createFacility(formToCreate(facility));
      }

      const facilities = medicalState.store?.facilities ?? {};
      facilities[newFacility.id] = newFacility;
      medicalDispatch({
        type: MedicalAppStateActionType.update,
        newState: {
          store: {
            ...medicalState.store,
            facilities,
          },
        },
      });
      toast.success({ title: "Facility saved." });
      onClose();
    } catch (err) {
      capture.error(err, {
        extra: {
          facilityId: currentFacility?.id,
          facility,
          context: `facility.createOrUpdate`,
          err,
        },
      });
      toast.error();
    }
    setIsSubmitting(false);
  };

  return (
    <DrawerForm<FacilityForm>
      title={`${currentFacility ? "Edit" : "Create"} Facility`}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      onSubmit={createOrUpdate}
      onClose={onClose}
      resolver={zodResolver(facilitySchemaForm)}
      defaultValues={{
        ...currentFacility,
        address: {
          ...currentFacility?.address,
          country: currentFacility?.address.country || DEFAULT_COUNTRY,
        },
      }}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Heading as="h4" size="sm">
            Basic Info
          </Heading>
          <Input {...register("name")} isRequired label="Name *" error={get(errors, "name")} />
          <Input
            type={"number"}
            {...register("npi")}
            isRequired
            label="National Provider Identifier (NPI) *"
            error={get(errors, "npi")}
            placeholder="Enter a valid 10-digit NPI. Ex: 1234567893"
          />
          <Input
            {...register("tin")}
            label="Tax Identification Number (TIN)"
            error={get(errors, "tin")}
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
            isRequired
            label="Country *"
            error={get(errors, "address.country")}
            disabled={true}
          />
        </>
      )}
    </DrawerForm>
  );
}
