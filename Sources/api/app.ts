import express from 'express';
import router from './routes/routes';
import { connectDatabase } from './Utils/Database';
import { configDotenv } from 'dotenv';

// Charge les variables globales
configDotenv({path: '.env', override: true});
configDotenv({path: '.env.local', override: true});

var cors = require('cors')

// Configuration CORS pour développement et production
const allowedOrigins = [
    "http://localhost:5173", // Développement local
    "http://localhost:3000", // Alternative locale
    process.env.FRONTEND_URL, // URL du frontend en production
].filter(Boolean); // Retire les valeurs undefined

const app = express();
app.use(cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Permet les requêtes sans origin (comme les apps mobiles) en développement
        if (!origin && process.env.NODE_ENV === 'development') return callback(null, true);
        
        // Vérifie si l'origin est dans la liste autorisée
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

connectDatabase();

const PORT = process.env.PORT ?? 3000;

app.use(express.json())
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
