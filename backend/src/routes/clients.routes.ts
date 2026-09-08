import { Router } from 'express';
import {
  createClient,
  getMyClients,
  getAllClients,
  updateClientStatus,
  updateClient,
  deleteClient,
  getClientStats,
  getAppointments,
  getAllAppointments,
} from '../controllers/clients.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createClient);
router.get('/my', getMyClients);
router.get('/appointments', getAppointments);
router.get('/stats', requireAdmin, getClientStats);
router.get('/all-appointments', requireAdmin, getAllAppointments);
router.get('/', requireAdmin, getAllClients);
router.put('/:id/status', updateClientStatus);
router.put('/:id', updateClient);
router.delete('/:id', requireAdmin, deleteClient);

export default router;
