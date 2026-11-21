import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// Carga de variables de entorno desde el archivo .env y definición de valores por defecto.
config();

const isTestMode =
    process.env.MODE === 'test' ||
    process.env.NODE_ENV === 'test' ||
    process.argv.includes('test') ||
    process.argv.some((arg) => /mocha|test/i.test(arg));

// Resuelve la URI de MongoDB garantizando aislamiento de la base de datos en entorno de test.
const resolveMongoUri = () => {
    if (isTestMode) {
        if (process.env.MONGO_URI && /test/i.test(process.env.MONGO_URI)) {
            return process.env.MONGO_URI;
        }
        return process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/adoptme_test';
    }
    return process.env.MONGO_URI || 'mongodb://localhost:27017/AdoptMe';
};

export const environment = {
    MONGO_URI: resolveMongoUri(),
    PORT: isTestMode
        ? (process.env.PORT_TEST || process.env.PORT || 8080)
        : (process.env.PORT || 8080),
    MODE: isTestMode ? 'test' : (process.env.MODE || 'dev')
};

// Genera un hash irreversible de la contraseña utilizando bcrypt con 10 rondas de salt.
export const createHash = async (password) => {
    const salts = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salts);
};

// Compara una contraseña en texto plano contra el hash almacenado del usuario.
export const passwordValidation = async (user, password) => bcrypt.compare(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
