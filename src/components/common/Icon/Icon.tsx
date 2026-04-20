import { IconName } from "./icon-types";

interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
}

const Icon = ({ name, size = 24, color = "currentColor" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      fill={color}
      style={{ color: color }}
      aria-hidden="true"
    >
      <use href={`/sprite.svg#icon-${name}`} />
    </svg>
  );
};

export default Icon;
