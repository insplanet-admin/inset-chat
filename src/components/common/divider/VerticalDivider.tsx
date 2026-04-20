import styled from "styled-components";

const VerticalDivider = styled.div<{ height?: number }>`
  width: 1px;
  height: ${({ height }) => height || "stretch"};
  background: red;
`;

export default VerticalDivider;
