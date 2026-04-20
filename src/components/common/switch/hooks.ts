import { useState, useCallback } from "react";

const useSwitch = (initialState: boolean = false) => {
  const [isActive, setIsActive] = useState(initialState);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  return { isActive, toggle };
};

const useSwitchGroup = (initialValues: Record<string, boolean>) => {
  const [values, setValues] = useState<Record<string, boolean>>(initialValues);

  const onChangeSwitch: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const { name, checked } = event.target;

      setValues((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }, []);

  const getSwitchProps = (name: string) => ({
    name: name,
    isChecked: values[name],
    onChange: onChangeSwitch,
  });

  return { values, onChangeSwitch, getSwitchProps };
};

export { useSwitch, useSwitchGroup };
