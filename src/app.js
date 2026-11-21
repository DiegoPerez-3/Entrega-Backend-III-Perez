import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import swaggerUIExpress from 'swagger-ui-express';
import { environment } from './utils/index.js';
import { swaggerSpec } from './config/swagger.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

const app = express();
const PORT = environment.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/docs', swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerSpec));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    mongoose.connect(environment.MONGO_URI)
        .then(() => console.log('conectado a DB'))
        .catch((err) => console.error('Error al conectar a DB:', err.message));
});

export default app;
