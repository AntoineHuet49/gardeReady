import './Utils/LoadEnv';
import app from './expressApp';
import { connectDatabase } from './Utils/Database';
import { getJwtSecret } from './Services/AuthService';
import { createLogger } from './Utils/Logger';

const logger = createLogger('Application');

try {
    getJwtSecret();
} catch (error) {
    logger.error('JWT_SECRET est obligatoire', error);
    process.exit(1);
}

// Initialiser la base de données de manière asynchrone
connectDatabase().catch(error => {
    logger.error('Failed to connect to database on startup', error);
    process.exit(1); // Arrêter l'application si la DB n'est pas accessible
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});
