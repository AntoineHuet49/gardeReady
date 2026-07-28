import express from 'express';
import { AuthController } from '~~/Controllers/AuthController';
import { GardeController } from '~~/Controllers/GardeController';
import { UsersController } from '~~/Controllers/UsersController';
import VehiculesController from '~~/Controllers/VehiculesController';
import ElementsController from '~~/Controllers/ElementsController';
import SectionsController from '~~/Controllers/SectionsController';
import { verifyToken, requireAdmin } from '~~/Middlewares/AuthMiddleware';
import { requireAuthProvider } from '~~/Utils/AuthProvider';

const router = express.Router();

// Default route
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ status: "ok", version: "1.0" }));
});

// Auth (publiques) - un seul provider actif à la fois, voir AUTH_PROVIDER / docs/AZURE_AD_SETUP.md
// Le provider actif est vérifié à chaque requête (requireAuthProvider), pas à l'import de ce
// fichier, pour ne pas dépendre de l'ordre de chargement de dotenv dans app.ts.
router.get("/auth/provider", AuthController.getAuthProvider)
router.post("/auth/login", requireAuthProvider("local"), AuthController.login)
router.get("/auth/microsoft/login", requireAuthProvider("microsoft"), AuthController.redirectToMicrosoft)
router.get("/auth/microsoft/callback", requireAuthProvider("microsoft"), AuthController.microsoftCallback)

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
router.patch('/users/:id/role', verifyToken, requireAdmin, UsersController.updateUserRole);
router.delete('/users/:id', verifyToken, requireAdmin, UsersController.deleteUser);

// Gardes (protégées - authentification requise)
router.get('/gardes', verifyToken, GardeController.getAllGardes);
router.post('/gardes', verifyToken, requireAdmin, GardeController.createGarde);
router.put('/gardes/:id/responsable', verifyToken, requireAdmin, GardeController.updateResponsable);
router.delete('/gardes/:id', verifyToken, requireAdmin, GardeController.deleteGarde);

export default router;
