import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

config();

const isTestMode =
    process.env.MODE === 'test' ||
    process.env.NODE_ENV === 'test' ||
    process.argv.includes('test') ||
    process.argv.some((arg) => /mocha|test/i.test(arg));

// En modo test fuerza el uso de una base de datos separada (adoptme_test) para no tocar AdoptMe.
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

export const createHash = async (password) => {
    const salts = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salts);
};

export const passwordValidation = async (user, password) => bcrypt.compare(password, user.password);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
