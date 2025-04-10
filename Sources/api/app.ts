import express from 'express';
import router from './routes/routes';
import { connectDatabase } from './Utils/Database';

const app = express();

connectDatabase();

const PORT = process.env.PORT ?? 3000;

app.use("/", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
