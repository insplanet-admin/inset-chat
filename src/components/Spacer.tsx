type Space = 1 | 2 | 3 | 4;

type SpacerProps = {
  size: Space;
  horizontal?: boolean;
};

const SPACE_UNIT_REM = 0.25;

const Spacer = ({ size, horizontal = false }: SpacerProps) => {
  const value = `${size * SPACE_UNIT_REM}rem`;

  return (
    <div
      aria-hidden
      style={
        horizontal ? { width: value, height: 1 } : { height: value, width: 1 }
      }
    />
  );
};

export default Spacer;
