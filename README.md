# AdoptMe API — Backend III (Entrega Final)

API REST para la gestión de adopción de mascotas desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)**. Esta entrega integra la documentación interactiva con **Swagger (OpenAPI 3.0)** del módulo de Usuarios, **tests funcionales de integración** con **Mocha, Chai y Supertest** para el router de Adopciones, **Dockerización** completa del proyecto y el módulo de **Mocking** con **Faker.js** y **bcrypt** desarrollado en la Primera Preentrega.

---

## 1. Alcance de la Entrega Final

1. **Documentación con Swagger (`src/config/swagger.js` y `src/docs/Users/Users.yaml`):**
   - Interfaz interactiva **Swagger UI** montada en `GET /api/docs`.
   - Especificación **OpenAPI 3.0.1** completa para los 4 endpoints del router de Usuarios (`GET /api/users`, `GET /api/users/{uid}`, `PUT /api/users/{uid}`, `DELETE /api/users/{uid}`), incluyendo esquemas (`User`, `UserPetRef`, `UsersListResponse`, `UserResponse`, `UserMessageResponse`, `UserDeletedResponse`, `ErrorResponse`), `requestBodies` (`UpdateUser`) y respuestas `200`, `400`, `404` y `500`.
2. **Tests funcionales de integración (`test/integration/routes/adoption.router.test.js`):**
   - Cobertura exhaustiva de todos los endpoints de `adoption.router.js` (`GET /api/adoptions`, `GET /api/adoptions/:aid`, `POST /api/adoptions/:uid/:pid`) con **12 casos de prueba** (éxito, errores `400`/`404`, persistencia cruzada en MongoDB e idempotencia/concurrencia).
   - Ejecución aislada en subproceso contra la base de datos de pruebas `adoptme_test`, con guardia de seguridad que impide limpiar o alterar la base de desarrollo `AdoptMe`.
3. **Dockerización (`Dockerfile`, `.dockerignore`, `docker-compose.yml`):**
   - Imagen ligera basada en `node:24-alpine` con instalación limpia de dependencias de producción (`npm ci --omit=dev`).
   - Orquestación opcional con `docker-compose.yml` (`app` + `mongo:7`).
4. **Módulo de Mocks — Preentrega 1 (`src/routes/mocks.router.js` y `src/utils/faker/mocks.js`):**
   - `GET /api/mocks/mockingpets`, `GET /api/mocks/mockingusers` y `POST /api/mocks/generateData`.

---

## 2. Stack Tecnológico y Estructura del Proyecto

- **Entorno de ejecución:** Node.js (ES Modules, `"type": "module"`)
- **Framework web:** Express `^4.18.2`
- **Base de datos y ODM:** MongoDB + Mongoose `^6.7.5`
- **Documentación API:** `swagger-jsdoc` `^6.3.0` + `swagger-ui-express` `^5.0.1`
- **Testing funcional:** `mocha` `^12.0.3` + `chai` `^6.3.0` + `supertest` `^7.3.2`
- **Generación de datos sintéticos:** `@faker-js/faker` `^9.9.0`
- **Seguridad y utilidades:** `bcrypt` `^5.1.0`, `jsonwebtoken` `^8.5.1`, `cookie-parser` `^1.4.6`, `multer` `^1.4.5-lts.1`, `dotenv` `^17.2.3`
- **Contenedores y CI:** Docker (`node:24-alpine`, `mongo:7`) y GitHub Actions (`.github/workflows/ci-cd.yml`)

```text
Entrega-1/
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

## 3. Instalación y Ejecución Local

### Requisitos previos
- **Node.js** v20 o v24 LTS.
- **MongoDB** en ejecución local (por ejemplo, en `mongodb://localhost:27017`).
- **Docker Desktop** (para construir y ejecutar la imagen contenedorizada).

### Configuración paso a paso

1. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Crear el archivo `.env` a partir de `example.env`:
   ```bash
   cp example.env .env
   ```
   Variables de entorno disponibles:
   ```env
   PORT=8080
   MONGO_URI=mongodb://localhost:27017/AdoptMe
   ```
   *(Opcionalmente pueden definirse `MONGO_URI_TEST` y `PORT_TEST` para personalizar el entorno de pruebas; por defecto los tests utilizan `mongodb://127.0.0.1:27017/adoptme_test`).*

3. Iniciar el servidor:
   - **Modo producción / normal:**
     ```bash
     npm start
     ```
   - **Modo desarrollo (con recarga `--watch`):**
     ```bash
     npm run dev
     ```

El servidor escuchará en `http://localhost:8080`.

