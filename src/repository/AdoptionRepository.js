import GenericRepository from './GenericRepository.js';

// Repositorio de Adopciones que hereda las operaciones CRUD base de GenericRepository.
export default class AdoptionRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }
}
