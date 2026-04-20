import Checkbox from "./Checkbox";

export type CheckboxOption<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type Props<T extends string> = {
  options: CheckboxOption<T>[];
  value: T[];
  size?: "small" | "medium";
  onChange: (next: T[]) => void;
};

function CheckboxGroup<T extends string>({
  options,
  value,
  size = "medium",
  onChange,
}: Props<T>) {
  const toggle = (v: T, checked: boolean) => {
    if (checked) {
      onChange([...value, v]);
    } else {
      onChange(value.filter((item) => item !== v));
    }
  };

  return (
    <>
      {options.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.some((item) => item === opt.value)}
          disabled={opt.disabled}
          size={size}
          onChange={(checked) => toggle(opt.value, checked)}
        />
      ))}
    </>
  );
}

export default CheckboxGroup;
