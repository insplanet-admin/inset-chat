import ReactDOM from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App.jsx";

async function enableMocking() {
  if (!import.meta.env.DEV) return;

  const { worker } = await import("./mocks/browser.js");
  await worker.start({
    onUnhandledRequest: "bypass", // 모킹 안 된 요청은 실제로 통과
  });

  console.log("[MSW] worker started");
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
