import { Router } from 'express';
import { getQuantity, getPets, getUsers, generateData } from '../controllers/mocks.controller.js';

const router = Router();

router.use(getQuantity);

router.get('/mockingpets', getPets);
router.get('/mockingusers', getUsers);
router.post('/generateData', generateData);

export default router;
