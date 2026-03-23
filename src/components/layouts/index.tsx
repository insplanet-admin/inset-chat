import styled from "styled-components";

export const ScrollArea = styled.div`
  /* 핵심 로직 */
  width: 100%;
  height: 100%; /* 부모의 높이를 상속 */
  overflow-y: auto; /* 내용이 넘칠 때만 스크롤 */

  /* 커스텀 스크롤바 (선택 사항 - 브라우저 기본보다 훨씬 세련되게 보임) */
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
  /* 사이드바 내부도 메뉴가 많아지면 스크롤이 필요하므로 ScrollArea 재사용 가능 */
`;

export const Main = styled.main`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 브라우저 창 스크롤 차단 */
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
  background-color: #f4f4f4;
`;

export const FixedBottom = styled.div`
  grid-row: 3;
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 16px;
`;

export const ContentInner = styled.div<{
  size?: "narrow" | "wide" | "full" | null;
}>`
  width: 100%;
  margin: 0 auto; /* 중앙 정렬 */

  /* props.size에 따른 가변 너비 설정 */
  max-width: ${(props) => {
    if (props.size === "narrow") return "800px";
    if (props.size === "wide") return "1200px";
    return "100%"; // full
  }};

  padding: 0 20px; /* 양옆 최소 여백 */
`;
