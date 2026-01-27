import { CSSProperties, ReactNode } from "react";

type TextVariant =
  | "body"
  | "bodyBold"
  | "label"
  | "caption"
  | "title"
  | "subtitle";

type TextProps = {
  children: ReactNode;
  variant?: TextVariant;
  // as?: any;
  color?: CSSProperties["color"];
  align?: CSSProperties["textAlign"];
  weight?: CSSProperties["fontWeight"];
  truncate?: boolean;
  style?: CSSProperties;
  className?: string;
};

const variantStyleMap: Record<TextVariant, CSSProperties> = {
  body: {
    fontSize: "14px",
    lineHeight: 1.5,
  },
  bodyBold: {
    fontSize: "14px",
    lineHeight: 1.5,
  },
  label: {
    fontSize: "14px",
    lineHeight: 1.5,
  },
  caption: {
    fontSize: "12px",
    color: "#666",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: "16px",
    fontWeight: 500,
  },
};

export const Text = ({
  children,
  variant = "body",
  color,
  align,
  weight,
  truncate = false,
  style,
  className,
}: TextProps) => {
  // const Component = as as ElementType;

  return (
    <span
      className={className}
      style={{
        ...variantStyleMap[variant],
        color,
        textAlign: align,
        fontWeight: weight,
        ...(truncate && {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }),
        ...style,
      }}
    >
      {children}
    </span>
  );
};
export default Text;
