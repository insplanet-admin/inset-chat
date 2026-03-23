import React from "react";
import styled from "styled-components";

const StyledText = styled.span`
  font-weight: ${({ $fontWeight }) => $fontWeight ?? 400};
  font-size: ${({ $size }) => $size ?? "14px"};
  line-height: ${({ $lineHeight }) => $lineHeight ?? 1.4};
  letter-spacing: ${({ $letterSpacing }) => $letterSpacing ?? "0"};
`;

export default function JSBodyText({
  as = "span",
  children,
  fontWeight,
  size,
  lineHeight,
  letterSpacing,

  ...rest
}) {
  return (
    <StyledText
      as={as}
      $fontWeight={fontWeight}
      $size={size}
      $lineHeight={lineHeight}
      $letterSpacing={letterSpacing}
      {...rest}
    >
      {children}
    </StyledText>
  );
}
