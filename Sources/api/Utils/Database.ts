import { Sequelize } from "sequelize";

const sequelize = new Sequelize("gardeready", "root", "root", {
    host: "database",
    port: 5432,
    dialect: "postgres",
});

export const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}