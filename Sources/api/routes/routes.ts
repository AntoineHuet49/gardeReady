import express from 'express';
import { AuthController } from '~~/Controllers/AuthController';
import { GardeController } from '~~/Controllers/GardeController';
import { UsersController } from '~~/Controllers/UsersController';
import VehiculesController from '~~/Controllers/VehiculesController';
import ElementsController from '~~/Controllers/ElementsController';
import SectionsController from '~~/Controllers/SectionsController';

const router = express.Router();

// Auth
router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)

// Vehicules
router.get('/vehicules', VehiculesController.getAllVehicules);
router.get('/vehicules/:id', VehiculesController.getOneVehiculeWithElements);
router.post('/vehicules', VehiculesController.addVehicule);
router.post('/vehicules/verifications/:id', VehiculesController.validateVehicule);

// Elements
router.post('/elements', ElementsController.createElement);
router.put('/elements/:id', ElementsController.updateElement);
router.delete('/elements/:id', ElementsController.deleteElement);

// Sections
router.post('/sections', SectionsController.createSection);
router.put('/sections/:id', SectionsController.updateSection);
router.delete('/sections/:id', SectionsController.deleteSection);

// Users
router.get('/users', UsersController.getAllUsers);
router.post('/users', UsersController.createUser);

// Gardes
router.get('/gardes', GardeController.getAllGardes);

export default router;
