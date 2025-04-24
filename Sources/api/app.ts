import express from 'express';
import router from './routes/routes';
import { connectDatabase } from './Utils/Database';
import { configDotenv } from 'dotenv';

// Charge les variables globales
configDotenv({path: '.env', override: true});
configDotenv({path: '.env.local', override: true});

var cors = require('cors')

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

connectDatabase();

const PORT = process.env.PORT ?? 3000;

app.use(express.json())
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
