import { Sequelize } from "sequelize";

export const dbContext = new Sequelize("gardeready", "root", "root", {
    host: "database",
    port: 5432,
    dialect: "postgres",
});

export const connectDatabase = async () => {
    try {
        await dbContext.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}