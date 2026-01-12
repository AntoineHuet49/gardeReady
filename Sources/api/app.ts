import express from 'express';
import router from './routes/routes';
import { connectDatabase } from './Utils/Database';
import { configDotenv } from 'dotenv';
import cookieParser from 'cookie-parser';
import { configureLogLevel, createLogger } from './Utils/Logger';

// Charge les variables globales
configDotenv({path: '.env', override: true});
configDotenv({path: '.env.local', override: true});

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

// Initialiser la base de données de manière asynchrone
connectDatabase().catch(error => {
    logger.error('Failed to connect to database on startup', error);
    process.exit(1); // Arrêter l'application si la DB n'est pas accessible
});

const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());

// Routes API (doit être avant le fallback SPA)
app.use("/api", router);

// Serve static files du frontend buildé
app.use(express.static('Sources/api/public'));

// Fallback pour SPA - redirige toutes les routes vers index.html
// IMPORTANT: Doit être APRÈS les autres routes
app.get('/', (req, res) => {
    res.sendFile('Sources/api/public/index.html', { root: '.' });
});

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});
