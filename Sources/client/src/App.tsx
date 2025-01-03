import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Router from "./Routes/routes";

function App() {
    return (
        <QueryClientProvider client={new QueryClient()}>
            <Router />
        </QueryClientProvider>
    );
}

export default App;
