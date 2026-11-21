import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { environment } from '../../src/utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let serverProcess;
export const baseUrl = `http://localhost:${environment.PORT}`;

// Levanta el servidor en un subproceso con MODE=test porque src/app.js ejecuta app.listen al importarse.
export const startServer = async () => {
    if (serverProcess) return;

    await new Promise((resolve, reject) => {
        serverProcess = spawn('node', ['src/app.js', '--env', 'test'], {
            cwd: rootDir,
            env: {
                ...process.env,
                MODE: 'test',
                MONGO_URI: environment.MONGO_URI,
                PORT: String(environment.PORT)
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        const timeout = setTimeout(() => {
            reject(new Error('Tiempo de espera agotado al iniciar el servidor de pruebas'));
        }, 10000);

        const onData = (data) => {
            const text = data.toString();
            if (text.includes('conectado a DB')) {
                clearTimeout(timeout);
                serverProcess.stdout.off('data', onData);
                resolve();
            }
        };

        serverProcess.stdout.on('data', onData);

        serverProcess.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });

        serverProcess.on('exit', (code) => {
            clearTimeout(timeout);
            if (code !== null && code !== 0) {
                reject(new Error(`El servidor finalizó prematuramente con código ${code}`));
            }
        });
    });
};

export const stopServer = async () => {
    if (!serverProcess) return;

    await new Promise((resolve) => {
        serverProcess.once('exit', () => resolve());
        serverProcess.kill();
        setTimeout(resolve, 2000);
    });

    serverProcess = null;
};

export const mochaHooks = {
    beforeAll: async function () {
        this.timeout(15000);
        await startServer();
    },
    afterAll: async function () {
        this.timeout(10000);
        await stopServer();
    }
};
