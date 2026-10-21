import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/css/transition.css";
import App from "./App.tsx";
import { configureLogLevel } from "./App/utils/Logger";

// Configure le niveau de log au démarrage
configureLogLevel();

// Safari iOS ignore user-scalable=no pour le pincement : on bloque le geste (zoom volontairement désactivé)
document.addEventListener("gesturestart", (e) => e.preventDefault());

createRoot(document.getElementById("root")!).render(
    <div className="flex justify-center">
        <App />
    </div>
);
