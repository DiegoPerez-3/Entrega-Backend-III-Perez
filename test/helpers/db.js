import mongoose from 'mongoose';
import { environment } from '../../src/utils/index.js';

// Verifica que la conexión activa apunte exclusivamente a una base de datos de pruebas.
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

// Conecta Mongoose a la base de datos de test si aún no existe una conexión activa.
export const connectTestDb = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(environment.MONGO_URI);
    }
    await assertIsTestDatabase();
};

// Limpia todas las colecciones de la base de datos de test para aislar cada caso de prueba.
export const clearTestDb = async () => {
    if (mongoose.connection.readyState !== 1) return;
    await assertIsTestDatabase();
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
};

// Cierra la conexión de Mongoose al finalizar la suite de pruebas.
export const disconnectTestDb = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};
