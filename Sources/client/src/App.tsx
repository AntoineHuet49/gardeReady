import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./App/Provider/UserProvider/UserProvider";
import Router from "./App/Routes/routes";
import { AdminProvider } from "./App/Provider/AdminProvider/AdminProvider";

function App() {
    return (
        <UserProvider>
            <AdminProvider>
                <QueryClientProvider client={new QueryClient()}>
                    <ToastContainer />
                    <Router />
                </QueryClientProvider>
            </AdminProvider>
        </UserProvider>
    );
}

export default App;
