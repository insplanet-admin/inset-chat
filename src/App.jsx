import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import ChatMain from "./ChatMain.jsx";
import { Route, Routes } from "react-router-dom";

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
        <Route path="/" element={<ChatMain />} />
        <Route path="/:id" element={<ChatMain />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
