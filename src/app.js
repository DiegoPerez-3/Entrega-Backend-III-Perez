import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { environment } from './utils/index.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

// Configuración principal de la aplicación Express.
const app = express();
const PORT = environment.PORT;

// Middlewares globales para parseo de JSON y cookies.
app.use(express.json());
app.use(cookieParser());

// Montaje de routers de la API.
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

// Inicio del servidor HTTP y conexión a la base de datos MongoDB.
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    mongoose.connect(environment.MONGO_URI)
        .then(() => console.log('conectado a DB'))
        .catch((err) => console.error('Error al conectar a DB:', err.message));
});

export default app;
