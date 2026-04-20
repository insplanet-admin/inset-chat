import { forwardRef } from "react";
import styled from "styled-components";
import Input, { InputState, InputBaseProps } from "./Input";
import tokens from "../../../utils/tokens";
import Field from "./Field";

const semanticLight = tokens["2.-semantic-tokens"].light;

interface BaseProps extends InputBaseProps {
  mark?: "required" | "option" | "none";
  fieldLabel: string;
  helperText?: string;
}

const TextField = forwardRef<HTMLInputElement, BaseProps>(
  (
    {
      variant,
      size = "medium",
      state = "default",
      mark = "none",
      fieldLabel,
      helperText,
      icon,
      button,
      ...rest
    },
    ref,
  ) => {
    return (
      <Container>
        <Field
          mark={mark}
          fieldLabel={fieldLabel}
          helperText={helperText}
          state={state}
        >
          <Input
            ref={ref}
            variant={variant}
            size={size}
            state={state}
            icon={icon}
            button={button}
            {...rest}
          />
        </Field>
      </Container>
    );
  },
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 320px;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LabelText = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${semanticLight.color.text.secondary.value};
`;

const Mark = styled.span<{ type: "required" | "option" }>`
  font-size: ${semanticLight.scale.type.caption.small.value};
  font-weight: 600;
  color: ${({ type }) =>
    type === "required"
      ? semanticLight.color.text.status.negative.value
      : semanticLight.color.border.status.information.value};
`;

const HelperTextWrapper = styled.div<{ state: InputState }>`
  display: flex;
  align-items: center;
  gap: 4px;

  color: ${({ state }) =>
    state == "error"
      ? semanticLight.color.text.status.negative.value
      : semanticLight.color.text.muted.value};
`;

const HelperText = styled.span`
  font-weight: 500;
  font-size: ${semanticLight.scale.type.caption.medium.value};
  letter-spacing: 0;
  color: inherit;
`;

export default TextField;
