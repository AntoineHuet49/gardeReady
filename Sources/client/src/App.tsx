import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Router from "./Routes/routes";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <QueryClientProvider client={new QueryClient()}>
                <ToastContainer />
                <Router />
        </QueryClientProvider>
    );
}

export default App;
