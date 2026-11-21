import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { createHash } from '../index.js';

const sanitizeEmailPart = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase() || 'user';

export async function generateUser() {
    const _id = new mongoose.Types.ObjectId();
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    // Incluye el ObjectId en el email para evitar colisiones con el índice unique de Users.
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

export async function createUsers(quantity = 50) {
    const count = Number(quantity);
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }

    return Promise.all(Array.from({ length: count }, () => generateUser()));
}

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

export function createPets(quantity = 50) {
    const count = Number(quantity);
    if (!Number.isInteger(count) || count <= 0) {
        return [];
    }

    return Array.from({ length: count }, () => generatePet());
}

export const generateUsers = createUsers;
export const generatePets = createPets;
