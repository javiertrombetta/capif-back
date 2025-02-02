import multer from 'multer';

const storage = multer.memoryStorage();

export const sendFiles = multer({ storage }).array('documentos', 10);