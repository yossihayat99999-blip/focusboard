import { Sequelize } from "sequelize";

const storageDb=process.env.STORAGE_DB_FILE || "./database.sqlite";

const sequelize= new Sequelize({
    dialect:"sqlite",
    storage:storageDb
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Connection to the database has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
};

export default sequelize;

