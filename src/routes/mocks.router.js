import { Router } from 'express';
import { getQuantity, getPets, getUsers, generateData } from '../controllers/mocks.controller.js';

// Router de Mocks montado en /api/mocks.
// Agrupa los endpoints de generación de mascotas/usuarios simulados e inserción en MongoDB.
const router = Router();

// Middleware que extrae el parámetro opcional quantity de la query.
router.use(getQuantity);

// Genera mascotas simuladas en memoria sin persistirlas en MongoDB.
router.get('/mockingpets', getPets);

// Genera 50 usuarios simulados por defecto (o según ?quantity=N) con formato MongoDB.
router.get('/mockingusers', getUsers);

// Genera e inserta en MongoDB la cantidad de usuarios y mascotas indicada en el body.
router.post('/generateData', generateData);

export default router;
