import styled, { css } from "styled-components";

type RadioValue = string;

type RadioSize = "small" | "medium";

type RadioOption<T extends RadioValue> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type RadioGroupProps<T extends RadioValue> = {
  name: string;
  value: T;
  options: RadioOption<T>[];
  size?: RadioSize;
  onChange: (value: T) => void;
};

const sizeMap = {
  small: 16,
  medium: 20,
} as const;

function RadioGroup<T extends RadioValue>({
  name,
  value,
  options,
  size = "medium",
  onChange,
}: RadioGroupProps<T>) {
  return (
    <StyledRadioGroup role="radiogroup" size={size}>
      {options.map((opt) => (
        <label key={opt.value}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
            // onChange={(e) => onChange(e.target.value as T)}
          />
          <span className="control" />
          <span className="label">{opt.label}</span>
        </label>
      ))}
    </StyledRadioGroup>
  );
}

const sizeStyles = {
  small: css`
    .control {
      width: 16px;
      height: 16px;
      border-width: 2px;
    }

    .control::after {
      width: 8px;
      height: 8px;
    }

    label {
      gap: 6px;
    }

    .label {
      font-size: 13px;
    }
  `,

  medium: css`
    .control {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .control::after {
      width: 10px;
      height: 10px;
    }

    label {
      gap: 8px;
    }

    .label {
      font-size: 14px;
    }
  `,
};

const StyledRadioGroup = styled.div<{ size: RadioSize }>`
  label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    margin-right: 20px;
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .control {
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid #000;
    transition: 0.2s;
  }

  .control::after {
    content: "";
    border-radius: 50%;
    background: crimson;
    transform: scale(0);
    transition: 0.2s;
  }

  input:checked + .control {
    border-color: crimson;
  }

  input:checked + .control::after {
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

  /* ⭐ 여기 핵심 */
  ${({ size }) => sizeStyles[size]}
`;

export default RadioGroup;