---

## 4. Documentación con Swagger (`/api/docs`)

Con el servidor en ejecución, acceder desde el navegador a:

- **URL Swagger UI:** [http://localhost:8080/api/docs](http://localhost:8080/api/docs)

### Endpoints documentados en Swagger (`Users`)

| Método | Ruta | Descripción | Códigos de respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Obtiene todos los usuarios registrados en la colección `Users`. | `200`, `500` |
| `GET` | `/api/users/{uid}` | Obtiene un usuario específico por su `ObjectId`. | `200`, `400`, `404`, `500` |
| `PUT` | `/api/users/{uid}` | Actualiza los datos de un usuario existente por su `ObjectId`. | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/users/{uid}` | Elimina un usuario existente por su `ObjectId`. | `200`, `400`, `404`, `500` |

### Resumen general de endpoints de la API

- **Users (`/api/users`):**
  - `GET /api/users`
  - `GET /api/users/:uid`
  - `PUT /api/users/:uid`
  - `DELETE /api/users/:uid`
- **Adoptions (`/api/adoptions`):**
  - `GET /api/adoptions` — Lista todas las adopciones registradas.
  - `GET /api/adoptions/:aid` — Obtiene una adopción por su `ObjectId`.
  - `POST /api/adoptions/:uid/:pid` — Registra la adopción de la mascota `:pid` por el usuario `:uid`, actualizando `pet.adopted = true`, `pet.owner = uid`, agregando la mascota a `user.pets` y creando el documento en `Adoptions`.
- **Pets (`/api/pets`):**
  - `GET /api/pets`, `POST /api/pets`, `POST /api/pets/withimage`, `PUT /api/pets/:pid`, `DELETE /api/pets/:pid`
- **Sessions (`/api/sessions`):**
  - `POST /api/sessions/register`, `POST /api/sessions/login`, `GET /api/sessions/current`, `GET /api/sessions/unprotectedLogin`, `GET /api/sessions/unprotectedCurrent`
- **Mocks (`/api/mocks`):**
  - `GET /api/mocks/mockingpets` (opcional `?quantity=N`, por defecto `50`)
  - `GET /api/mocks/mockingusers` (opcional `?quantity=N`, por defecto `50`, password `"coder123"` hasheada con bcrypt, rol `user`/`admin`, `pets: []`)
  - `POST /api/mocks/generateData` (body `{ "users": N, "pets": M }`, inserta los registros en MongoDB)

---

## 5. Ejecución de Tests Funcionales (`adoption.router.js`)

Los tests funcionales utilizan **Mocha**, **Chai** y **Supertest**. El hook global (`test/helpers/server.js`) levanta automáticamente la aplicación en un subproceso con `MODE=test` conectada a la base de datos **`adoptme_test`**, y `test/helpers/db.js` verifica que el nombre de la base contenga `"test"` antes de limpiar colecciones.

### Comandos de ejecución

```bash
npm test
```
o bien:
```bash
npm run test:integration
```

### Matriz de los 12 casos de prueba implementados

| ID | Endpoint | Escenario verificado | Resultado esperado |
| :--- | :--- | :--- | :--- |
| `T01` | `GET /api/adoptions` | Base de datos sin adopciones registradas | `200 OK` — `{ status: "success", payload: [] }` |
| `T02` | `GET /api/adoptions` | Existen adopciones previamente creadas | `200 OK` — `payload` con las adopciones (`_id`, `owner`, `pet`) |
| `T03` | `GET /api/adoptions/:aid` | `:aid` corresponde a una adopción existente | `200 OK` — `payload` con la adopción solicitada |
| `T04` | `GET /api/adoptions/:aid` | `:aid` es un `ObjectId` válido pero inexistente | `404 Not Found` — `{ status: "error", error: "Adoption not found" }` |
| `T05` | `GET /api/adoptions/:aid` | `:aid` tiene un formato de `ObjectId` inválido | `400 Bad Request` — `{ status: "error", error: "Invalid adoption ID" }` |
| `T06` | `POST /api/adoptions/:uid/:pid` | Usuario y mascota existen y la mascota no está adoptada | `200 OK` — `{ status: "success", message: "Pet adopted" }` |
| `T07` | `POST /api/adoptions/:uid/:pid` | `:uid` es un `ObjectId` válido pero el usuario no existe | `404 Not Found` — `{ status: "error", error: "user Not found" }` |
| `T08` | `POST /api/adoptions/:uid/:pid` | `:pid` es un `ObjectId` válido pero la mascota no existe | `404 Not Found` — `{ status: "error", error: "Pet not found" }` |
| `T09` | `POST /api/adoptions/:uid/:pid` | La mascota ya tenía `adopted: true` | `400 Bad Request` — `{ status: "error", error: "Pet is already adopted" }` |
| `T10` | `POST /api/adoptions/:uid/:pid` | Verificación de efectos secundarios en MongoDB tras adoptar | `pet.adopted === true`, `pet.owner === uid`, `user.pets` contiene `pid` y existe el documento en `Adoptions` |
| `T11` | `POST /api/adoptions/:uid/:pid` | `:uid` o `:pid` tienen formato de `ObjectId` inválido | `400 Bad Request` — `{ status: "error", error: "Invalid user or pet ID" }` |
| `T12` | `POST /api/adoptions/:uid/:pid` | Segundo intento de adoptar la misma mascota por otro usuario | `400 Bad Request` — `{ status: "error", error: "Pet is already adopted" }` y se conserva 1 sola adopción |

---

## 6. Dockerización e Imagen en Docker Hub

### 6.1. Imagen Pública en Docker Hub

- **Enlace público a Docker Hub:** [https://hub.docker.com/r/diegojpm2001/backend3-adoptme](https://hub.docker.com/r/diegojpm2001/backend3-adoptme)
- **Repositorio de imagen:** `diegojpm2001/backend3-adoptme`
- **Tags publicados:** `1.0.0` y `latest`

Comandos para descargar y ejecutar directamente la imagen publicada desde Docker Hub:

```bash
# 1. Descargar la imagen desde Docker Hub
docker pull diegojpm2001/backend3-adoptme:1.0.0
# o bien:
docker pull diegojpm2001/backend3-adoptme:latest

# 2. Ejecutar el contenedor conectándolo a MongoDB del host (host.docker.internal)
docker run --rm --name backend3-adoptme -p 8080:8080 -e PORT=8080 -e MONGO_URI=mongodb://host.docker.internal:27017/AdoptMe diegojpm2001/backend3-adoptme:1.0.0
```

Comandos utilizados para autenticar, construir, etiquetar y publicar la imagen en Docker Hub:

```bash
# 1. Iniciar sesión en Docker Hub
docker login

# 2. Construir y etiquetar la imagen con versión y latest
docker build -t diegojpm2001/backend3-adoptme:1.0.0 -t diegojpm2001/backend3-adoptme:latest .

# 3. Subir la imagen a Docker Hub
docker push diegojpm2001/backend3-adoptme:1.0.0
docker push diegojpm2001/backend3-adoptme:latest
```

### 6.2. Construcción y ejecución local con `docker build` y `docker run`

1. **Construir la imagen localmente:**
   ```bash
   docker build -t diegojpm2001/backend3-adoptme:1.0.0 .
   ```

2. **Ejecutar el contenedor conectándolo a MongoDB del host (`host.docker.internal`):**
   ```bash
   docker run --rm --name backend3-adoptme -p 8080:8080 -e PORT=8080 -e MONGO_URI=mongodb://host.docker.internal:27017/AdoptMe diegojpm2001/backend3-adoptme:1.0.0
   ```

### 6.3. Ejecución multicontenedor con Docker Compose (`app` + `mongo:7`)

```bash
# Construir y levantar la API junto con MongoDB en segundo plano
docker compose up --build -d

# Consultar los logs del servicio app
docker compose logs -f app

# Detener y eliminar los contenedores
docker compose down
```

---

## 7. Guía Rápida de Verificación Manual

### Con `curl.exe`

```bash
# 1. Verificar Swagger UI (responde 200 OK con el HTML de Swagger)
curl.exe -I http://localhost:8080/api/docs/

# 2. Poblar datos de prueba mediante el módulo de Mocks
curl.exe -X POST "http://localhost:8080/api/mocks/generateData" -H "Content-Type: application/json" -d "{\"users\":3,\"pets\":3}"

# 3. Listar usuarios y mascotas insertados
curl.exe http://localhost:8080/api/users
curl.exe http://localhost:8080/api/pets

# 4. Listar adopciones registradas
curl.exe http://localhost:8080/api/adoptions
```

### Integración Continua (GitHub Actions)

El repositorio incluye el flujo `.github/workflows/ci-cd.yml` que, ante cada `push` o `pull_request` hacia `main`, levanta un contenedor de servicio `mongo:7`, instala dependencias con `npm ci` bajo Node.js 24 y ejecuta la suite de tests funcionales (`npm test`) contra `mongodb://localhost:27017/adoptme_test`.
