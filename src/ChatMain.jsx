import ChatRoom from "./components/ChatRoom";

import MenuItem from "./components/MenuItem";
import Text from "./components/Text";
import { FilePen, Menu, Search } from "lucide-react";
import Spacer from "./components/Spacer";
import Row from "./components/Row";
import ConversationArea from "./components/ConversationArea";

export default function ChatMain() {
  return (
    <div className="chatApp">
      <aside className="sidebar">
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
        <MenuItem icon={<FilePen size={16} />} onClick={() => {}}>
          새 채팅
        </MenuItem>
        <Spacer size={4} />
        <div style={{ padding: "0 .75rem" }}>
          <Text variant="label" color="#999">
            내 채팅
          </Text>
        </div>
        <Spacer size={1} />
        <ConversationArea />
      </aside>

      <main className="chatPanel">
        <ChatRoom />
      </main>
    </div>
  );
}
