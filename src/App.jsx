import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom.js";
import ChatMain from "./pages/ChatMain";
import PasswordPage from "./pages/PasswordPage";
import ChatLayout from "./components/ChatLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<PasswordPage />} />
        <Route element={<ChatLayout />}>
          <Route path="/chat" element={<ChatMain />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
