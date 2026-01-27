import { CSSProperties, ReactNode } from "react";

type RowProps = {
  children: ReactNode;
  gap?: number | string;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  style?: CSSProperties;
  className?: string;
};

const Row = ({
  children,
  gap = 0,
  align = "flex-start",
  justify = "flex-start",
  wrap = false,
  style,
  className,
}: RowProps) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: align,
        justifyContent: justify,
        gap,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Row;
