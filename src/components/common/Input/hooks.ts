import { RegisterOptions, UseFormRegister, FieldErrors } from "react-hook-form";
import {
  useState,
  useCallback,
  ChangeEvent,
  useRef,
  useLayoutEffect,
} from "react";
import { InputState } from "./Input";

/** React Hook Form 전용 어댑터 */
const useInput = (
  name: string,
  register: UseFormRegister<any>,
  errors: FieldErrors,
  rules?: RegisterOptions,
) => {
  const error = errors[name];

  return {
    ...register(name, rules),
    state: (error ? "error" : "default") as InputState,
    helperText: error ? (error.message as string) : undefined,
  };
};

/** input 리액트 폼 상태 관리자 */
const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, handleChange, reset, setValues };
};

/** textArea 높이 자동 조절기 */
const useAutoResize = (
  externalRef: React.ForwardedRef<HTMLTextAreaElement>,
  height?: number,
  value?: string | number | readonly string[],
) => {
  const localRef = useRef<HTMLTextAreaElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement) => {
      localRef.current = node;
      if (typeof externalRef === "function") externalRef(node);
      else if (externalRef) {
        (externalRef as React.MutableRefObject<HTMLTextAreaElement>).current =
          node;
      }
    },
    [externalRef],
  );

  const adjustHeight = useCallback(() => {
    const target = localRef.current;
    if (height || !target) return;

    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  }, [height]);

  useLayoutEffect(() => {
    adjustHeight();
  }, [adjustHeight, value]);

  return { setRefs, adjustHeight };
};

const useTextArea = (initialValue: string = "") => {
  const [value, setValue] = useState<string>(initialValue);

  const ChangeHandler = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    console.log(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    onChange: ChangeHandler,
    reset,
    setValue,
  };
};

export { useInput, useForm, useAutoResize, useTextArea };
