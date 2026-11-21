# AdoptMe API — Backend III (Entrega Final)

API REST para la gestión de adopción de mascotas desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)** para el curso de Backend III en Coderhouse.

## 1. Contenido de la entrega

- **Documentación con Swagger (`src/config/swagger.js` y `src/docs/Users/Users.yaml`):**
  - Swagger UI disponible en `GET /api/docs`.
  - Documentación OpenAPI 3.0.1 para los cuatro endpoints del módulo **Users** (`GET /api/users`, `GET /api/users/{uid}`, `PUT /api/users/{uid}`, `DELETE /api/users/{uid}`).
- **Tests funcionales (`test/integration/routes/adoption.router.test.js`):**
  - 12 tests de integración con **Mocha**, **Chai** y **Supertest** para los endpoints de `adoption.router.js` (`GET /api/adoptions`, `GET /api/adoptions/:aid`, `POST /api/adoptions/:uid/:pid`).
  - Los tests corren contra una base separada (`adoptme_test`) para no alterar los datos de desarrollo (`AdoptMe`).
- **Dockerización (`Dockerfile`, `.dockerignore`, `docker-compose.yml`):**
  - Imagen basada en `node:24-alpine` publicada en Docker Hub ([`diegojpm2001/backend3-adoptme`](https://hub.docker.com/r/diegojpm2001/backend3-adoptme)).
  - Archivo `docker-compose.yml` para levantar la API junto con una instancia de `mongo:7`.
- **Módulo de Mocks (`src/routes/mocks.router.js` y `src/utils/faker/mocks.js`):**
  - Endpoints `/api/mocks/mockingpets`, `/api/mocks/mockingusers` y `/api/mocks/generateData` desarrollados en la primera preentrega.

---

## 2. Tecnologías y estructura del proyecto

- **Node.js** (ES Modules, `"type": "module"`)
- **Express** `^4.18.2`
- **MongoDB + Mongoose** `^6.7.5`
- **Swagger:** `swagger-jsdoc` `^6.3.0` y `swagger-ui-express` `^5.0.1`
- **Testing:** `mocha` `^12.0.3`, `chai` `^6.3.0` y `supertest` `^7.3.2`
- **Mocks y utilidades:** `@faker-js/faker` `^9.9.0`, `bcrypt` `^5.1.0`, `jsonwebtoken` `^8.5.1`, `cookie-parser` `^1.4.6`, `multer` `^1.4.5-lts.1`, `dotenv` `^17.2.3`

```text
Entrega-Backend-III-Perez/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── app.js
│   ├── config/
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── adoptions.controller.js
│   │   ├── mocks.controller.js
│   │   ├── pets.controller.js
│   │   ├── sessions.controller.js
│   │   └── users.controller.js
│   ├── dao/
│   │   ├── Adoption.js
│   │   ├── Pets.dao.js
│   │   ├── Users.dao.js
│   │   └── models/
│   │       ├── Adoption.js
│   │       ├── Pet.js
│   │       └── User.js
│   ├── docs/
│   │   └── Users/
│   │       └── Users.yaml
│   ├── dto/
│   │   ├── Pet.dto.js
│   │   └── User.dto.js
│   ├── repository/
│   │   ├── AdoptionRepository.js
│   │   ├── GenericRepository.js
│   │   ├── PetRepository.js
│   │   └── UserRepository.js
│   ├── routes/
│   │   ├── adoption.router.js
│   │   ├── mocks.router.js
│   │   ├── pets.router.js
│   │   ├── sessions.router.js
│   │   └── users.router.js
│   ├── services/
│   │   └── index.js
│   └── utils/
│       ├── index.js
│       ├── uploader.js
│       └── faker/
│           └── mocks.js
├── test/
│   ├── helpers/
│   │   ├── db.js
│   │   └── server.js
│   └── integration/
│       └── routes/
│           └── adoption.router.test.js
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── example.env
├── package.json
└── README.md
```

---

## 3. Instalación y ejecución local

### Requisitos previos
- **Node.js** v20 o v24 LTS.
- **MongoDB** corriendo localmente (por defecto en `mongodb://localhost:27017`).

### Pasos

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Crear el archivo `.env` a partir de `example.env`:
   ```bash
   cp example.env .env
   ```
   Variables utilizadas:
   ```env
   PORT=8080
   MONGO_URI=mongodb://localhost:27017/AdoptMe
   ```
   *(Opcionalmente se puede definir `MONGO_URI_TEST` o `PORT_TEST` para los tests; si no se definen, en modo test se usa `mongodb://127.0.0.1:27017/adoptme_test`).*

3. Iniciar el servidor:
   ```bash
   # Ejecución normal
   npm start

   # Modo desarrollo con recarga automática
   npm run dev
   ```

---

## 4. Documentación con Swagger y endpoints

Con el servidor levantado, la documentación interactiva se encuentra en:

- **Swagger UI:** `http://localhost:8080/api/docs`

### Módulo Users (documentado en Swagger)

| Método | Ruta | Descripción | Respuestas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Lista todos los usuarios registrados. | `200`, `500` |
| `GET` | `/api/users/{uid}` | Obtiene un usuario por su `ObjectId`. | `200`, `400`, `404`, `500` |
| `PUT` | `/api/users/{uid}` | Actualiza los datos de un usuario por su `ObjectId`. | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/users/{uid}` | Elimina un usuario por su `ObjectId`. | `200`, `400`, `404`, `500` |

### Otras rutas de la API

- **Adoptions (`/api/adoptions`):**
  - `GET /api/adoptions` — Lista todas las adopciones.
  - `GET /api/adoptions/:aid` — Obtiene una adopción por su `ObjectId`.
  - `POST /api/adoptions/:uid/:pid` — Registra la adopción de la mascota `:pid` por el usuario `:uid`, marcando `pet.adopted = true`, `pet.owner = uid` y agregando la mascota a `user.pets`.
- **Pets (`/api/pets`):**
  - `GET /api/pets`, `POST /api/pets`, `POST /api/pets/withimage`, `PUT /api/pets/:pid`, `DELETE /api/pets/:pid`
- **Sessions (`/api/sessions`):**
  - `POST /api/sessions/register`, `POST /api/sessions/login`, `GET /api/sessions/current`, `GET /api/sessions/unprotectedLogin`, `GET /api/sessions/unprotectedCurrent`
- **Mocks (`/api/mocks`):**
  - `GET /api/mocks/mockingpets` (opcional `?quantity=N`, por defecto `50`)
  - `GET /api/mocks/mockingusers` (opcional `?quantity=N`, por defecto `50`, contraseña `"coder123"` hasheada con bcrypt, rol `user`/`admin`, `pets: []`)
  - `POST /api/mocks/generateData` (body `{ "users": N, "pets": M }`, inserta los documentos en MongoDB)

---

## 5. Tests funcionales (`adoption.router.js`)

Para ejecutar la suite de tests funcionales:

```bash
npm test
```
o:
```bash
npm run test:integration
```

El helper `test/helpers/server.js` inicia la aplicación en un subproceso con `MODE=test` apuntando a `adoptme_test`, y `test/helpers/db.js` comprueba que el nombre de la base contenga `"test"` antes de limpiar las colecciones en cada prueba.

### Casos cubiertos

| ID | Endpoint | Caso probado | Respuesta esperada |
| :--- | :--- | :--- | :--- |
| `T01` | `GET /api/adoptions` | Base de datos sin adopciones | `200` — `{ status: "success", payload: [] }` |
| `T02` | `GET /api/adoptions` | Listado con adopciones cargadas | `200` — arreglo con las adopciones (`_id`, `owner`, `pet`) |
| `T03` | `GET /api/adoptions/:aid` | Búsqueda por `:aid` existente | `200` — adopción correspondiente |
| `T04` | `GET /api/adoptions/:aid` | `:aid` con formato `ObjectId` válido pero inexistente | `404` — `Adoption not found` |
| `T05` | `GET /api/adoptions/:aid` | `:aid` con formato inválido | `400` — `Invalid adoption ID` |
| `T06` | `POST /api/adoptions/:uid/:pid` | Adopción válida con usuario y mascota disponibles | `200` — `Pet adopted` |
| `T07` | `POST /api/adoptions/:uid/:pid` | Usuario inexistente (`ObjectId` válido) | `404` — `user Not found` (sin modificar la mascota) |
| `T08` | `POST /api/adoptions/:uid/:pid` | Mascota inexistente (`ObjectId` válido) | `404` — `Pet not found` (sin modificar al usuario) |
| `T09` | `POST /api/adoptions/:uid/:pid` | Mascota que ya figura como adoptada | `400` — `Pet is already adopted` |
| `T10` | `POST /api/adoptions/:uid/:pid` | Verificación en BD luego de adoptar | `pet.adopted === true`, `pet.owner === uid`, `user.pets` incluye `pid` y documento creado en `Adoptions` |
| `T11` | `POST /api/adoptions/:uid/:pid` | `:uid` o `:pid` con formato de `ObjectId` inválido | `400` — `Invalid user or pet ID` |
| `T12` | `POST /api/adoptions/:uid/:pid` | Rechazo de un segundo intento secuencial de adopción sobre la misma mascota | `400` — `Pet is already adopted` y se mantiene una única adopción |

---

## 6. Docker y Docker Hub

### Imagen publicada en Docker Hub

- **Repositorio público:** [https://hub.docker.com/r/diegojpm2001/backend3-adoptme](https://hub.docker.com/r/diegojpm2001/backend3-adoptme)
- **Tags disponibles:**
  - `diegojpm2001/backend3-adoptme:1.0.0`
  - `diegojpm2001/backend3-adoptme:latest`

Descargar la imagen desde Docker Hub:

```bash
docker pull diegojpm2001/backend3-adoptme:1.0.0
# o
docker pull diegojpm2001/backend3-adoptme:latest
```

### Construir y correr el contenedor manualmente

1. **Construir la imagen desde el `Dockerfile` local:**
   ```bash
   docker build -t diegojpm2001/backend3-adoptme:1.0.0 .
   ```

2. **Ejecutar el contenedor conectándolo a un MongoDB local:**
   ```bash
   docker run --rm --name backend3-adoptme \
     -p 8080:8080 \
     -e PORT=8080 \
     -e MONGO_URI=mongodb://host.docker.internal:27017/AdoptMe \
     diegojpm2001/backend3-adoptme:1.0.0
   ```
   > **Nota:** `host.docker.internal` permite conectar con el MongoDB del host en Docker Desktop (Windows/macOS). En Linux, o si no se tiene MongoDB instalado en el host, se recomienda levantar ambos servicios con Docker Compose como se muestra a continuación.

### Ejecutar con Docker Compose (`app` + `mongo:7`)

```bash
# Construir y levantar la API junto con MongoDB en segundo plano
docker compose up --build -d

# Ver logs de la aplicación
docker compose logs -f app

# Detener los contenedores
docker compose down
```

---

## 7. Pruebas rápidas y CI

Con el servidor o el contenedor corriendo en `http://localhost:8080`:

```bash
# Swagger UI
curl -I http://localhost:8080/api/docs/

# Generar e insertar usuarios y mascotas de prueba
curl -X POST "http://localhost:8080/api/mocks/generateData" \
  -H "Content-Type: application/json" \
  -d "{\"users\":3,\"pets\":3}"

# Consultar usuarios, mascotas y adopciones
curl http://localhost:8080/api/users
curl http://localhost:8080/api/pets
curl http://localhost:8080/api/adoptions
```

### GitHub Actions (CI)

El archivo `.github/workflows/ci-cd.yml` ejecuta automáticamente `npm test` en cada `push` o `pull_request` a la rama `main` utilizando Node.js 24 y un contenedor de servicio `mongo:7` conectado a `mongodb://localhost:27017/adoptme_test`.
