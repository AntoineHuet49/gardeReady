import express from 'express';
import { AuthController } from '~~/Controllers/AuthController';
import { UsersController } from '~~/Controllers/UsersController';
import VehiculesController from '~~/Controllers/VehiculesController';

const router = express.Router();

// Auth
router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)

// Vehicules
router.get('/vehicules', VehiculesController.getAllVehicules);
router.get('/vehicules/:id', VehiculesController.getOneVehiculeWithElements);
router.post('/vehicules', VehiculesController.addVehicule);
router.post('/vehicules/verifications/:id', VehiculesController.validateVehicule);

// Users
router.get('/users', UsersController.getAllUsers);

export default router;
