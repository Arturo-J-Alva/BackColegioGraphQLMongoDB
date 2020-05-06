const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

//Declarando 2 librerías de node y 2 externas y carpeta contenedora para upload
const { createWriteStream, unlink } = require('fs');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const UPLOAD_DIR = './uploads';

const conectarDB = require('./config/db')

const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

conectarDB()

// Declarando carpeta upload
mkdirp.sync(UPLOAD_DIR);

const storeUpload = async (upload) => {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const id = shortid.generate();
    const path = `${UPLOAD_DIR}/${id}-${filename}`;
    const file = { id, filename, mimetype, path };
  
    // Almacene el archivo en el sistema de archivos.
    await new Promise((resolve, reject) => {
      // Crea una secuencia en la que se escribirá la carga.
      const writeStream = createWriteStream(path);
  
      //Cuando la carga esté completamente escrita, resuelva la promesa.
      writeStream.on('finish', resolve);
  
      // Si hay un error al escribir el archivo, elimine el archivo parcialmente escrito y rechace la promesa.
      writeStream.on('error', (error) => {
        unlink(path, () => {
          reject(error);
        });
      });
  
      // En el nodo <= 13, los errores no se propagan automáticamente entre flujos canalizados. 
      // Si hay un error al recibir la carga, destruya la secuencia de escritura con el error correspondiente.
      stream.on('error', (error) => writeStream.destroy(error));
  
      //Canalice la carga en la secuencia de escritura.
      stream.pipe(writeStream);
    });
  
    // Grabe los metadatos del archivo en la base de datos.
    db.get('uploads').push(file).write();
  
    return file;
  };


//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    uploads: {
        // Los límites aquí deberían ser más estrictos que la configuración para la 
        // infraestructura circundante, como Nginx, de modo que los errores se 
        // puedan manejar con elegancia mediante graphql-upload:
        // https://github.com/jaydenseric/graphql-upload#type-processrequestoptions
        maxFileSize: 10000000, // 10 MB
        maxFiles: 20,
      },
    context: ({req}) => {
        //console.log(req.headers['content-length'])
        
        const token = req.headers['authorization'] || ''
        //console.log('token: ',token.replace('Bearer ',''))
        if(token){
            try{
                const usuario= jwt.verify(token.replace('Bearer ',''),process.env.PALABRA_SECRETA_TOKEN)
                //console.log(usuario.nombre)
                return {usuario,authToken:'valid'}
            }catch(e){
                //console.log('error...')
                //console.log(e.message)
                //"invalud token" "jwt expired"
                if(e.message==='jwt expired'){
                    return {authToken:'expired'}
                }
                return {authToken:'invalid'}
                
               
            }
        }
    },
    storeUpload
})

//arrancar el servidor
server.listen({port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log('Servidor listo en la URL ' + url)
})