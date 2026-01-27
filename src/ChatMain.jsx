import { Suspense, useState } from "react";
import React from "react";
import { RoomsPanel } from "./components/RoomsPanel";
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
            <>
              <div className="chatPanelHeader">
                <span className="chatRoomName">General</span>
              </div>

              <div className="chatMessages">
                <div className="msg">안녕!</div>
                <div className="msg me">반가워요</div>
              </div>

              <form className="chatInputBar">
                <input
                  className="chatInput"
                  placeholder="메시지를 입력하세요..."
                />
                <button className="sendBtn" type="submit">
                  Send
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
