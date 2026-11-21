import mongoose from 'mongoose';
import { environment } from '../../src/utils/index.js';

// Impide ejecutar deleteMany sobre una base que no sea de pruebas.
const assertIsTestDatabase = async () => {
    const dbName = mongoose.connection?.name || '';
    if (!dbName.toLowerCase().includes('test')) {
        await mongoose.disconnect();
        throw new Error(
            `OPERACIÓN ABORTADA: Se intentó ejecutar tests contra la base "${dbName}". ` +
            'El nombre de la base de datos de pruebas debe contener "test" (ej. adoptme_test).'
        );
    }
};

export const connectTestDb = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(environment.MONGO_URI);
    }
    await assertIsTestDatabase();
};

export const clearTestDb = async () => {
    if (mongoose.connection.readyState !== 1) return;
    await assertIsTestDatabase();
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
};

export const disconnectTestDb = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};
