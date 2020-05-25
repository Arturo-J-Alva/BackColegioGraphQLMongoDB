const s3 = require('./s3');
const { S3Uploader,uuidFilenameTransform,FilesystemUploader } = require('./lib/gql-uploaders');
const config = require('./config/configUploaders');

const avatarUploader = new S3Uploader(s3, {
  baseKey: 'PintoStore/fotos',
  uploadParams: {
    CacheControl: 'max-age:31536000',
    ContentDisposition: 'inline',
  },
  filenameTransform: filename => uuidFilenameTransform(filename),
});

const imagenesGeneralesUploader = new S3Uploader(s3, {
  baseKey: 'Colegio/Imagenes_generales',
  uploadParams: {
    CacheControl: 'max-age:31536000',
    ContentDisposition: 'inline',
  },
  filenameTransform: filename => uuidFilenameTransform(filename),
});

const RecursosUploader = new S3Uploader(s3, {
  baseKey: 'Colegio/Cursos/Recursos',
  uploadParams: {
    CacheControl: 'max-age:31536000',
    ContentDisposition: 'inline',
  },
  filenameTransform: filename => uuidFilenameTransform(filename),
});

const TareasUploader = new S3Uploader(s3, {
  baseKey: 'Colegio/Cursos/Tareas',
  uploadParams: {
    CacheControl: 'max-age:31536000',
    ContentDisposition: 'inline',
  },
  filenameTransform: filename => uuidFilenameTransform(filename),
});

const fsAvatarUploader = new FilesystemUploader({ // (A)
  dir: config.app.storageDir, // (B)
  filenameTransform: filename => `${Date.now()}_${filename}`, // (C)
});


const DeleteObjectS3 = async (Key) => {
  const pathName = Key.split('.com/')
  const params = {
    Bucket: config.s3.params.Bucket,
    Key: pathName[1]
}
try{
  await s3.deleteObject(params).promise()
return 'Objeto eliminado'
}catch(e){
  return 'Error al eliminar'
}
}

module.exports = { avatarUploader/* : fsAvatarUploader */,imagenesGeneralesUploader,RecursosUploader,TareasUploader,DeleteObjectS3 };