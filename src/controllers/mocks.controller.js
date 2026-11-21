import mongoose from 'mongoose';
import { createPets, createUsers } from '../utils/faker/mocks.js';
import { usersService, petsService } from '../services/index.js';

const MAX_MOCK_QUANTITY = 5000;

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

export const getQuantity = (req, res, next) => {
    req.quantity = req.query.quantity;
    next();
};

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

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).send({
                status: 'error',
                error: 'La conexión a la base de datos no está disponible'
            });
        }

        const mockUsers = await createUsers(usersValidation.value);
        const mockPets = createPets(petsValidation.value);

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
