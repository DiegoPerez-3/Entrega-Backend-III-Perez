import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import __dirname from '../utils/index.js';

// Normaliza la ruta de archivos YAML con barras POSIX para compatibilidad multiplataforma con glob.
const docsPattern = path.join(__dirname, '../docs/**/*.yaml').replace(/\\/g, '/');

const swaggerOpts = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'AdoptMe API',
            version: '1.0.0',
            description: 'Documentación de la API para adopción de mascotas (Backend III - Coderhouse)'
        }
    },
    apis: [docsPattern]
};

export const swaggerSpec = swaggerJSDoc(swaggerOpts);
