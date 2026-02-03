import React, { useEffect } from "react";
import { SyncLoader } from "react-spinners";

const override = {
  display: "block",
  margin: "2",
  borderColor: "white",
};

export default function ChatMessages({ messages }) {
  return (
    <div className="chatMessages">
      {messages.map((mes, index) => (
        <div
          key={index}
          className={`msg ${mes.role == false && "me"} ${mes.status == "error" && "error"}`}
        >
          {mes.status === "pending" ? (
            <SyncLoader
              color="#ffffff"
              loading
              cssOverride={override}
              size={8}
              aria-label="Loading Spinner"
              data-testid="loader"
              speedMultiplier={0.6}
            />
          ) : (
            mes.content
          )}
        </div>
      ))}
    </div>
  );
}
