import React, { CSSProperties, ReactNode } from "react";

// 1. 공통 속성 타입 정의
interface LayoutProps {
  children?: ReactNode;
  gap?: number | string;
  padding?: number | string;
  margin?: number | string;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  /** 피그마의 'Fill Container' 역할 */
  fill?: boolean;
  /** 추가적인 스타일 확장을 위한 클래스네임 */
  className?: string;
  style?: CSSProperties;
}

// 2. Base Box 컴포넌트 (모든 레이아웃의 기초)
export const Box = ({
  children,
  gap,
  padding,
  margin,
  width,
  height,
  align,
  justify,
  fill,
  style,
  ...props
}: LayoutProps & { direction?: CSSProperties["flexDirection"] }) => {
  const boxStyle: CSSProperties = {
    display: "flex",
    flexDirection: props.direction || "column",
    gap: typeof gap === "number" ? `${gap}px` : gap,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    margin: typeof margin === "number" ? `${margin}px` : margin,
    alignItems: align,
    justifyContent: justify,
    width: fill ? "100%" : width,
    height: height,
    flexGrow: fill ? 1 : undefined,
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div style={boxStyle} {...props}>
      {children}
    </div>
  );
};

// 3. Row 컴포넌트 (가로 정렬 특화)
export const Row = (props: LayoutProps) => {
  return (
    <Box
      direction="row"
      align={props.align || "center"} // 기본적으로 세로 중앙 정렬
      width={props.width || "100%"} // Row는 보통 가로를 꽉 채우는 '행' 단위
      {...props}
    />
  );
};

// 4. Stack 컴포넌트 (세로 정렬 특화 - 피그마 Vertical Auto Layout)
export const Stack = (props: LayoutProps) => {
  return <Box direction="column" {...props} />;
};
