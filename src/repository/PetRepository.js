import GenericRepository from './GenericRepository.js';

// Repositorio de Mascotas que hereda las operaciones CRUD base de GenericRepository.
export default class PetRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }
}
