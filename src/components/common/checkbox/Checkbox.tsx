import { useEffect, useRef } from "react";
import styled, { css } from "styled-components";

type CheckboxSize = "small" | "medium";

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: CheckboxSize;
};
function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled,
  label,
  size = "medium",
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <StyledCheckbox size={size} disabled={disabled}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="control" />
      {label && <span className="label">{label}</span>}
    </StyledCheckbox>
  );
}

// TODO size tokens
const sizeStyles = {
  small: css`
    .control {
      width: 16px;
      height: 16px;
    }

    .control::after {
      width: 8px;
      height: 8px;
    }

    .label {
      font-size: 13px;
    }

    gap: 6px;
  `,

  medium: css`
    .control {
      width: 20px;
      height: 20px;
    }

    .control::after {
      width: 10px;
      height: 10px;
    }

    .label {
      font-size: 14px;
    }

    gap: 8px;
  `,
};

const StyledCheckbox = styled.label<{
  size: CheckboxSize;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  position: relative;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .control {
    display: grid;
    place-items: center;
    border-radius: 4px;
    border: 2px solid #000;
    transition: 0.2s;
    position: relative;
  }

  /* 기본 표시 (checked / indeterminate 공용) */
  .control::after {
    content: "";
    background: white;
    transform: scale(0);
    transition: 0.15s ease;
    border-radius: 2px;
  }

  /* checked */
  input:checked + .control {
    border-color: crimson;
    background: crimson;
  }

  input:checked + .control::after {
    transform: scale(1);
    width: 8px;
    height: 8px;
  }

  /* ⭐ indeterminate */
  input:indeterminate + .control {
    border-color: blue;
    background: blue;
  }

  input:indeterminate + .control::after {
    transform: scale(1);
  }

  input:focus-visible + .control {
    outline: 2px solid green;
    outline-offset: 2px;
  }

  input:disabled + .control {
    opacity: 0.4;
  }

  input:disabled ~ .label {
    opacity: 0.4;
  }

  ${({ size }) => sizeStyles[size]}
`;

export default Checkbox;
