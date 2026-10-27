import __dirname from './index.js';
import multer from 'multer';

// Configuración de almacenamiento local con Multer para las imágenes de mascotas.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/../public/img`);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploader = multer({ storage });

export default uploader;
