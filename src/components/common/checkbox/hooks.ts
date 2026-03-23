import { useCallback, useMemo, useState } from "react";

export function useCheckboxGroup<T extends string>(initialValue: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initialValue);

  const isChecked = useCallback(
    (value: T) => selected.includes(value),
    [selected],
  );

  const toggle = useCallback((value: T) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const check = useCallback((value: T) => {
    setSelected((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  const uncheck = useCallback((value: T) => {
    setSelected((prev) => prev.filter((v) => v !== value));
  }, []);

  const checkAll = useCallback((values: T[]) => {
    setSelected(values);
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const helpers = useMemo(() => {
    return {
      count: selected.length,
      isEmpty: selected.length === 0,
    };
  }, [selected]);

  return {
    selected,
    setSelected,

    isChecked,
    toggle,
    check,
    uncheck,

    checkAll,
    clear,

    ...helpers,
  };
}
