import express from 'express';
import { AuthController } from '~~/Controllers/AuthController';
import VehiculesController from '~~/Controllers/VehiculesController';

const router = express.Router();

// Auth
router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)

// Vehicules
router.get('/vehicules', VehiculesController.getAllVehicules);
router.post('/vehicules', VehiculesController.addVehicule);

export default router;
