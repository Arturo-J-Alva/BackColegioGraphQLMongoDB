//Subscription
const Post = require('./models/Post')
const { PubSub } = require('apollo-server')
const POST_ADDED = 'POST_ADDED'

const pubsub = new PubSub();

const {obtenerNiveles,obtenerTutores,obtenerProfesores,obtenerGrupos,obtenerAlumnos,obtenerCursos,
    obtenerCursosPorProfesor,obtenerCursoPorID,obtenerModulos,obtenerModulosPorCurso,obtenerLecciones,
    getArticulos,obtenerLeccionesPorModulo,obtenerLeccionesPorID,posts} = require('./controllers/querys')

const {nuevoNivel,actualizarNivel,eliminarNivel,nuevoTutor,actualizarTutor,eliminarTutor,autenticarTutor,
    nuevoProfesor,actualizarProfesor,eliminarProfesor,autenticarProfesor,nuevoGrupo,actualizarGrupo,eliminarGrupo,
    nuevoAlumno,actualizarAlumno,autenticarAlumno,nuevoCurso,actualizarCurso,eliminarCurso,nuevoModulo,
    actualizarModulo,eliminarModulo,nuevoLeccion,actualizarLeccion,eliminarLeccion,uploadFile,uploadFiles,
    uploadWithS3,uploadImagesCourseTeacher,nuevoAdmin,autenticarAdmin} = require('./controllers/mutations')

//Resolvers
const resolvers = {
    Query: {
        obtenerNiveles,
        obtenerTutores,
        obtenerProfesores,
        obtenerGrupos,
        obtenerAlumnos,
        obtenerCursos,
        obtenerCursosPorProfesor,
        obtenerCursoPorID,
        obtenerModulos,
        obtenerModulosPorCurso,
        obtenerLecciones,
        getArticulos,
        obtenerLeccionesPorModulo,
        obtenerLeccionesPorID,
        posts
    },
    Mutation: {
        nuevoNivel,
        actualizarNivel,
        eliminarNivel,
        nuevoTutor,
        actualizarTutor,
        eliminarTutor,
        autenticarTutor,
        nuevoProfesor,
        actualizarProfesor,
        eliminarProfesor,
        autenticarProfesor,
        nuevoGrupo,
        actualizarGrupo,
        eliminarGrupo,
        nuevoAlumno,
        actualizarAlumno,
        autenticarAlumno,
        nuevoCurso,
        actualizarCurso,
        eliminarCurso,
        nuevoModulo,
        actualizarModulo,
        eliminarModulo,
        nuevoLeccion,
        actualizarLeccion,
        eliminarLeccion,
        uploadFile,
        uploadFiles,
        addPost: async (root, args, context) => { /* Subscription */
            pubsub.publish(POST_ADDED, { postAdded: args })
            const newPost = new Post({ author: args.author, comment: args.comment });
            await newPost.save()
            return newPost
        },
        uploadWithS3,
        uploadImagesCourseTeacher,
        nuevoAdmin,
        autenticarAdmin
    },
    Subscription: {
        postAdded: {
            subscribe: () => pubsub.asyncIterator([POST_ADDED])
        }
    }
}

module.exports = resolvers