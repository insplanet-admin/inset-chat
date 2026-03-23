import React from "react";
import styled from "styled-components";
import tokens from "../../../token";

type AllowedTags = "h1" | "h2" | "p" | "span";

export type HeadingFontSize =
  | "xlarge"
  | "large"
  | "medium"
  | "small"
  | "xsmall";

type BaseProps = {
  children: React.ReactNode;
  size?: HeadingFontSize;
};

type HeadingTextProps<T> = BaseProps & { as?: T };

// 이 부분에 T를 쓰지 않으면 T를 추론하지 못함.
const HeadingText = <T extends AllowedTags = "span">({
  as,
  children,
  size = "medium",
}: HeadingTextProps<T>) => (
  <StyledHeadingText as={as} size={size}>
    {children}
  </StyledHeadingText>
);
const StyledHeadingText = styled.span<{
  size: HeadingFontSize;
  // AllowedTag가 React.ElementType이라는 것을 어딘가는 정해야함.
  as?: React.ElementType;
}>`
  font-size: ${({ size }) =>
    // 단축해서 사용.
    tokens["2.-semantic-tokens"].dark.scale.type.heading[size].value};
  font-weight: ${tokens["1.-primitives"].typography["font-weight"].bold.value};
  letter-spacing: ${tokens["1.-primitives"].typography["letter-spacing"][
    "tight-1"
  ].value};
  font-family: ${tokens["1.-primitives"].typography["font-family"].primary
    .value};
  line-height: 1.3;
`;

export default HeadingText;
