import { Suspense, useState } from "react";
import { RoomsPanel } from "./components/RoomsPanel";
import ChatRoom from "./components/ChatRoom";

import inset_icon from "./assets/Ai.svg";
import inset_logo from "./assets/inset.svg";
import MenuItem from "./components/MenuItem";
import Text from "./components/Text";
import { FilePen } from "lucide-react";
import Spacer from "./components/Spacer";

export default function ChatMain() {
  const [activeRoomId, setActiveRoomId] = useState(null);

  return (
    <div className="chatApp">
      <div className="chatBody">
        <aside className="roomsPanel">
          <header className="chatHeader">
            <h2 className="chatTitle">insplanet</h2>
          </header>
          <Spacer size={4} />
          <Spacer size={4} />
          <MenuItem icon={<FilePen size={16} />} onClick={() => {}}>
            새 채팅
          </MenuItem>
          <Spacer size={4} />
          <Text variant="label" color="#999">
            내 채팅
          </Text>
          <Spacer size={1} />
          <RoomsPanel
            activeRoomId={activeRoomId}
            setActiveRoomId={setActiveRoomId}
          />
        </aside>

        <main className="chatPanel">
          {!activeRoomId ? (
            <div className="chatLogo">
              <img
                className="chatEmptyIcon"
                src={inset_icon}
                alt="Inset icon"
              />
              <img
                className="chatEmptyLogo"
                src={inset_logo}
                alt="Inset logo"
              />
            </div>
          ) : (
            <ChatRoom key={activeRoomId} roomID={activeRoomId} />
          )}
        </main>
      </div>
    </div>
  );
}
