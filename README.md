# AdoptMe API — Backend III (Primera Preentrega)

API REST para la gestión de adopción de mascotas desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)**, que incorpora generación de datos simulados (*mocks*) mediante **Faker.js** y **bcrypt**, así como inserción parametrizada en base de datos.

---

## 1. Alcance de la Entrega N.º 1

1. **Router de Mocks (`src/routes/mocks.router.js`)** montado bajo la ruta base `/api/mocks`.
2. **Endpoint `GET /api/mocks/mockingpets`** migrado al router de mocks, que genera mascotas simuladas compatibles con el esquema Mongoose (`Pet`) sin persistirlas en la base de datos.
3. **Módulo de Mocking (`src/utils/faker/mocks.js`)** parametrizable que genera usuarios simulados con:
   - `_id`: `ObjectId` válido de Mongoose.
   - `first_name`, `last_name` y `email` único generados con `@faker-js/faker`.
   - `password`: contraseña `"coder123"` encriptada con `bcrypt` (`createHash("coder123")`).
   - `role`: seleccionado aleatoriamente entre `"user"` y `"admin"`.
   - `pets`: array vacío `[]`.
4. **Endpoint `GET /api/mocks/mockingusers`** que devuelve **50 usuarios simulados por defecto** (o la cantidad indicada por `?quantity=N`) con el mismo formato que entrega una consulta de MongoDB, sin insertarlos en la base de datos.
5. **Endpoint `POST /api/mocks/generateData`** que recibe los parámetros numéricos `{ "users": N, "pets": M }`, genera las cantidades solicitadas y las **inserta efectivamente en MongoDB** utilizando `usersService` y `petsService`.
6. **Comprobación de persistencia** mediante los endpoints existentes `GET /api/users` y `GET /api/pets`.

---

## 2. Tecnologías y Arquitectura

- **Entorno de ejecución:** Node.js (ES Modules)
- **Framework web:** Express `^4.18.2`
- **Base de datos y ODM:** MongoDB + Mongoose `^6.7.5`
- **Generación de datos sintéticos:** `@faker-js/faker` `^9.9.0`
- **Encriptación de contraseñas:** `bcrypt` `^5.1.0`
- **Variables de entorno:** `dotenv` `^17.2.3`
- **Patrón arquitectónico:** Capas de Rutas (`routes`) → Controladores (`controllers`) → Servicios / Repositorios (`services`, `repository`) → DAO y Modelos Mongoose (`dao`, `dao/models`).

```text
Entrega-1/
├── example.env
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   ├── adoptions.controller.js
    │   ├── mocks.controller.js
    │   ├── pets.controller.js
    │   ├── sessions.controller.js
    │   └── users.controller.js
    ├── dao/
    │   ├── Adoption.js
    │   ├── Pets.dao.js
    │   ├── Users.dao.js
    │   └── models/
    │       ├── Adoption.js
    │       ├── Pet.js
    │       └── User.js
    ├── dto/
    │   ├── Pet.dto.js
    │   └── User.dto.js
    ├── repository/
    │   ├── AdoptionRepository.js
    │   ├── GenericRepository.js
    │   ├── PetRepository.js
    │   └── UserRepository.js
    ├── routes/
    │   ├── adoption.router.js
    │   ├── mocks.router.js
    │   ├── pets.router.js
    │   ├── sessions.router.js
    │   └── users.router.js
    ├── services/
    │   └── index.js
    └── utils/
        ├── index.js
        ├── uploader.js
        └── faker/
            └── mocks.js
```

---

## 3. Instalación y Configuración

### Requisitos previos
- **Node.js** v18 o superior.
- **MongoDB** en ejecución local (por ejemplo, en `mongodb://localhost:27017`) o una instancia de desarrollo accesible.

### Pasos de configuración

1. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Crear el archivo `.env` en la raíz del proyecto tomando como plantilla `example.env`:
   ```bash
   cp example.env .env
   ```
   Contenido de ejemplo (`.env`):
   ```env
   PORT=8080
   MONGO_URI=mongodb://localhost:27017/AdoptMe
   ```

3. Iniciar el servidor:
   - Modo normal:
     ```bash
     npm start
     ```
   - Modo desarrollo (con recarga automática `--watch`):
     ```bash
     npm run dev
     ```

El servidor quedará escuchando en `http://localhost:8080` (o en el puerto definido en `PORT`).

---

## 4. Especificación de Endpoints

