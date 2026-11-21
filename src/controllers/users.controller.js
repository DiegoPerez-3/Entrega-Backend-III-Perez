import mongoose from 'mongoose';
import { usersService } from '../services/index.js';

// Valida que el parámetro sea un ObjectId hexadecimal de 24 caracteres antes de consultar Mongoose.
const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(String(id));

const getAllUsers = async (req, res) => {
    try {
        const users = await usersService.getAll();
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: 'error', error: 'Invalid user ID' });
        }
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: 'error', error: 'User not found' });
        res.send({ status: 'success', payload: user });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const updateUser = async (req, res) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: 'error', error: 'Invalid user ID' });
        }
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: 'error', error: 'User not found' });
        await usersService.update(userId, updateBody);
        res.send({ status: 'success', message: 'User updated' });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: 'error', error: 'Invalid user ID' });
        }
        const user = await usersService.getUserById(userId);
        if (!user) return res.status(404).send({ status: 'error', error: 'User not found' });
        await usersService.delete(userId);
        res.send({ status: 'success', message: 'User deleted' });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error interno del servidor' });
    }
};

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
};
