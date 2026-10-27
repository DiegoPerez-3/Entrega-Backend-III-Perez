import mongoose from 'mongoose';
import { createPets, createUsers } from '../utils/faker/mocks.js';
import { usersService, petsService } from '../services/index.js';

// Controlador para Mocks.
// Conecta las rutas de /api/mocks con el generador de datos sintéticos y los servicios de persistencia.
const MAX_MOCK_QUANTITY = 5000;

// Valida el parámetro opcional quantity recibido por query string (por defecto 50).
const parseQueryQuantity = (rawQuantity, defaultQuantity = 50) => {
    if (rawQuantity === undefined) {
        return { valid: true, value: defaultQuantity };
    }

    if (typeof rawQuantity !== 'string' || rawQuantity.trim() === '' || !/^\d+$/.test(rawQuantity.trim())) {
        return {
            valid: false,
            error: "El parámetro 'quantity' debe ser un número entero no negativo"
        };
    }

    const parsed = Number(rawQuantity.trim());
    if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > MAX_MOCK_QUANTITY) {
        return {
            valid: false,
            error: `El parámetro 'quantity' debe ser un entero entre 0 y ${MAX_MOCK_QUANTITY}`
        };
    }

    return { valid: true, value: parsed };
};

// Valida que los campos numéricos del body (users y pets) sean enteros no negativos.
const validateBodyCount = (value, fieldName) => {
    if (value === undefined || value === null) {
        return {
            valid: false,
            error: `Falta el parámetro obligatorio '${fieldName}' en el body`
        };
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > MAX_MOCK_QUANTITY) {
        return {
            valid: false,
            error: `El parámetro '${fieldName}' debe ser un número entero entre 0 y ${MAX_MOCK_QUANTITY}`
        };
    }

    return { valid: true, value };
};

// Middleware que asigna la cantidad solicitada por query a la request.
export const getQuantity = (req, res, next) => {
    req.quantity = req.query.quantity;
    next();
};

// Genera mascotas simuladas sin guardarlas en MongoDB (50 por defecto).
export const getPets = async (req, res) => {
    try {
        const rawQuantity = req.quantity !== undefined ? req.quantity : req.query.quantity;
        const validation = parseQueryQuantity(rawQuantity, 50);
        if (!validation.valid) {
            return res.status(400).send({ status: 'error', error: validation.error });
        }

        const pets = createPets(validation.value);
        return res.status(200).send({ status: 'success', payload: pets });
    } catch (error) {
        return res.status(500).send({ status: 'error', error: 'Error al generar mascotas simuladas' });
    }
};

// Genera usuarios simulados sin guardarlos en MongoDB (50 por defecto).
export const getUsers = async (req, res) => {
    try {
        const rawQuantity = req.quantity !== undefined ? req.quantity : req.query.quantity;
        const validation = parseQueryQuantity(rawQuantity, 50);
        if (!validation.valid) {
            return res.status(400).send({ status: 'error', error: validation.error });
        }

        const users = await createUsers(validation.value);
        return res.status(200).send({ status: 'success', payload: users });
    } catch (error) {
        return res.status(500).send({ status: 'error', error: 'Error al generar usuarios simulados' });
    }
};

// Genera e inserta en MongoDB la cantidad de usuarios y mascotas indicada en req.body.
export const generateData = async (req, res) => {
    const createdUsers = [];
    const createdPets = [];

    try {
        const { users, pets } = req.body || {};

        const usersValidation = validateBodyCount(users, 'users');
        if (!usersValidation.valid) {
            return res.status(400).send({ status: 'error', error: usersValidation.error });
        }

        const petsValidation = validateBodyCount(pets, 'pets');
        if (!petsValidation.valid) {
            return res.status(400).send({ status: 'error', error: petsValidation.error });
        }

        // Verificar que la conexión con MongoDB esté activa antes de intentar persistir.
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).send({
                status: 'error',
                error: 'La conexión a la base de datos no está disponible'
            });
        }

        const mockUsers = await createUsers(usersValidation.value);
        const mockPets = createPets(petsValidation.value);

        // Persistir los registros generados mediante los servicios existentes registrando cada inserción efectiva.
        await Promise.all(
            mockUsers.map(async (user) => {
                const created = await usersService.create(user);
                createdUsers.push(created);
            })
        );
        await Promise.all(
            mockPets.map(async (pet) => {
                const created = await petsService.create(pet);
                createdPets.push(created);
            })
        );

        return res.status(200).send({
            status: 'success',
            message: `Se generaron e insertaron ${createdUsers.length} usuarios y ${createdPets.length} mascotas en MongoDB`,
            payload: {
                usersInserted: createdUsers.length,
                petsInserted: createdPets.length,
                users: createdUsers,
                pets: createdPets
            }
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            error: 'Error al generar e insertar los datos en MongoDB',
            payload: {
                usersInserted: createdUsers.length,
                petsInserted: createdPets.length
            }
        });
    }
};
