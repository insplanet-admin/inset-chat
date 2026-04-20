import React from "react";
import styled, { css } from "styled-components";

interface MenuItemProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

const MenuItem = ({
  children,
  icon,
  onClick,
  disabled,
  danger,
}: MenuItemProps) => {
  return (
    <StyledMenuItem onClick={onClick} $disabled={disabled} $danger={danger}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {children}
    </StyledMenuItem>
  );
};

const StyledMenuItem = styled.button<{
  $danger?: boolean;
  $disabled?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;

  &:hover {
    background-color: #f5f5f5;
  }

  ${(props) =>
    props.$disabled &&
    css`
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    `}

  ${(props) =>
    props.$danger &&
    css`
      color: #ff4d4f;
      &:hover {
        background-color: #fff1f0;
      }
    `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 18px;
`;

export default MenuItem;
