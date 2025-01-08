import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/css/transition.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <div className="flex justify-center">
        <App />
    </div>
);
