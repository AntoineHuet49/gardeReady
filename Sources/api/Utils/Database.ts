import { Sequelize } from "sequelize";
import './LoadEnv';

// Utiliser DATABASE_URL en production, ou les paramètres individuels en développement
const databaseUrl = process.env.DATABASE_URL;

export const dbContext = databaseUrl 
    ? new Sequelize(databaseUrl, {
        dialect: "postgres",
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            ssl: false // O2switch ne supporte pas SSL pour les connexions locales
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