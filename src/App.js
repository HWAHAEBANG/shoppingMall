import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import { AuthcontextProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthcontextProvider>
        <Navbar />
        <Outlet />
      </AuthcontextProvider>
    </QueryClientProvider>
  );
}

export default App;
