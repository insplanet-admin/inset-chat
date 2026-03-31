import React, { forwardRef } from "react";
import styled, { css, RuleSet } from "styled-components";
import { IconName } from "components/common/Icon/icon-types";
import Icon from "components/common/Icon/Icon";
import Button, { ButtonSize } from "components/common/button/Button";
import tokens from "tokens";

export interface IconButtonProps {
  name: IconName;
  onClick?: () => void;
}

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export type InputVariant = "outline" | "underline" | "subtle" | "ghost";
export type InputState =
  | "default"
  | "error"
  | "focus"
  | "focusVisible"
  | "readOnly"
  | "disabled";
export type InputSize = "small" | "medium" | "large" | "xlarge";

export interface InputBaseProps {
  variant: InputVariant;
  size?: InputSize;
  state?: InputState;
  icon?: IconName | IconButtonProps;
  button?: string | ButtonProps;

  value?: string | number;
  defaultValue?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;

  type?: "text" | "password" | "email" | "number" | "search" | "tel" | "url";
  placeholder?: string;
  name?: string;
  id?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

const BUTTON_SIZE_MAP: Record<InputSize, ButtonSize> = {
  small: "tiny",
  medium: "small",
  large: "medium",
  xlarge: "large",
};

const Input = forwardRef<HTMLInputElement, InputBaseProps>(
  (
    { variant, size = "medium", state = "default", icon, button, ...rest },
    ref,
  ) => {
    const buttonData = typeof button === "string" ? { label: button } : button;
    const iconData =
      typeof icon === "string" ? { name: icon as IconName } : icon;

    return (
      <InputContainer $variant={variant} $size={size} data-state={state}>
        <StyledInput
          ref={ref}
          {...rest}
          disabled={state === "disabled" || rest.disabled}
          readOnly={state === "readOnly" || rest.readOnly}
        />
        {iconData && <Icon name={iconData.name} size={20} />}
        {buttonData && (
          <Button
            size={BUTTON_SIZE_MAP[size]}
            style="subtle"
            state={state === "disabled" ? "disabled" : "default"}
            onClick={buttonData.onClick}
          >
            {buttonData.label}
          </Button>
        )}
      </InputContainer>
    );
  },
);

const inputTokens = tokens["3.-component-tokens"]["type-1"].input;
const semanticLight = tokens["2.-semantic-tokens"].light;

const SIZE_MAP: Record<InputSize, RuleSet<object>> = {
  small: css`
    height: ${inputTokens.size.small.value};
    border-radius: ${inputTokens.radius.medium.value};
    padding: 0 4px 0 12px;
  `,
  medium: css`
    height: ${inputTokens.size.medium.value};
    border-radius: ${inputTokens.radius.large.value};
    padding: 0 4px 0 12px;
  `,
  large: css`
    height: ${inputTokens.size.large.value};
    border-radius: ${inputTokens.radius.large.value};
    padding: 0 8px 0 16px;
  `,
  xlarge: css`
    height: ${inputTokens.size.xlarge.value};
    border-radius: ${inputTokens.radius.large.value};
    padding: 0 8px 0 20px;
  `,
};

const VARIANT_MAP: Record<InputVariant, RuleSet<object>> = {
  outline: css`
    background-color: ${inputTokens.container.surface.value};
    border: 1px solid ${inputTokens.border.default.value};

    &[data-state="error"] {
      border-color: ${semanticLight.color.border.status.negative.value};
    }
    &[data-state="focusVisible"] {
      border-color: ${semanticLight.interaction.pressed.value};
    }
    &[data-state="readOnly"],
    &[data-state="disabled"] {
      background-color: ${semanticLight.interaction.surface.disabled.value};
      border-color: ${semanticLight.interaction["disabled-border"].value};
    }
  `,
  underline: css`
    border-radius: 0;
    border: none;
    border-bottom: 1px solid ${inputTokens.border.default.value};
    padding: 0;
    background-color: transparent;

    &[data-state="error"] {
      border-color: ${semanticLight.color.border.status.negative.value};
    }
    &[data-state="focusVisible"] {
      border-color: ${semanticLight.interaction.pressed.value};
    }
    &[data-state="readOnly"],
    &[data-state="disabled"] {
      border-color: ${semanticLight.interaction["disabled-border"].value};
    }
  `,
  subtle: css`
    border: 1px solid transparent;
    background-color: ${inputTokens.container.subtle.value};

    &[data-state="error"] {
      background-color: ${semanticLight.color.background.surface.status.negative
        .value};
    }
    &[data-state="focusVisible"] {
      border-color: ${semanticLight.interaction.pressed.value};
    }
    &[data-state="readOnly"],
    &[data-state="disabled"] {
      background-color: ${semanticLight.interaction.surface.disabled.value};
    }
  `,
  ghost: css`
    border: 1px solid transparent;
    background-color: transparent;

    &[data-state="error"] {
      background-color: ${semanticLight.color.background.surface.status.negative
        .value};
    }
    &[data-state="focusVisible"] {
      border-color: ${semanticLight.interaction.pressed.value};
    }
  `,
};

const InputContainer = styled.div<{
  $variant: InputVariant;
  $size: InputSize;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;
  color: #111;

  ${({ $size }) => SIZE_MAP[$size]}
  ${({ $variant }) => VARIANT_MAP[$variant]}

  &:focus-within,
  &[data-state="focus"] {
    outline: 2px solid ${semanticLight.interaction.focus.outline.value};
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  padding: 8px 0;
  color: inherit;

  &::placeholder {
    color: #bfbfbf;
  }

  &:disabled {
    cursor: not-allowed;
    color: ${semanticLight.interaction.disabled.value};
  }
`;

export default Input;
