import React, { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { RoomsList } from "./RoomsList.jsx";
import { SyncLoader } from "react-spinners";

const override = {
  display: "block",
  margin: "2",
  borderColor: "white",
};

function RoomsSkeleton() {
  return (
    <div className="roomsList">
      <div className="loader">
        <SyncLoader
          color={"#ffffff"}
          loading={true}
          cssOverride={override}
          size={20}
          aria-label="Loading Spinner"
          data-testid="loader"
          speedMultiplier={1}
        />
      </div>
    </div>
  );
}

function RoomsErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        방 목록을 불러오지 못했어요: {error.message}
      </div>
      <button type="button" onClick={resetErrorBoundary}>
        다시 시도
      </button>
    </div>
  );
}

export function RoomsPanel({ activeRoomId, setActiveRoomId }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={RoomsErrorFallback}>
          <Suspense fallback={<RoomsSkeleton />}>
            <RoomsList
              activeRoomId={activeRoomId}
              onSelectRoom={setActiveRoomId}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
