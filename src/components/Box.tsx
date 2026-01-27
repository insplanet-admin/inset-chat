import { CSSProperties, ReactNode } from "react";

type BoxProps = {
  children?: ReactNode;
  // as?: keyof JSX.IntrinsicElements;
  direction?: CSSProperties["flexDirection"]; // default: column
  gap?: number | string;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  style?: CSSProperties;
  className?: string;
};

export const Box = ({
  children,
  // as = "div",
  direction = "column",
  gap = 0,
  align = "stretch",
  justify = "flex-start",
  wrap = false,
  style,
  className,
}: BoxProps) => {
  // const Component = as;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
export default Box;
