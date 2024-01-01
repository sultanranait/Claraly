import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";

export const DatePickerField = ({ ...props}) => {
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field] = useField(props);
  return (
    <DatePicker
      {...field}
      {...props}
      selected={(field.value && new Date(field.value)) || new Date()}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"

      onChange={(val) => {
        setFieldValue(field.name, val);
      }}
      onChangeRaw={(e) => {
        setFieldTouched(field.name, true, true);
      }}
    />
  );
};
