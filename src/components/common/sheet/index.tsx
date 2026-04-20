import React, { ReactNode } from "react";
import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

// 1. 최상위 컨테이너 (Popover 속성을 가질 본체)
export const StyledSheetContent = styled.div`
  /* Popover API 기본 스타일 리셋 */
  border: none;
  padding: 0;
  margin: 0 0 0 auto; /* 오른쪽 정렬 */
  width: 100%;
  max-width: 400px;
  height: 100dvh;
  background: white;
  box-shadow: -10px 0 25px rgba(0, 0, 0, 0.1);

  /* Popover가 열렸을 때의 스타일 */
  &:popover-open {
    display: flex;
    flex-direction: column;
    animation: ${slideIn} 0.3s ease-out;
  }

  /* 배경 dimmed 처리 */
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }
`;

// 2. 헤더
export const SheetHeader = styled.header`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }
`;

// 3. 바디 (스크롤 영역)
export const SheetBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

// 4. 푸터
export const SheetFooter = styled.footer`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

interface SheetProps {
  children: ReactNode;
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
  children: ReactNode;
}

interface SheetContentProps {
  id: string;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ children }: SheetProps) {
  return <div>{children}</div>;
}

export function SheetTrigger({
  targetId,
  children,
  ...props
}: SheetTriggerProps) {
  return (
    <button
      {...props}
      // @ts-ignore: Popover API 속성
      popovertarget={targetId}
    >
      {children}
    </button>
  );
}

export function SheetContent({
  id,
  title,
  description,
  children,
  footer,
}: SheetContentProps) {
  return (
    <StyledSheetContent id={id} data-popover="auto">
      <SheetHeader>
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </SheetHeader>

      <SheetBody>{children}</SheetBody>

      {footer && <SheetFooter>{footer}</SheetFooter>}
    </StyledSheetContent>
  );
}
