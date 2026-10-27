import GenericRepository from './GenericRepository.js';

// Repositorio de Usuarios con métodos específicos de búsqueda por correo e identificador.
export default class UserRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }

    getUserByEmail = (email) => {
        return this.getBy({ email });
    };

    getUserById = (id) => {
        return this.getBy({ _id: id });
    };
}
