import { Suspense, useState } from "react";
import React from "react";
import { RoomsPanel } from "./components/RoomsPanel";
import ChatRoom from "./components/ChatRoom";

import inset_icon from "./assets/Ai.svg";
import inset_logo from "./assets/inset.svg";

export default function ChatMain() {
  const [activeRoomId, setActiveRoomId] = useState(null);

  return (
    <div className="chatApp">
      <header className="chatHeader">
        <h2 className="chatTitle">Inset-Chat</h2>
      </header>

      <div className="chatBody">
        <aside className="roomsPanel">
          <div className="roomsHeader">
            <span>Rooms</span>
          </div>
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
