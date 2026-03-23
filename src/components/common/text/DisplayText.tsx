import React from "react";
import styled from "styled-components";
import tokens from "../../../token";

type AllowedTags = "h1" | "h2" | "p" | "span";

type DisplayFontSize = "large" | "medium" | "small";

type BaseProps = {
  children: React.ReactNode;
  size?: DisplayFontSize;
};

type DisplayTextProps<T> = BaseProps & { as?: T };

const DisplayText = <T extends AllowedTags = "span">({
  as,
  children,
  size = "medium",
}: DisplayTextProps<T>) => (
  <StyledDisplayText as={as} size={size}>
    {children}
  </StyledDisplayText>
);

const StyledDisplayText = styled.span<{
  size: DisplayFontSize;
  as?: React.ElementType;
}>`
  font-size: ${({ size }) =>
    tokens["2.-semantic-tokens"].dark.scale.type.display[size].value};
  line-height: 1.2;
`;

export default DisplayText;
