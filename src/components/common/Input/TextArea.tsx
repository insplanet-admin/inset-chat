import React, { forwardRef, useLayoutEffect, useRef } from "react";
import styled, { css, RuleSet } from "styled-components";
import tokens from "tokens";
import { useAutoResize } from "./hooks";
import AreaInput, { AreaInputBaseProps } from "./AreaInput";
import Field from "./Field";

interface BaseProps extends AreaInputBaseProps {
  mark?: "required" | "option" | "none";
  fieldLabel: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, BaseProps>(
  (
    {
      mark = "none",
      fieldLabel,
      helperText,
      variant,
      state = "default",
      ...rest
    },
    ref,
  ) => {
    return (
      <Field
        mark={mark}
        fieldLabel={fieldLabel}
        helperText={helperText}
        state={state}
      >
        <AreaInput variant={variant} state={state} {...rest} />
      </Field>
    );
  },
);

export default Textarea;
