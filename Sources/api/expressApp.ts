// Application Express sans connexion DB ni écoute de port : importable par les tests (supertest).
// Le point d'entrée qui démarre le serveur est app.ts.
import './Utils/LoadEnv';
import express from 'express';
import router from './routes/routes';
import cookieParser from 'cookie-parser';
import { auditLog } from './Middlewares/AuditMiddleware';
import { configureLogLevel, createLogger } from './Utils/Logger';

// Configure le niveau de log
configureLogLevel();

const logger = createLogger('Application');

var cors = require('cors');

// Configuration CORS pour développement et production
const allowedOrigins = [
    "http://localhost:5173", // Développement local
    "http://localhost:3000", // Alternative locale
    process.env.FRONTEND_URL, // URL du frontend en production
].filter(Boolean); // Retire les valeurs undefined

const app = express();
app.use(cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        logger.debug(`CORS request from origin: ${origin}`);
        logger.debug(`Environment: ${process.env.NODE_ENV}`);
        logger.debug(`Allowed origins`, allowedOrigins);
        
        // Permet les requêtes sans origin (comme le frontend servi depuis le même domaine)
        if (!origin) return callback(null, true);
        
        // Vérifie si l'origin est dans la liste autorisée
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes API (doit être avant le fallback SPA)
app.use("/api", auditLog, router);

// Serve static files du frontend buildé
app.use(express.static('Sources/api/public'));

// Fallback pour SPA - renvoie index.html pour toute route client (ex: refresh sur /vehicules)
// IMPORTANT: Doit être APRÈS les autres routes. Syntaxe Express 5 : '/{*splat}' (et non '*')
app.get('/{*splat}', (req, res) => {
    res.sendFile('Sources/api/public/index.html', { root: '.' });
});

export default app;
