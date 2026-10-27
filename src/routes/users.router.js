import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

// Router para la gestión de usuarios (/api/users).
const router = Router();

router.get('/', usersController.getAllUsers);
router.get('/:uid', usersController.getUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', usersController.deleteUser);

export default router;
