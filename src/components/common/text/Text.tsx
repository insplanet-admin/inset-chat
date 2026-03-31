import React from "react";
import styled from "styled-components";
import {
  TextVariants,
  FontWeight,
  TextElementType,
  textVariants,
} from "./TextTypes";
import tokens from "../../../utils/tokens";

interface BaseProps {
  children: React.ReactNode;
  variant?: TextVariants;
  weight?: FontWeight;
  color?: React.CSSProperties["color"];
}

interface TextProps<T> extends BaseProps {
  as?: T;
}

const Text = <T extends TextElementType = "span">({
  as,
  children,
  variant,
  weight,
  color,
}: TextProps<T>) => {
  return (
    <StyledText as={as} variant={variant} weight={weight} color={color}>
      {children}
    </StyledText>
  );
};

const StyledText = styled.span<{
  as?: React.ElementType;
  variant?: TextVariants;
  weight?: FontWeight;
}>`
  font-size: ${({ variant }) => variant && textVariants[variant].fontSize};
  letter-spacing: ${({ variant }) =>
    variant && textVariants[variant].letterSpacing};
  line-height: ${({ variant }) => variant && textVariants[variant].lineHeight};

  // fontWeight도 따로 정의해서 한번에 쓰는게 좋을 듯.
  font-weight: ${({ weight }) =>
    weight && tokens["1.-primitives"].typography["font-weight"][weight].value};

  color: ${({ color }) => color && color};
`;

export default Text;
