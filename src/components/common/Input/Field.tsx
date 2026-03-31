import { forwardRef, ReactNode } from "react";
import styled from "styled-components";
import Icon from "components/common/Icon/Icon";
import tokens from "tokens";

const semanticLight = tokens["2.-semantic-tokens"].light;

interface BaseProps {
  children: ReactNode;
  mark?: "required" | "option" | "none";
  state?: filedState;
  fieldLabel?: string;
  helperText?: string;
}

type filedState =
  | "default"
  | "error"
  | "focus"
  | "focusVisible"
  | "readOnly"
  | "disabled";

const Field = forwardRef<HTMLInputElement, BaseProps>(
  (
    { children, state = "default", mark = "none", fieldLabel, helperText },
    ref,
  ) => {
    return (
      <Container ref={ref}>
        <LabelWrapper>
          <LabelText>{fieldLabel}</LabelText>
          {mark === "required" && <Mark type="required">필수 *</Mark>}
          {mark === "option" && <Mark type="option">선택</Mark>}
        </LabelWrapper>

        {children}

        {helperText && (
          <HelperTextWrapper state={state}>
            <Icon
              name={state === "error" ? "Negative" : "Information"}
              size={14}
              color={
                state === "error"
                  ? semanticLight.color.icon.status.negative.value
                  : semanticLight.color.icon.muted.value
              }
            />
            <HelperText>{helperText}</HelperText>
          </HelperTextWrapper>
        )}
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

const HelperTextWrapper = styled.div<{ state: filedState }>`
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

export default Field;
