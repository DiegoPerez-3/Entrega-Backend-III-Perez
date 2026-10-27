import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

// Carga de variables de entorno desde el archivo .env y definición de valores por defecto.
config();
export const environment = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/AdoptMe',
    PORT: process.env.PORT || 8080
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
