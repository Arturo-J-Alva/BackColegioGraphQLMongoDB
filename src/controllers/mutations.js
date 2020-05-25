const { Types: { ObjectId } } = require('mongoose')
const Nivel = require('../models/Nivel')
const Profesor = require('../models/Profesor')
const Tutor = require('../models/Tutor')
const Grupo = require('../models/Grupo')
const Alumno = require('../models/Alumno')
const Curso = require('../models/Curso')
const Modulo = require('../models/Modulo')
const Leccion = require('../models/Leccion')

const { createWriteStream } = require('fs');
const { avatarUploader, imagenesGeneralesUploader, RecursosUploader, TareasUploader, DeleteObjectS3 } = require('../uploaders');

var bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

const CrearToken = (usuario, secreta, expiresIn) => {
    //console.log(usuario)
    const { id, email, nombre, apellido, ndoc, tipo } = usuario
    const token = jwt.sign({ id, email, nombre, apellido, ndoc, tipo }, secreta, { expiresIn })
    return token
}

const ValidarToken = (ctx) => {
    if (ctx.authToken === 'expired') throw new Error('Token expired')
    if (ctx.authToken === 'invalid' || !ctx.authToken) throw new Error('Token invalid')
}

const controller = {
    nuevoNivel: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { nombre } = input
        //Revisar si el nivel ya está registrado
        const existeNivel = await Nivel.findOne({ nombre })
        //console.log('existenivel:',existeNivel)
        if (existeNivel) {
            throw new Error('El nivel ya está registrado')
        }

        try {
            //Guardarlo en la BD
            const nivel = new Nivel(input) //Creando nueva instancia del modelo nivel
            await nivel.save()
            //console.log('nivel:',nivel)
            return nivel
        } catch (e) {
            console.log(e)
            throw new Error('Error del servidor')
        }
    },
    actualizarNivel: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { nombre } = input
        //verificar si ese nivel existe
        let nivel = await Nivel.findById(id)
        if (!nivel) throw new Error('El nivel no existe')
        //verificando si se repite el nombre con otro nivel
        if (nombre) {
            const verifNombre = await Nivel.findOne({ nombre })
            if (verifNombre && !(verifNombre._id.toString() === id)) throw new Error('El nombre ya está siendo usado')
        }
        //Guardando en la DB
        nivel = await Nivel.findOneAndUpdate({ _id: id }, input, { new: true })
        //actualizando Nivel de cada Grupo
        const nivelJSON = nivel.toJSON()
        await Grupo.updateMany({ "nivel._id": nivel._id }, {
            $set: {
                nivel: nivelJSON
            }
        })
        //actualizando nivel de alumnos
        await Alumno.updateMany({ "grupo.nivel._id": nivel._id }, {
            $set: {
                "grupo.nivel": nivelJSON
            }
        })
        return nivel
    },
    eliminarNivel: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar que exista el producto
        let nivel = await Nivel.findById(id)
        if (!nivel) throw new Error('Nivel no encontrado')
        //Guardando en la DB
        await Nivel.findOneAndRemove({ _id: id })
        return "Nivel eliminado"
    },
    nuevoTutor: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { email, password, ndoc } = input
        //Revisar si el tutor ya está registrado
        const existeTutorEmail = await Tutor.findOne({ email })
        //console.log(existeTutorEmail)
        if (existeTutorEmail) {
            throw new Error('El email ya está registrado')
        }
        const existeTutorndoc = await Tutor.findOne({ ndoc })

        if (existeTutorndoc) {
            throw new Error('El ndoc ya está registrado')
        }
        const salt = await bcryptjs.genSalt(10)
        input.password = await bcryptjs.hash(password, salt)
        try {
            //Guardarlo en la BD
            const tutor = new Tutor(input)
            const res = await tutor.save()
            return tutor
        } catch (e) {
            console.log(e)
        }
    },
    actualizarTutor: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { email, password, ndoc } = input
        //verificar si ese tutor existe
        let tutor = await Tutor.findById(id)
        if (!tutor) throw new Error('El tutor no existe')
        //verificando si se repite el ndoc o email con otro tutor
        if (ndoc) {
            const verifndoc = await Tutor.findOne({ ndoc })
            if (verifndoc && !(verifndoc._id.toString() === id)) throw new Error('El doc ya está siendo usado')
        }
        if (email) {
            const verifEmail = await Tutor.findOne({ email })
            if (verifEmail && !(verifEmail._id.toString() === id)) throw new Error('El email ya está siendo usado')
        }
        //hasheando password
        if (password) {
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
        }
        //Guardando en la DB
        tutor = await Tutor.findOneAndUpdate({ _id: id }, input, { new: true })
        //actualizando Tutor de Grupo
        const tutorJSON = tutor.toJSON()

        const grupo = await Grupo.findOneAndUpdate({ "tutor._id": tutor._id }, {
            $set: {
                tutor: tutorJSON
            }
        }, { new: true })
        if (grupo) {
            //actualizando Grupo de Alumno
            const grupoJSON = grupo.toJSON()

            await Alumno.updateMany({ "grupo._id": grupo._id }, {
                $set: {
                    grupo: grupoJSON
                }
            })
        }
        return tutor
    },
    eliminarTutor: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar que exista el producto
        let tutor = await Tutor.findById(id)
        if (!tutor) throw new Error('Tutor no encontrado')
        //Guardando en la DB
        await Tutor.findOneAndRemove({ _id: id })
        return "Tutor eliminado"
    },
    autenticarTutor: async (_, { input }) => {
        const { email, password } = input
        //Si el Tutor existe
        let existeTutor = await Tutor.findOne({ email })
        if (!existeTutor) {
            throw new Error('No existe tutor con ese email')
        }

        //Revisar si el password es correcto
        const passwordCorrecto = await bcryptjs.compare(password, existeTutor.password)
        if (!passwordCorrecto) {
            throw new Error('El password es incorrecto')
        }
        existeTutor.tipo = 'tutor'
        //Crear el token
        return {
            token: CrearToken(existeTutor, process.env.PALABRA_SECRETA_TOKEN, '24h')
        }
    },
    nuevoProfesor: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { email, password, ndoc } = input
        //Revisar si el Profesor ya está registrado
        const existeProfesorEmail = await Profesor.findOne({ email })
        if (existeProfesorEmail) {
            throw new Error('El email ya está registrado')
        }
        const existeProfesorndoc = await Profesor.findOne({ ndoc })
        if (existeProfesorndoc) {
            throw new Error('El ndoc ya está registrado')
        }

        const salt = await bcryptjs.genSalt(10)
        input.password = await bcryptjs.hash(password, salt)
        try {
            //Guardarlo en la BD
            const profesor = new Profesor(input)
            await profesor.save()
            return profesor
        } catch (e) {
            console.log(e)
        }
    },
    actualizarProfesor: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { email, password, ndoc } = input
        //verificar si ese profesor existe
        let profesor = await Profesor.findById(id)
        if (!profesor) throw new Error('El profesor no existe')
        //verificando si se repite el ndoc o email con otro profesor
        if (ndoc) {
            const verifndoc = await Profesor.findOne({ ndoc })
            if (verifndoc && !(verifndoc._id.toString() === id)) throw new Error('El doc ya está siendo usado')
        }
        if (email) {
            const verifEmail = await Profesor.findOne({ email })
            if (verifEmail && !(verifEmail._id.toString() === id)) throw new Error('El email ya está siendo usado')
        }
        //hasheando password
        if (password) {
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
        }
        //Guardando en la DB
        profesor = await Profesor.findOneAndUpdate({ _id: id }, input, { new: true })
        return profesor
    },
    eliminarProfesor: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar que exista el producto
        let profesor = await Profesor.findById(id)
        if (!profesor) throw new Error('Profesor no encontrado')
        //Guardando en la DB
        await Profesor.findOneAndRemove({ _id: id })
        return "Profesor eliminado"
    },
    autenticarProfesor: async (_, { input }) => {
        const { email, password } = input
        //Si el Profesor existe
        let existeProfesor = await Profesor.findOne({ email })
        if (!existeProfesor) {
            throw new Error('No existe profesor con ese email')
        }
        //Revisar si el password es correcto
        const passwordCorrecto = await bcryptjs.compare(password, existeProfesor.password)
        if (!passwordCorrecto) {
            throw new Error('El password es incorrecto')
        }
        existeProfesor.tipo = 'profesor'
        let { id, nombre, apellido, tipo } = existeProfesor
        const usuario = { id, email: existeProfesor.email, nombre, apellido, tipo }
        return {
            token: CrearToken(existeProfesor, process.env.PALABRA_SECRETA_TOKEN, '24h'),
            usuario
        }
    },
    nuevoGrupo: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { nombre, tutor, nivel } = input
        //Revisar si el nombre de grupo ya está registrado
        const existeNombreGrupo = await Grupo.findOne({ nombre })
        if (existeNombreGrupo) throw new Error('El nombre de grupo ya está siendo usado')
        //Verificar si el tutor existe
        const existeNivel = await Nivel.findOne({ _id: nivel })
        if (!existeNivel) throw new Error('El nivel seleccionado no existe')
        //Verificar si el tutor existe
        const existeTutor = await Tutor.findOne({ _id: tutor })
        if (!existeTutor) throw new Error('El tutor seleccionado no existe')
        //Revisar si el tutor de grupo ya está registrado(por mientras lo haré así:)

        const existeTutorGrupo = await Grupo.findOne({ tutor: existeTutor })

        if (existeTutorGrupo) throw new Error('El tutor seleccionado ya tiene grupo a cargo')
        //Agregando nivel y tutor al input
        input.nivel = existeNivel
        input.tutor = existeTutor
        try {
            //Guardarlo en la BD
            let grupo = new Grupo(input) //Creando nueva instancia del modelo grupo
            //grupo = await Grupo.findById(grupo.id).populate('tutor').populate('nivel')
            await grupo.save()
            return grupo
        } catch (e) {
            console.log(e)
            throw new Error('Error del servidor')
        }
    },
    actualizarGrupo: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { nombre, tutor, nivel } = input
        //verificar si ese grupo existe
        let grupo = await Grupo.findById(id)
        if (!grupo) throw new Error('El grupo no existe')
        //verificando si se repite el nombre o tutor con otro grupo
        if (nombre) {
            const verifNombre = await Grupo.findOne({ nombre })
            if (verifNombre && !(verifNombre._id.toString() === id)) throw new Error('El nombre ya está siendo usado')
        }
        if (tutor) {
            const existeTutor = await Tutor.findOne({ _id: tutor })
            if (!existeTutor) throw new Error('El tutor seleccionado no existe')
            const verifTutor = await Grupo.findOne({ tutor: existeTutor })
            if (verifTutor && !(verifTutor._id.toString() === id)) throw new Error('El tutor seleccionado ya tiene otro grupo a cargo')
            //Agregando tutor al input
            input.tutor = existeTutor
        }
        if (nivel) {
            const existeNivel = await Nivel.findById(nivel)
            if (!existeNivel) throw new Error('El nivel seleccionado no existe')
            //Agregando nivel al input
            input.nivel = existeNivel
        }
        //Guardando en la DB
        grupo = await Grupo.findOneAndUpdate({ _id: id }, input, { new: true })
        //actualizando Grupo de Alumno
        const grupoJSON = grupo.toJSON()

        await Alumno.updateMany({ "grupo._id": grupo._id }, {
            $set: {
                grupo: grupoJSON
            }
        })
        return grupo
    },
    eliminarGrupo: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar que exista el producto
        const grupo = await Grupo.findById(id)
        if (!grupo) throw new Error('Grupo no encontrado')
        //Guardando en la DB
        await Grupo.findOneAndRemove({ _id: id })
        return "Grupo eliminado"
    },
    nuevoAlumno: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { password, ndoc, grupo } = input
        //Revisar si el Alumno ya está registrado
        const existeAlumnondoc = await Alumno.findOne({ ndoc })
        if (existeAlumnondoc) throw new Error('El documento de identificacion ya está registrado')
        //Revisar si grupo existe
        const grupoExiste = await Grupo.findById(grupo)
        if (!grupoExiste) throw new Error('El grupo seleccionado no existe')
        //insertando datos del grupo al input
        input.grupo = grupoExiste
        //encriptando password
        const salt = await bcryptjs.genSalt(10)
        input.password = await bcryptjs.hash(password, salt)

        try {
            //Guardarlo en la BD
            let alumno = new Alumno(input)
            await alumno.save()
            return alumno
        } catch (e) {
            console.log(e)
        }
    },
    actualizarAlumno: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { email, password, ndoc, grupo } = input
        //verificar si ese alumno existe
        let alumno = await Alumno.findById(id)
        if (!alumno) throw new Error('El alumno no existe')
        if (grupo) {
            //verificar si el grupo existe
            const grupoExiste = await Grupo.findById(grupo)
            if (!grupoExiste) throw new Error('El grupo seleccionado no existe')
            //inyectando grupo a input:
            input.grupo = grupoExiste
        }
        //verificando si se repite el ndoc o email con otro alumno
        if (ndoc) {
            const verifndoc = await Alumno.findOne({ ndoc })
            if (verifndoc && !(verifndoc._id.toString() === id)) throw new Error('El doc ya está siendo usado')
        }
        if (email) {
            const verifEmail = await Alumno.findOne({ email })
            if (verifEmail && !(verifEmail._id.toString() === id)) throw new Error('El email ya está siendo usado')
        }
        //hasheando password
        if (password) {
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
        }
        //Guardando en la DB
        alumno = await Alumno.findOneAndUpdate({ _id: id }, input, { new: true })
        return alumno
    },
    autenticarAlumno: async (_, { input }) => {
        const { email, password } = input
        //Si el Alumno existe
        let existeAlumno = await Alumno.findOne({ email })
        if (!existeAlumno) {
            throw new Error('No existe alumno con ese email')
        }
        //Revisar si el password es correcto
        const passwordCorrecto = await bcryptjs.compare(password, existeAlumno.password)
        if (!passwordCorrecto) {
            throw new Error('El password es incorrecto')
        }
        existeAlumno.tipo = 'alumno'
        let { id, nombre, apellido, tipo, grupo: { nivel } } = existeAlumno
        nivel = { ...nivel, id: nivel._id }
        const usuario = { id, email: existeAlumno.email, nombre, apellido, tipo, nivel }
        const Token = {
            token: CrearToken(existeAlumno, process.env.PALABRA_SECRETA_TOKEN, '24h'),
            usuario
        }
        return Token
    },
    nuevoCurso: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { nombre, nivel } = input
        //Revisar si el nombre de curso ya está registrado
        const existeNombreCurso = await Curso.findOne({ nombre })
        if (existeNombreCurso) throw new Error('El nombre del curso ya está siendo usado')
        //Verificar si el nivel existe
        const existeNivel = await Nivel.findOne({ _id: nivel })
        if (!existeNivel) throw new Error('El nivel seleccionado no existe')
        //Verificar si los profesores existen
        let profesores = []
        for await (const idprof of input.profesores) { //si se usa map o forEach no se podrá hacerse asincronamente, en ésta función sí se puede
            const profesor = await Profesor.findById(idprof)
            if (!profesor) throw new Error('No existe al menos un profesor seleccionado')
            profesores = [...profesores, profesor]
        }
        //Agregando nivel y profesores al input
        input.profesores = profesores
        input.nivel = existeNivel
        try {
            //Guardarlo en la BD
            const curso = new Curso(input)
            await curso.save()
            return curso
        } catch (e) {
            console.log(e)
            throw new Error('Error del servidor')
        }
    },
    actualizarCurso: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { nivel, nombre } = input
        //Verificar si el curso existe 
        const cursoExiste = await Curso.findById(id)
        if (!cursoExiste) throw new Error('El curso no existe')
        //Verificar nombre curso único
        if (nombre) {
            const verifNombre = await Curso.findOne({ nombre })
            if (verifNombre && !(verifNombre._id.toString() === id)) throw new Error('No puede haber dos cursos con el mismo nombre')
        }
        //Verificar si existe el nivel
        if (nivel) {
            const nivelExiste = await Nivel.findById(nivel)
            if (!nivelExiste) throw new Error('El nivel no existe')
            //Agregando nivel al input
            input.nivel = nivelExiste
        }
        let actualizarProfesores = []
        if (input.profesores) {
            if (input.profesores.length > 0) {
                for await (const idprof of input.profesores) { //si se usa map o forEach no se podrá hacerse asincronamente, ésta función sí se puede
                    const profesor = await Profesor.findById(idprof)
                    if (!profesor) throw new Error('No existe al menos un profesor seleccionado')
                    actualizarProfesores = [...actualizarProfesores, profesor]
                }
                //Agregando nuevos profesores al input
                input.profesores = actualizarProfesores
            } else delete input.profesores //para ignorar profesores = []
        }
        //Guardando en la DB
        curso = await Curso.findOneAndUpdate({ _id: id }, input, { new: true })
        //Hallando modulos que contienen el curso
        const modulos = await Modulo.find({ "curso._id": ObjectId(id) })
        //Actualizando curso de cada modulo
        for await (const modulo of modulos) {
            modulo.curso = curso
            await Modulo.updateOne({ _id: modulo._id }, modulo)
        }
        return curso
    },
    eliminarCurso: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar si el curso existe 
        const cursoExiste = await Curso.findById(id)
        if (!cursoExiste) throw new Error('El curso no existe')
        //verificando si el Curso no tiene contenido (Módulos)
        const modulos = await Modulo.find({ "curso._id": id })
        if (modulos.length > 0) throw new Error('Solo se permite elimimar cursos sin contenido')
        //Guardando cambios en la DB
        await Curso.deleteOne({ _id: id })
        return "Curso eliminado"
    },
    nuevoModulo: async (_, { input }, ctx) => {
        ValidarToken(ctx)
        const { curso } = input
        //Verificando si el curso existe
        const cursoExiste = await Curso.findById(curso)
        if (!cursoExiste) throw new Error('El curso no existe')
        //agregando curso al input
        input.curso = cursoExiste
        //Guardando en la DB
        const modulo = new Modulo(input)
        await modulo.save()
        return modulo
    },
    actualizarModulo: async (_, { id, input }, ctx) => {
        ValidarToken(ctx)
        const { curso } = input
        //Verificando si el modulo existe
        let modulo = await Modulo.findById(id)
        if (!modulo) throw new Error('El módulo no existe')
        if (curso) {
            //Verificando si el curso existe
            let cursoExiste = await Curso.findById(curso)
            if (!cursoExiste) throw new Error('El curso no existe')
            //agregando curso al input
            input.curso = cursoExiste
        } else delete input.curso

        //Guardando en la DB
        modulo = await Modulo.findOneAndUpdate({ _id: id }, input, { new: true })
        //editando el modulo para que pueda recibir curso.id 
        if (curso) {
            let { _id, nombre, nivel, imagen, creado, profesores } = modulo.curso
            let editCurso = { id: _id, nombre, nivel, imagen, creado, profesores }
            modulo.curso = editCurso
        }

        return modulo
    },
    eliminarModulo: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificando si el modulo existe
        let modulo = await Modulo.findById(id)
        if (!modulo) throw new Error('El módulo no existe')
        //verificando si el Módulo no tiene contenido (lecciones)
        const lecciones = await Leccion.find({ modulo: id })
        if (lecciones.length > 0) throw new Error('Solo se permite elimimar módulos sin contenido')
        //Guardando cambios en la DB
        await Modulo.deleteOne({ _id: id })
        return "Módulo eliminado"
    },
    nuevoLeccion: async (_, { input, filesRec, filesTar, fileImg }, ctx) => {
        ValidarToken(ctx)
        const { usuario: { tipo } } = ctx
        if (tipo !== 'profesor') throw new Error('No tienes las credenciales')
        const { modulo } = input
        //Verificando si el curso existe
        const moduloExiste = await Modulo.findById(modulo)
        if (!moduloExiste) throw new Error('El modulo no existe')
        if (filesRec.length > 0) {
            for await (const { name, file } of filesRec) {
                const { createReadStream, filename, mimetype, encoding } = await file
                const uri = await RecursosUploader.upload(createReadStream(), {
                    filename,
                    mimetype,
                });
                input.recursos = [...input.recursos, { nombre: name, link: uri }]
            }
        }
        if (filesTar.length > 0) {
            for await (const { name, file } of filesTar) {
                const { createReadStream, filename, mimetype, encoding } = await file
                const uri = await TareasUploader.upload(createReadStream(), {
                    filename,
                    mimetype,
                });
                input.tareas = [...input.tareas, { nombre: name, link: uri }]
            }
        }

        if (fileImg) {
            const { createReadStream, filename, mimetype, encoding } = await fileImg
            const uri = await imagenesGeneralesUploader.upload(createReadStream(), {
                filename,
                mimetype,
            });
            input.imagen = uri
        }
        //Guardando en la DB
        let leccion = new Leccion(input)
        await leccion.save()
        leccion.modulo = moduloExiste
        return leccion
    },
    actualizarLeccion: async (_, { id, input, filesRec, filesTar, fileImg }, ctx) => {
        ValidarToken(ctx)
        const { usuario } = ctx
        if (usuario.tipo !== 'profesor') throw new Error('No tienes las credenciales')
        const { modulo } = input
        //Verificando si la leccion existe
        let leccion = await Leccion.findById(id)
        if (!leccion) throw new Error('La lección no existe')
        //Verificando si el modulo existe
        if (modulo) {
            const moduloExiste = await Modulo.findById(modulo)
            if (!moduloExiste) throw new Error('El modulo no existe')
        }
        //obteniendo los files recursos y tareas que fueron "eliminados" desde el front
        let recursosEliminados = []
        leccion.recursos.map(db => {
            let cond = true
            input.recursos.map(front => {
                if (front.link !== db.link) cond = cond && true
                else cond = cond && false
            })
            if (cond === true) recursosEliminados = [...recursosEliminados, db]
        })
        console.log('recursosEliminados:', recursosEliminados.length)
        let tareasEliminadas = []
        leccion.tareas.map(db => {
            let cond = true
            input.tareas.map(front => {
                if (front.link !== db.link) cond = cond && true
                else cond = cond && false
            })
            if (cond === true) tareasEliminadas = [...tareasEliminadas, db]
        })
        console.log('tareasEliminadas:', tareasEliminadas.length)
        //eliminando los objectos corresondiente a los recursos y tareas eliminados (no es necesario que sea asíncrono, ya que la respuesta no es de utilidad)
         for /* await */({link} of recursosEliminados){
           /* const res = await  */DeleteObjectS3(link)
           //console.log('res recursosEliminados:',res)
        }
        for /* await */({link} of tareasEliminadas){
            /* const res = await  */DeleteObjectS3(link)
           //console.log('res tareasEliminados:',res)
        }
        //igualmente con imagen, si se ha modficado eliminar el ya existente de s3
        if(input.imagen){
            DeleteObjectS3(leccion.imagen)
        }

        if (filesRec.length > 0) {
            for await (const { name, file } of filesRec) {
                const { createReadStream, filename, mimetype, encoding } = await file
                const uri = await RecursosUploader.upload(createReadStream(), {
                    filename,
                    mimetype,
                });
                input.recursos = [...input.recursos, { nombre: name, link: uri }]
            }
        }
        if (filesTar.length > 0) {
            for await (const { name, file } of filesTar) {
                const { createReadStream, filename, mimetype, encoding } = await file
                const uri = await TareasUploader.upload(createReadStream(), {
                    filename,
                    mimetype,
                });
                input.tareas = [...input.tareas, { nombre: name, link: uri }]
            }
        }
        if (fileImg) {
            const { createReadStream, filename, mimetype, encoding } = await fileImg
            const uri = await imagenesGeneralesUploader.upload(createReadStream(), {
                filename,
                mimetype,
            });
            input.imagen = uri
        }
        //Obteniendo dato de los profesores correspondientes para verificar si el profe es correspondiente 
        //(....pendiente)
        //Guardando en la DB
        leccion = await Leccion.findOneAndUpdate({ _id: id }, input, { new: true }).populate('modulo')
        /* //Verificar si la lección (curso) le corresponde al profesor (no tiene sentido hacer esto antes de la act. a la db)
        const verifProf = leccion.modulo.curso.profesores.filter(prof => prof._id.toString()===usuario.id)
        if(verifProf.length===0) throw new Error('No tienes las credenciales') */
        return leccion
    },
    eliminarLeccion: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        const { usuario: { tipo } } = ctx
        if (tipo !== 'profesor') throw new Error('No tienes las credenciales')
        //Verificando si el leccion existe
        let leccion = await Leccion.findById(id)
        if (!leccion) throw new Error('La lección no existe')
        //Eliminando los archivos de la lección síncronamente
        for ({link} of leccion.recursos){
            DeleteObjectS3(link)
        }
        for ({link} of leccion.tareas){
            DeleteObjectS3(link)
        }
        DeleteObjectS3(leccion.imagen)

        //Guardando cambios en la DB
        await Leccion.deleteOne({ _id: id })
        return "Lección eliminada"
    },
    uploadFile: async (parent, { file }) => {
        const { createReadStream, filename, mimetype, encoding } = await file;
        //console.log(file)
        const stream = createReadStream();
        // Store the file in the filesystem.
        await new Promise((resolve, reject) => {
            stream.on('error', error => {
                unlink(path, () => {
                    console.log('path:', path)
                    reject(error);
                });
            }).pipe(createWriteStream(filename))
                .on('error', reject)
                .on('finish', resolve)
        });
        console.log('-----------file written');
        return file;
    },
    uploadFiles: async (parent, { files }) => {
        files.map(async (file) => {
            const { createReadStream, filename } = await file;
            const stream = createReadStream();

            await new Promise((resolve, reject) => {
                stream.on('error', (error) => {
                    console.log('writerror....', error);
                })
                    .pipe(createWriteStream(filename))
                    .on('error', reject)
                    .on('finish', resolve);
            });
            console.log('-----------files written');
        });
        return files;
    },
    /* addPost: async (root, args, context) => { //Subscription
        pubsub.publish(POST_ADDED, { postAdded: args })
        const newPost = new Post({ author: args.author, comment: args.comment });
        await newPost.save()
        return newPost
    }, */
    uploadWithS3: async (_, { file }) => { /* AWS S3 */
        const { createReadStream, filename, mimetype, encoding } = await file;
        /* const { Location } = await s3.upload({ 
            Body: createReadStream(),               
            //Key: `${uuid()}${extname(filename)}`,  
            Key: `${uuid()}_${filename}`,  
            ContentType: mimetype                   
          }).promise();  */
        const uri = await avatarUploader.upload(createReadStream(), {
            filename,
            //filename:`${uuid()}_${filename}`,
            mimetype,
        });
        return {
            filename,
            mimetype,
            encoding,
            uri,
        };
    },
    uploadImagesCourseTeacher: async (_, { file, id }) => {
        const { createReadStream, filename, mimetype, encoding } = await file;
        const splitExt = filename.split('.')
        const ext = splitExt[splitExt.length - 1]
        if (ext !== 'jpg' && ext !== 'png' && ext !== 'svg' && ext !== 'gif' && ext !== 'jpeg') throw new Error('Seleccione una imagen')
        const uri = await imagenesGeneralesUploader.upload(createReadStream(), {
            filename,
            mimetype,
        });
        const curso = await Curso.findOneAndUpdate({ _id: id }, { imagen: uri }, { new: true })
        //Hallando modulos que contienen el curso
        const modulos = await Modulo.find({ "curso._id": ObjectId(id) })
        //Actualizando curso de cada modulo
        for await (const modulo of modulos) {
            modulo.curso = curso
            await Modulo.updateOne({ _id: modulo._id }, modulo)
        }
        return curso
    }
}

module.exports = controller;