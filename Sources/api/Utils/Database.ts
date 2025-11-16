import { Sequelize } from "sequelize";
import { configDotenv } from 'dotenv';

// Charger les variables d'environnement en premier
configDotenv({path: '.env', override: true});
configDotenv({path: '.env.local', override: true});

// Utiliser DATABASE_URL en production, ou les paramètres individuels en développement
const databaseUrl = process.env.DATABASE_URL;

export const dbContext = databaseUrl 
    ? new Sequelize(databaseUrl, {
        dialect: "postgres",
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    })
    : new Sequelize("gardeready", "root", "root", {
        host: "database",
        port: 5432,
        dialect: "postgres",
        logging: console.log
    });

export const connectDatabase = async () => {
    try {
        await dbContext.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Synchroniser les modèles en développement
        if (process.env.NODE_ENV === 'development') {
            await dbContext.sync({ alter: true });
            console.log('🔄 Database models synchronized.');
        }
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error; // Relancer l'erreur pour que l'app s'arrête si la DB n'est pas accessible
    }
}