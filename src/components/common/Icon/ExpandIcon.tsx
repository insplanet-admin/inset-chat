import styled from "styled-components";

interface Props {
  isExpanded: boolean;
  children: React.ReactNode;
}

const ExpandIcon = ({ isExpanded, children }: Props) => {
  return <RotateWrapper isExpanded={isExpanded}>{children}</RotateWrapper>;
};

const RotateWrapper = styled.div<{ isExpanded: boolean }>`
  display: inline-flex;
  transition: transform 0.3s ease-in-out;
  /* isExpanded prop에 따라 회전 각도 결정 */
  transform: ${({ isExpanded }) =>
    isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
`;

export default ExpandIcon;
