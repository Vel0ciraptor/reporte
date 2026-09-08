import { Router } from 'express';
import { getAllPromotores, createPromotor, getPromotorClients, getVehicleStats, getPromotorPerformance } from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/promotores', getAllPromotores);
router.post('/promotores', createPromotor);
router.get('/promotores/:id/clients', getPromotorClients);
router.get('/vehicle-stats', getVehicleStats);
router.get('/promotor-performance', getPromotorPerformance);

export default router;
