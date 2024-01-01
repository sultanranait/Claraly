import { Heading } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MetriportMedicalApi } from "../client/metriport";
import { addressSchema } from "../models/common/address";
import { baseUpdateSchema } from "../models/common/base-update";
import { Organization } from "../models/organization";
import { orgTypeSchema } from "../models/organization";
import { usStateSchema } from "../models/common/us-data";



import { get } from "lodash";
import { useCallback, useContext, useState } from "react";
import { z } from "zod";
import { DEFAULT_COUNTRY } from "../../domain/countries";
import { capture } from "../../shared/capture";
import { MedicalAppStateContext } from "../../contexts/medical";
import { MedicalAppStateActionType } from "../../contexts/medical/reducer";
import { Actions, Analytics, Features } from "../../shared/analytics";
import Constants from "../../shared/constants";
import DrawerForm from "../../shared/form/Drawer";
import { Input } from "../../shared/form/Input";
import { Select } from "../../shared/form/Select";
import useMetriportToast from "../../shared/toast";
import { mapToOptions } from "../../shared/util";

export const formSchema = z
  .object({
    name: z.string().min(1),
    type: orgTypeSchema,
    address: addressSchema,
  })
  .merge(baseUpdateSchema.deepPartial());
type FormData = z.infer<typeof formSchema>;

export default function OrganizationForm({
  isOpen,
  onClose,
  api,
}: {
  isOpen: boolean;
  onClose: () => void;
  api: MetriportMedicalApi;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { medicalState, medicalDispatch } = useContext(MedicalAppStateContext);
  const toast = useMetriportToast();

  const currentOrg = medicalState.store?.organization;

  const createOrUpdate = async (data: FormData) => {
    const { name, type, address } = data;
    const organization = {
      name,
      type,
      location: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: usStateSchema.parse(address.state),
        zip: address.zip,
        country: address.country,
      },
    };

    try {
      setIsSubmitting(true);

      let resp;
      if (currentOrg) {
        Analytics.emit(Actions.update, Features.organization);
        resp = await api.updateOrganization({
          ...currentOrg,
          ...organization,
        });
      } else {
        Analytics.emit(Actions.create, Features.organization);
        resp = await api.createOrganization({
          ...organization,
        });
      }
      updateOrganization(resp);

      toast.success({ title: "Organization saved." });
      onClose();
    } catch (err) {
      capture.error(err, { extra: { orgId: currentOrg?.id, context: `org.createOrUpdate` } });
      toast.error();
    }
    setIsSubmitting(false);
  };

  const updateOrganization = useCallback(
    (organization: Organization) => {
      medicalDispatch({
        type: MedicalAppStateActionType.update,
        newState: { store: { ...medicalState.store, organization: organization } },
      });
    },
    [medicalDispatch]
  );

  return (
    <DrawerForm<FormData>
      title={`${currentOrg ? "Edit" : "Create"} Organization`}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      onSubmit={createOrUpdate}
      onClose={onClose}
      resolver={zodResolver(formSchema)}
      defaultValues={{
        name: currentOrg?.name,
        type: currentOrg?.type,
        address: {
          addressLine1: currentOrg?.location.addressLine1,
          addressLine2: currentOrg?.location.addressLine2,
          city: currentOrg?.location.city,
          state: currentOrg?.location.state,
          zip: currentOrg?.location.zip,
          country: currentOrg?.location.country || DEFAULT_COUNTRY,
        },
      }}
      btSaveId="org-save"
      btCloseId="org-close"
    >
      {({ register, formState: { errors } }) => (
        <>
          <Input
            {...register("name")}
            isRequired
            placeholder="Treatment Provider Inc."
            label="Name *"
            error={get(errors, "name")}
          />
          <Select
            {...register("type")}
            isRequired
            label="Type *"
            options={mapToOptions(Constants.orgTypes)}
            placeholder="Select Type"
            error={get(errors, "type")}
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
