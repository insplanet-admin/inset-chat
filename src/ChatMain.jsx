import ChatRoom from "./components/ChatRoom";

import Text from "./components/Text";
import { Menu, Search } from "lucide-react";
import Spacer from "./components/Spacer";
import Row from "./components/Row";
import ConversationArea from "./components/ConversationArea";
import {
  ContentInner,
  FixedBottom,
  FixedTop,
  Main,
  Page,
  Sidebar,
} from "./components/layouts";

// <div className="chatApp">
//   <aside className="sidebar">

//   </aside>
{
  /* 
      <main className="chatPanel">
      </main> */
}

export default function ChatMain() {
  return (
    <Page hasSidebar>
      <Sidebar>
        {/* <header className="chatHeader">
            <h2 className="chatTitle">insplanet</h2>
          </header> */}
        <div style={{ width: "100%", padding: "0 .25rem" }}>
          <Row justify="space-between" align="center" style={{ width: "100%" }}>
            <button className="iconButton">
              <Menu size={20} />
            </button>
            <button className="iconButton">
              <Search size={20} />
            </button>
          </Row>
        </div>
        <Spacer size={4} />
        <Spacer size={4} />
        <Spacer size={4} />
        <div style={{ padding: "0 .75rem" }}>
          <Text variant="label" color="#999">
            내 채팅
          </Text>
        </div>
        <Spacer size={1} />
        <ConversationArea />
      </Sidebar>
      <Main>
        {/* <ScrollBody>
          <div style={{ padding: "20px" }}>
            <h2 style={{ height: "100vh" }}>컨텐츠 제목</h2>
            <p>매우 긴 내용들...</p>
          </div>
        </ScrollBody> */}

        <ContentInner size="wide">
          <FixedTop></FixedTop>

          <ChatRoom />
        </ContentInner>
        <FixedBottom></FixedBottom>
      </Main>
    </Page>
  );
}
