import express from 'express';
import { AuthController } from '~~/Controllers/AuthController';
import { GardeController } from '~~/Controllers/GardeController';
import { UsersController } from '~~/Controllers/UsersController';
import VehiculesController from '~~/Controllers/VehiculesController';
import ElementsController from '~~/Controllers/ElementsController';
import SectionsController from '~~/Controllers/SectionsController';
import { verifyToken, requireAdmin } from '~~/Middlewares/AuthMiddleware';

const router = express.Router();

// Default route
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ status: "ok", version: "1.0" }));
});

// Auth (publiques)
router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)

// Vehicules (protégées - authentification requise)
router.get('/vehicules', verifyToken, VehiculesController.getAllVehicules);
router.get('/vehicules/:id', verifyToken, VehiculesController.getOneVehiculeWithElements);
router.post('/vehicules', verifyToken, requireAdmin, VehiculesController.addVehicule);
router.delete('/vehicules/:id', verifyToken, requireAdmin, VehiculesController.deleteVehicule);
router.post('/vehicules/verifications/:id', verifyToken, VehiculesController.validateVehicule);

// Elements (protégées - admin requis)
router.post('/elements', verifyToken, requireAdmin, ElementsController.createElement);
router.put('/elements/:id', verifyToken, requireAdmin, ElementsController.updateElement);
router.delete('/elements/:id', verifyToken, requireAdmin, ElementsController.deleteElement);

// Sections (protégées - admin requis)
router.post('/sections', verifyToken, requireAdmin, SectionsController.createSection);
router.put('/sections/:id', verifyToken, requireAdmin, SectionsController.updateSection);
router.delete('/sections/:id', verifyToken, requireAdmin, SectionsController.deleteSection);

// Users (protégées - admin requis)
router.get('/users', verifyToken, requireAdmin, UsersController.getAllUsers);
router.post('/users', verifyToken, requireAdmin, UsersController.createUser);

// Gardes (protégées - authentification requise)
router.get('/gardes', verifyToken, GardeController.getAllGardes);

export default router;
