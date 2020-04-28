const Nivel = require('../models/Nivel')
const Profesor = require('../models/Profesor')
const Tutor = require('../models/Tutor')
const Grupo = require('../models/Grupo')
const Alumno = require('../models/Alumno')

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
    //if (ctx.authToken === 'invalid' || !ctx.authToken) throw new Error('Token invalid')
}

//Resolvers
const resolvers = {
    Query: {
        obtenerNiveles: async (_, { }, ctx) => {
            ValidarToken(ctx)
            const niveles = await Nivel.find({})
            return niveles
        },
        obtenerTutores: async (_, { }, ctx) => {
            ValidarToken(ctx)
            const tutores = await Tutor.find({})
            return tutores
        },
        obtenerProfesores: async (_, { }, ctx) => {
            ValidarToken(ctx)
            const profesores = await Profesor.find({})
            return profesores
        },
        obtenerGrupos: async (_, { }, ctx) => {
            ValidarToken(ctx)
            const grupos = await Grupo.find({}).populate('tutor').populate('nivel')
            return grupos
        },
        obtenerAlumnos: async (_, { }, ctx) => {
            ValidarToken(ctx)
            const alunmnos = await Alumno.find({}).populate('grupo')
            return alunmnos
        }
    },
    Mutation: {
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
            console.log('existeTutorndoc:',existeTutorndoc)
            if (existeTutorndoc) {
                throw new Error('El ndoc ya está registrado')
            }
            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
            try {
                //Guardarlo en la BD
                const tutor = new Tutor(input)
                console.log('nuevo tutor:',tutor)
                const res = await tutor.save()
                console.log('res:',res)
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
            if (!tutor) throw new Error('El nivel no existe')
            //verificando si se repite el ndoc o email con otro tutor
            if (ndoc) {
                const verifndoc = await Tutor.findOne({ ndoc })
                if (verifndoc && !(verifndoc._id.toString() === id)) throw new Error('El doc ya está siendo usado')
            }
            if (email) {
                const verifEmail = await Tutor.findOne({ email })
                if (verifEmail && !(verifEmail._id.toString() === id)) throw new Error('El email ya está siendo usado')
            }
            //hasheado password
            if (password) {
                const salt = await bcryptjs.genSalt(10)
                input.password = await bcryptjs.hash(password, salt)
            }
            //Guardando en la DB
            tutor = await Tutor.findOneAndUpdate({ _id: id }, input, { new: true })
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
            if (!profesor) throw new Error('El nivel no existe')
            //verificando si se repite el ndoc o email con otro profesor
            if (ndoc) {
                const verifndoc = await Profesor.findOne({ ndoc })
                if (verifndoc && !(verifndoc._id.toString() === id)) throw new Error('El doc ya está siendo usado')
            }
            if (email) {
                const verifEmail = await Profesor.findOne({ email })
                if (verifEmail && !(verifEmail._id.toString() === id)) throw new Error('El email ya está siendo usado')
            }
            //hasheado password
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
            //Crear el token
            return {
                token: CrearToken(existeProfesor, process.env.PALABRA_SECRETA_TOKEN, '24h')
            }
        },
        nuevoGrupo: async (_, { input }, ctx) => {
            ValidarToken(ctx)
            const { nombre, tutor } = input
            //Revisar si el nombre de grupo ya está registrado
            const existeNombreGrupo = await Grupo.findOne({ nombre })
            if (existeNombreGrupo) throw new Error('El nombre de grupo ya está siendo usado')
            //Verificar si el tutor existe
            const existeTutor = await Tutor.findOne({ _id:tutor })
            if (!existeTutor) throw new Error('El tutor seleccionado no existe')
            //Revisar si el tutor de grupo ya está registrado
            const existeTutorGrupo = await Grupo.findOne({ tutor })
            if (existeTutorGrupo) throw new Error('El tutor seleccionado ya tiene grupo a cargo')
            try {
                //Guardarlo en la BD
                let grupo = new Grupo(input) //Creando nueva instancia del modelo grupo
                await grupo.save()
                grupo = await Grupo.findById(grupo.id).populate('tutor').populate('nivel')
                return grupo
            } catch (e) {
                console.log(e)
                throw new Error('Error del servidor')
            }
        },
        actualizarGrupo: async (_, { id, input }, ctx) => {
            ValidarToken(ctx)
            const { nombre,tutor } = input
            //verificar si ese grupo existe
            let grupo = await Grupo.findById(id)
            if (!grupo) throw new Error('El grupo no existe')
            //verificando si se repite el nombre o tutor con otro grupo
            if (nombre) {
                const verifNombre = await Grupo.findOne({ nombre })
                if (verifNombre && !(verifNombre._id.toString() === id)) throw new Error('El nombre ya está siendo usado')
            }
            if (tutor) {
                const existeTutor = await Tutor.findOne({_id:tutor})
                if(!existeTutor) throw new Error('El tutor seleccionado no existe')
                const verifTutor = await Grupo.findOne({ tutor })
                if (verifTutor && !(verifTutor._id.toString() === id)) throw new Error('El tutor seleccionado ya tiene otro grupo a cargo')
            }
            //Guardando en la DB
            grupo = await Grupo.findOneAndUpdate({ _id: id }, input, { new: true }).populate('tutor').populate('nivel')
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
            const { password, ndoc } = input
            //Revisar si el Alumno ya está registrado
            const existeAlumnondoc = await Alumno.findOne({ ndoc })
            if (existeAlumnondoc) throw new Error('El documento de identificacion ya está registrado')

            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt)
            try {
                //Guardarlo en la BD
                let alumno = new Alumno(input)
                await alumno.save()
                alumno = await Alumno.findById(alumno._id).populate('grupo')
                alumno.grupo = await Grupo.findById(alumno.grupo._id).populate('nivel').populate('tutor')
                return alumno
            } catch (e) {
                console.log(e)
            }
        },

    }
}

module.exports = resolvers