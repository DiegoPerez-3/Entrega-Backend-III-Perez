import mongoose from 'mongoose';
import supertest from 'supertest';
import { expect } from 'chai';
import { baseUrl } from '../../helpers/server.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/db.js';
import { usersService, petsService, adoptionsService } from '../../../src/services/index.js';
import { generateUser, generatePet } from '../../../src/utils/faker/mocks.js';

const requester = supertest(baseUrl);

// Suite de tests funcionales de integración para los endpoints de /api/adoptions.
describe('Tests funcionales - Router de Adopciones (/api/adoptions)', function () {
    this.timeout(15000);

    before(async () => {
        await connectTestDb();
    });

    beforeEach(async () => {
        await clearTestDb();
    });

    after(async () => {
        await clearTestDb();
        await disconnectTestDb();
    });

    // Helper para persistir un usuario de prueba válido en la colección Users.
    const createTestUser = async (overrides = {}) => {
        const mockUser = await generateUser();
        return usersService.create({ ...mockUser, ...overrides });
    };

    // Helper para persistir una mascota de prueba válida en la colección Pets.
    const createTestPet = async (overrides = {}) => {
        const mockPet = generatePet();
        return petsService.create({ ...mockPet, ...overrides });
    };

    describe('GET /api/adoptions', () => {
        it('T01 - debe devolver estado 200 y un arreglo vacío cuando no existen adopciones registradas', async () => {
            const response = await requester.get('/api/adoptions');

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('object');
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array').that.is.empty;
        });

        it('T02 - debe devolver estado 200 y la lista de adopciones registradas cuando existen datos', async () => {
            const user = await createTestUser();
            const pet1 = await createTestPet({ adopted: true, owner: user._id });
            const pet2 = await createTestPet({ adopted: true, owner: user._id });

            await adoptionsService.create({ owner: user._id, pet: pet1._id });
            await adoptionsService.create({ owner: user._id, pet: pet2._id });

            const response = await requester.get('/api/adoptions');

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array').with.lengthOf(2);
            expect(response.body.payload[0]).to.include.all.keys('_id', 'owner', 'pet');
            expect(String(response.body.payload[0].owner)).to.equal(String(user._id));
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        it('T03 - debe devolver estado 200 y la adopción correspondiente cuando el ID existe', async () => {
            const user = await createTestUser();
            const pet = await createTestPet({ adopted: true, owner: user._id });
            const adoption = await adoptionsService.create({ owner: user._id, pet: pet._id });

            const response = await requester.get(`/api/adoptions/${adoption._id}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('object');
            expect(String(response.body.payload._id)).to.equal(String(adoption._id));
            expect(String(response.body.payload.owner)).to.equal(String(user._id));
            expect(String(response.body.payload.pet)).to.equal(String(pet._id));
        });

        it('T04 - debe devolver estado 404 cuando el ObjectId de adopción es válido pero no existe', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const response = await requester.get(`/api/adoptions/${nonExistentId}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({
                status: 'error',
                error: 'Adoption not found'
            });
        });

        it('T05 - debe devolver estado 400 cuando el formato del parámetro :aid no es un ObjectId válido', async () => {
            const response = await requester.get('/api/adoptions/id-invalido-123');

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({
                status: 'error',
                error: 'Invalid adoption ID'
            });
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('T06 - debe devolver estado 200 y mensaje "Pet adopted" cuando usuario y mascota existen y la mascota no está adoptada', async () => {
            const user = await createTestUser();
            const pet = await createTestPet();

            const response = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({
                status: 'success',
                message: 'Pet adopted'
            });
        });

        it('T10 - debe actualizar correctamente la persistencia en MongoDB (mascota adoptada, owner asignado, user.pets actualizado y registro en Adoptions)', async () => {
            const user = await createTestUser();
            const pet = await createTestPet();

            const response = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);
            expect(response.status).to.equal(200);

            const updatedPet = await petsService.getBy({ _id: pet._id });
            expect(updatedPet.adopted).to.equal(true);
            expect(String(updatedPet.owner)).to.equal(String(user._id));

            const updatedUser = await usersService.getUserById(user._id);
            const userPetIds = updatedUser.pets.map((item) => String(item._id));
            expect(userPetIds).to.include(String(pet._id));

            const storedAdoption = await adoptionsService.getBy({ owner: user._id, pet: pet._id });
            expect(storedAdoption).to.not.be.null;
            expect(String(storedAdoption.owner)).to.equal(String(user._id));
            expect(String(storedAdoption.pet)).to.equal(String(pet._id));
        });

        it('T07 - debe devolver estado 404 cuando el usuario no existe y no debe modificar la mascota ni crear adopción', async () => {
            const nonExistentUserId = new mongoose.Types.ObjectId();
            const pet = await createTestPet();

            const response = await requester.post(`/api/adoptions/${nonExistentUserId}/${pet._id}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({
                status: 'error',
                error: 'user Not found'
            });

            const unchangedPet = await petsService.getBy({ _id: pet._id });
            expect(unchangedPet.adopted).to.equal(false);

            const adoptions = await adoptionsService.getAll();
            expect(adoptions).to.be.an('array').that.is.empty;
        });

        it('T08 - debe devolver estado 404 cuando la mascota no existe y no debe modificar al usuario ni crear adopción', async () => {
            const user = await createTestUser();
            const nonExistentPetId = new mongoose.Types.ObjectId();

            const response = await requester.post(`/api/adoptions/${user._id}/${nonExistentPetId}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({
                status: 'error',
                error: 'Pet not found'
            });

            const unchangedUser = await usersService.getUserById(user._id);
            expect(unchangedUser.pets).to.be.an('array').that.is.empty;

            const adoptions = await adoptionsService.getAll();
            expect(adoptions).to.be.an('array').that.is.empty;
        });

        it('T09 - debe devolver estado 400 cuando la mascota ya figura como adoptada', async () => {
            const user = await createTestUser();
            const alreadyAdoptedPet = await createTestPet({ adopted: true, owner: user._id });

            const response = await requester.post(`/api/adoptions/${user._id}/${alreadyAdoptedPet._id}`);

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({
                status: 'error',
                error: 'Pet is already adopted'
            });
        });

        it('T11 - debe devolver estado 400 cuando :uid o :pid tienen un formato de ObjectId inválido', async () => {
            const user = await createTestUser();
            const pet = await createTestPet();

            const invalidUidResponse = await requester.post(`/api/adoptions/uid-invalido-123/${pet._id}`);
            expect(invalidUidResponse.status).to.equal(400);
            expect(invalidUidResponse.body).to.deep.equal({
                status: 'error',
                error: 'Invalid user or pet ID'
            });

            const invalidPidResponse = await requester.post(`/api/adoptions/${user._id}/pid-invalido-123`);
            expect(invalidPidResponse.status).to.equal(400);
            expect(invalidPidResponse.body).to.deep.equal({
                status: 'error',
                error: 'Invalid user or pet ID'
            });
        });

        it('T12 - debe rechazar con estado 400 un segundo intento de adoptar la misma mascota y mantener una única adopción', async () => {
            const firstUser = await createTestUser();
            const secondUser = await createTestUser();
            const pet = await createTestPet();

            const firstAttempt = await requester.post(`/api/adoptions/${firstUser._id}/${pet._id}`);
            expect(firstAttempt.status).to.equal(200);

            const secondAttempt = await requester.post(`/api/adoptions/${secondUser._id}/${pet._id}`);
            expect(secondAttempt.status).to.equal(400);
            expect(secondAttempt.body).to.deep.equal({
                status: 'error',
                error: 'Pet is already adopted'
            });

            const adoptions = await adoptionsService.getAll();
            expect(adoptions).to.be.an('array').with.lengthOf(1);
            expect(String(adoptions[0].owner)).to.equal(String(firstUser._id));
        });
    });
});
