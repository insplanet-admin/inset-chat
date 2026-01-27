import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import RoomPage from "./RoomPage.jsx";
import ChatMain from "./ChatMain.jsx";

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
      <ChatMain />
    </QueryClientProvider>
  );
}

export default App;