### 4.1. `GET /api/mocks/mockingpets`
Genera mascotas ficticias en memoria (**no persiste en MongoDB**).
- **Query param opcional:** `quantity` (entero no negativo; por defecto `50`).
- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "status": "success",
    "payload": [
      {
        "_id": "671d8f4a9c1e4b2a10f8e101",
        "name": "Buddy",
        "specie": "dog",
        "birthDate": "2021-05-14T00:00:00.000Z",
        "adopted": false,
        "image": "https://avatars.githubusercontent.com/u/123456"
      }
    ]
  }
  ```

### 4.2. `GET /api/mocks/mockingusers`
Genera usuarios ficticios con estructura estilo MongoDB (**no persiste en MongoDB**).
- **Query param opcional:** `quantity` (entero no negativo; **por defecto `50`**).
- **Características de cada usuario generado:**
  - `password`: hash bcrypt válido de `"coder123"`.
  - `role`: seleccionado aleatoriamente entre `"user"` y `"admin"`.
  - `pets`: `[]`.
- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "status": "success",
    "payload": [
      {
        "_id": "671d8f4a9c1e4b2a10f8e102",
        "first_name": "Lucia",
        "last_name": "Gomez",
        "email": "lucia.gomez.671d8f4a9c1e4b2a10f8e102@example.com",
        "password": "$2b$10$w8H...<hash_bcrypt_de_coder123>",
        "role": "user",
        "pets": []
      }
    ]
  }
  ```

### 4.3. `POST /api/mocks/generateData`
Genera e **inserta efectivamente en MongoDB** la cantidad indicada de usuarios y mascotas.
- **Headers:** `Content-Type: application/json`
- **Body requerido:**
  ```json
  {
    "users": 10,
    "pets": 15
  }
  ```
- **Validaciones:**
  - `users` y `pets` deben enviarse explícitamente y ser números enteros no negativos (`0 <= n <= 5000`).
  - Ante valores negativos, decimales, strings o campos faltantes responde con `400 Bad Request` sin insertar registros.
- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "Se generaron e insertaron 10 usuarios y 15 mascotas en MongoDB",
    "payload": {
      "usersInserted": 10,
      "petsInserted": 15,
      "users": [ ... ],
      "pets": [ ... ]
    }
  }
  ```

### 4.4. Endpoints de verificación de persistencia
- `GET /api/users` — Devuelve todos los usuarios almacenados en la colección `Users` de MongoDB.
- `GET /api/pets` — Devuelve todas las mascotas almacenadas en la colección `Pets` de MongoDB.

---

## 5. Guía de Pruebas Manuales

### Con `curl.exe` (Bash / CMD / PowerShell)

```bash
# 1. Obtener 50 usuarios simulados por defecto (sin persistir en DB)
curl.exe http://localhost:8080/api/mocks/mockingusers

# 2. Obtener una cantidad personalizada de usuarios simulados (ej. 8)
curl.exe "http://localhost:8080/api/mocks/mockingusers?quantity=8"

# 3. Obtener mascotas simuladas (ej. 7)
curl.exe "http://localhost:8080/api/mocks/mockingpets?quantity=7"

# 4. Consultar usuarios y mascotas en MongoDB ANTES del POST
curl.exe http://localhost:8080/api/users
curl.exe http://localhost:8080/api/pets

# 5. Generar e insertar 10 usuarios y 15 mascotas en MongoDB
curl.exe -X POST "http://localhost:8080/api/mocks/generateData" -H "Content-Type: application/json" -d "{\"users\":10,\"pets\":15}"

# 6. Consultar usuarios y mascotas en MongoDB DESPUÉS del POST
curl.exe http://localhost:8080/api/users
curl.exe http://localhost:8080/api/pets
```

### Con PowerShell (`Invoke-RestMethod`)

```powershell
# 1. Verificar que GET /mockingusers devuelve 50 usuarios por defecto
$mockUsers = Invoke-RestMethod -Uri "http://localhost:8080/api/mocks/mockingusers" -Method Get
$mockUsers.payload.Count  # Resultado esperado: 50

# 2. Contar registros en MongoDB antes de insertar
$usersBefore = (Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method Get).payload.Count
$petsBefore  = (Invoke-RestMethod -Uri "http://localhost:8080/api/pets" -Method Get).payload.Count

# 3. Ejecutar POST /api/mocks/generateData con 10 usuarios y 15 mascotas
$body = @{ users = 10; pets = 15 } | ConvertTo-Json
$postResult = Invoke-RestMethod -Uri "http://localhost:8080/api/mocks/generateData" -Method Post -ContentType "application/json" -Body $body
$postResult.payload.usersInserted  # 10
$postResult.payload.petsInserted   # 15

# 4. Verificar incremento real en MongoDB (+10 usuarios y +15 mascotas)
$usersAfter = (Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method Get).payload.Count
$petsAfter  = (Invoke-RestMethod -Uri "http://localhost:8080/api/pets" -Method Get).payload.Count
Write-Output "Usuarios: $usersBefore -> $usersAfter (+$($usersAfter - $usersBefore))"
Write-Output "Mascotas: $petsBefore -> $petsAfter (+$($petsAfter - $petsBefore))"
```

---

## 6. Notas de Seguridad
- Las rutas de `/api/mocks` están diseñadas exclusivamente para entornos de desarrollo y pruebas.
- El archivo `.env` está excluido del control de versiones mediante `.gitignore`. Nunca suba credenciales reales ni URIs productivas al repositorio.
