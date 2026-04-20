import { useMemo } from "react";
import Checkbox from "./Checkbox";

type MasterCheckboxProps<T extends string> = {
  allValues: T[];
  selectedValues: T[];
  onChange: (next: T[]) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium";
};

function getMasterState<T extends string>(selected: T[], all: T[]) {
  const allChecked = selected.length === all.length;
  const indeterminate = selected.length > 0 && !allChecked;

  return { allChecked, indeterminate };
}

function MasterCheckbox<T extends string>({
  allValues,
  selectedValues,
  onChange,
  label = "Select All",
  disabled,
  size = "medium",
}: MasterCheckboxProps<T>) {
  const { allChecked, indeterminate } = useMemo(
    () => getMasterState(selectedValues, allValues),
    [selectedValues, allValues],
  );

  const handleChange = (checked: boolean) => {
    onChange(checked ? allValues : []);
  };

  return (
    <Checkbox
      label={label}
      checked={allChecked}
      indeterminate={indeterminate}
      disabled={disabled}
      size={size}
      onChange={handleChange}
    />
  );
}

export default MasterCheckbox;
