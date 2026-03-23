import React from "react";
import styled from "styled-components";

export type FontSize = 16 | 14 | 12 | 11;
type LineHeight = React.CSSProperties["lineHeight"];

type BodyTextProps<T extends React.ElementType = "span"> = {
  as?: T;
  children: React.ReactNode;
  //   fontWeight?: ;
  size?: FontSize;
  lineHeight?: LineHeight;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

const BodyText = ({
  as,
  children,
  //   fontWeight,
  size,
  lineHeight,
  ...rest
}: BodyTextProps) => {
  return (
    <StyledBodyText
      as={as}
      //   fontWeight={fontWeight}
      size={size}
      lineHeight={lineHeight}
      {...rest}
    >
      {children}
    </StyledBodyText>
  );
};

// const Container = styled.div``

const StyledBodyText = styled.span<{
  //   fontWeight?: FontWeightToken;
  size?: FontSize;
  lineHeight?: LineHeight;
  color?: React.CSSProperties["color"];
}>`
  font-size: ${({ size }) => size ?? "14px"};
  line-height: ${({ lineHeight }) => lineHeight ?? 1.4};
`;

export default BodyText;
