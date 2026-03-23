import React from "react";
import styled, { css } from "styled-components";

type AvatarStyle = "icon" | "text" | "emoji" | "photo";
type AvatarState = "default" | "hover" | "pressed" | "focus" | "disabled";

type Common = {
  size: number;
  state?: AvatarState;

  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

type AvatarProps =
  | (Common & { style: "photo"; src: string; alt?: string })
  | (Common & { style: "text"; text: string })
  | (Common & { style: "emoji"; emoji: string })
  | (Common & { style: "icon"; icon?: React.ReactNode });

const avatarBase = css<{ $size: number; $state: AvatarState }>`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  border-radius: 50%;
  background-color: #eee;
  transition: all 0.2s ease;

  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  font-size: ${({ $size }) => Math.round($size * 0.5)}px;

  ${({ $state }) => stateStyles[$state]}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  color: white;

  &:hover {
    background-color: #6a6e74;
  }
  &:active {
    background-color: #666a71;
  }
  &:focus-visible {
    outline: 2px solid #23c7cd;
  }
`;

const stateStyles: Record<AvatarState, ReturnType<typeof css>> = {
  default: css`
    opacity: 1;
    background-color: #b3b7bd;
  `,
  hover: css`
    background-color: #6a6e74;
    cursor: pointer;
  `,
  pressed: css`
    background-color: #666a71;
    transform: scale(0.95);
  `,
  focus: css`
    background-color: #b3b7bd;
    outline: 2px solid #23c7cd;
  `,
  disabled: css`
    opacity: 0.8;
    background-color: #b3b7bd;
    cursor: not-allowed;
  `,
};

const Clickable = styled.button<{ $size: number; $state: AvatarState }>`
  ${avatarBase}
  padding: 0;
  appearance: none;

  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    pointer-events: none;
    background-color: #e1e2e5;
    transform: none;
  }
`;

const NonClickable = styled.span<{ $size: number; $state: AvatarState }>`
  ${avatarBase}
  cursor: default;
  &:hover,
  &:active {
    transform: none;
  }
`;

const IconWrap = styled.span`
  width: 80%;
  height: 80%;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  & > svg,
  & > img {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

function DefaultUserIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path
        fill="currentColor"
        d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.34 0-10 1.67-10 5v3h20v-3c0-3.33-6.66-5-10-5z"
      />
    </svg>
  );
}

export const Avatar = (props: AvatarProps) => {
  const size = props.size;
  const state = props.state ?? "default";

  const isInteractive = !!props.onClick;
  const disabled = props.disabled ?? state == "disabled";

  const Wrapper = isInteractive ? Clickable : NonClickable;

  return (
    <Wrapper
      $size={size}
      $state={state}
      {...(isInteractive
        ? { onClick: props.onClick, disabled, type: "button" as const }
        : {})}
    >
      {props.style === "photo" ? (
        <img src={props.src} alt={props.alt ?? "avatar"} />
      ) : props.style === "text" ? (
        <span>{props.text}</span>
      ) : props.style === "emoji" ? (
        <span>{props.emoji}</span>
      ) : (
        <IconWrap>{props.icon ?? <DefaultUserIcon />}</IconWrap>
      )}
    </Wrapper>
  );
};
