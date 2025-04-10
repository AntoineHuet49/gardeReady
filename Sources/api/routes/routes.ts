import express, { Request, Response } from 'express';
import VehiculesController from '~~/Controllers/VehiculesController';

const router = express.Router();

router.get('/vehicules', VehiculesController.getAllVehicules);

router.post('/vehicules', VehiculesController.addVehicule);

router.get('/about', (req: Request, res: Response) => {
  res.send('About Page');
});

export default router;
