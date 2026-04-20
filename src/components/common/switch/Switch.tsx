import styled, { css } from "styled-components";
import Text from "../text/Text";
import tokens from "../../../utils/tokens";

type SwitchStyle = "web_medium" | "web_small" | "android" | "ios";
type SwitchState = "default" | "focus" | "disabled";

interface BaseProps {
  name?: string;
  variant: SwitchStyle;
  state?: SwitchState;
  isChecked?: boolean;
  leadingText?: string;
  trailingText?: string;

  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Switch = ({
  name,
  variant,
  state = "default",
  leadingText,
  trailingText,
  isChecked = false,
  onChange,
}: BaseProps) => {
  return (
    <SwitchContainer disabled={state === "disabled"}>
      {leadingText && (
        <Text variant={variant === "web_small" ? "labelSm" : "labelMd"}>
          {leadingText}
        </Text>
      )}

      <SwitchWrapper>
        <HiddenInput
          name={name}
          type="checkbox"
          defaultChecked={isChecked}
          disabled={state === "disabled"}
          onChange={onChange}
        />

        <Track variant={variant} state={state}>
          <Thumb variant={variant} />
        </Track>
      </SwitchWrapper>

      {trailingText && (
        <Text variant={variant === "web_small" ? "labelSm" : "labelMd"}>
          {trailingText}
        </Text>
      )}
    </SwitchContainer>
  );
};

const TRACK_STYLES = {
  ios: css`
    width: 52px;
    height: 32px;
    background-color: #dde0e3;
    border: none;
  `,
  android: css`
    width: 52px;
    height: 32px;
    background-color: #fff;
    border: 1px solid #cbcfd2;
  `,
  web_medium: css`
    width: 40px;
    height: 20px;
    background-color: #fff;
    border: 1px solid #cbcfd2;
  `,
  web_small: css`
    width: 32px;
    height: 16px;
    background-color: #fff;
    border: 1px solid #cbcfd2;
  `,
};

const THUMB_STYLES = {
  ios: css`
    width: 28px;
    height: 28px;
    margin-left: 2px;
    background-color: #ffffff;
  `,
  android: css`
    width: 16px;
    height: 16px;
    margin-left: 8px;
    background-color: #333538;
  `,
  web_medium: css`
    width: 14px;
    height: 14px;
    margin-left: 2px;
    background-color: #333538;
  `,
  web_small: css`
    width: 10px;
    height: 10px;
    margin-left: 3px;
    background-color: #333538;
  `,
};

const THUMB_MOVE_DISTANCE = {
  ios: "20px",
  android: "16px",
  web_medium: "20px",
  web_small: "14px",
};

const SwitchContainer = styled.label<{ disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  user-select: none;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `}
`;

const SwitchWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const Track = styled.div<{ variant: SwitchStyle; state: SwitchState }>`
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: ${tokens["2.-semantic-tokens"].dark.scale.radius.full.value};

  ${({ variant }) => TRACK_STYLES[variant]}

  ${HiddenInput}:checked + & {
    background-color: #4949d4;
  }

  ${({ state }) =>
    state === "focus" &&
    css`
      outline: 2px solid
        ${tokens["2.-semantic-tokens"].dark.interaction.focus.outline.value};
    `}
`;

const Thumb = styled.div<{ variant: SwitchStyle }>`
  border-radius: ${tokens["2.-semantic-tokens"].dark.scale.radius.full.value};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  ${({ variant }) => THUMB_STYLES[variant]}

  ${HiddenInput}:checked + ${Track} & {
    background-color: #ffffff;

    transform: translateX(${({ variant }) => THUMB_MOVE_DISTANCE[variant]});

    ${({ variant }) =>
      variant === "android" &&
      css`
        width: 24px;
        height: 24px;
      `}
  }
`;

export default Switch;
