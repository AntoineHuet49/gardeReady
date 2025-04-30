import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Router from "./Routes/routes";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./App/UserProvider/UserProvider";

function App() {
    return (
        <UserProvider>
            <QueryClientProvider client={new QueryClient()}>
                <ToastContainer />
                <Router />
            </QueryClientProvider>
        </UserProvider>
    );
}

export default App;
