import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { createHash } from '../index.js';

// Módulo de Mocking con Faker.js y bcrypt.
// Construye documentos simulados de usuarios y mascotas con el formato de MongoDB.

// Normaliza texto para construir correos electrónicos válidos sin tildes ni caracteres especiales.
const sanitizeEmailPart = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase() || 'user';

// Genera un único usuario simulado con contraseña "coder123" hasheada, rol seleccionado aleatoriamente entre user/admin y pets vacío.
export async function generateUser() {
    const _id = new mongoose.Types.ObjectId();
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    // Se incluye el ObjectId en el correo para evitar colisiones de índice único en MongoDB.
    const email = `${sanitizeEmailPart(first_name)}.${sanitizeEmailPart(last_name)}.${_id.toString()}@example.com`;
    const password = await createHash('coder123');
    const role = faker.helpers.arrayElement(['user', 'admin']);

    return {
        _id,
        first_name,
        last_name,
        email,
        password,
        role,
        pets: []
    };
}

// Genera una lista de N usuarios simulados esperando todos los hashes de bcrypt.
export async function createUsers(quantity = 50) {
    const count = Number(quantity);
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }

    return Promise.all(Array.from({ length: count }, () => generateUser()));
}

// Genera una mascota simulada compatible con el esquema Pet (sin owner vacío para no romper ObjectId).
export function generatePet() {
    const _id = new mongoose.Types.ObjectId();

    return {
        _id,
        name: faker.animal.petName(),
        specie: faker.animal.type(),
        birthDate: faker.date.birthdate(),
        adopted: false,
        image: faker.image.avatar()
    };
}

// Genera una lista de N mascotas simuladas.
export function createPets(quantity = 50) {
    const count = Number(quantity);
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }

    return Array.from({ length: count }, () => generatePet());
}

export const generateUsers = createUsers;
export const generatePets = createPets;
