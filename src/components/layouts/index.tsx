import styled from "styled-components";

import { css } from "styled-components";

export const scrollbarStyle = css`
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

export const ScrollArea = styled.div`
  width: 100%;
  height: 100%; /* 부모의 높이를 상속 */

  overflow-x: hidden;
  overflow-y: auto;

  ${scrollbarStyle};
`;

export const Page = styled.div<{ hasSidebar?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.hasSidebar ? "260px 1fr" : "1fr")};
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

export const Sidebar = styled.aside`
  background-color: #f8f9fa;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;

  /* 핵심: 부모 높이를 다 채우고 고정 */
  height: 100%;
  position: relative; /* sticky 대신 고정된 영역으로 작동 */

  /* 사이드바 내부 메뉴가 많아질 경우를 대비 */
  overflow-y: auto;
`;

export const Main = styled.main`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  width: 100%;
  // overflow: hidden;
`;

export const FixedTop = styled.div`
  grid-row: 1; /* 첫 번째 줄 차지 */
  z-index: 100;
  background: #fff;
  position: sticky;
  top: 0;
`;

export const ScrollBody = styled(ScrollArea)`
  grid-row: 2;
  /* 부모가 준 1fr 공간을 꽉 채우며 내부에서만 스크롤 */
`;

export const FixedBottom = styled.div`
  grid-row: 3;
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: #fff;
  padding: 16px;
`;

export const ContentInner = styled.div<{
  size?: "narrow" | "wide" | "full" | null;
}>`
  width: 100%;
  margin: 0 auto;

  /* props.size에 따른 가변 너비 설정 */
  max-width: ${(props) => {
    if (props.size === "narrow") return "800px";
    if (props.size === "wide") return "1200px";
    return "100%"; // full
  }};

  padding: 0 2rem;
  box-sizing: border-box;
`;
