'use strict'
const { Types: { ObjectId } } = require('mongoose')
const Nivel = require('../models/Nivel')
const Profesor = require('../models/Profesor')
const Tutor = require('../models/Tutor')
const Grupo = require('../models/Grupo')
const Alumno = require('../models/Alumno')
const Curso = require('../models/Curso')
const Modulo = require('../models/Modulo')
const Leccion = require('../models/Leccion')
const Post = require('../models/Post')
const axios = require('axios')

const ValidarToken = (ctx) => {
    if (ctx.authToken === 'expired') throw new Error('Token expired')
    if (ctx.authToken === 'invalid' || !ctx.authToken) throw new Error('Token invalid')
}

const controller = {
    obtenerNiveles: async (_, { }, ctx) => {
        console.log(ctx)
        ValidarToken(ctx)
        const niveles = await Nivel.find({})
        return niveles
    },
    obtenerTutores: async (_, { }, ctx) => {
        console.log(ctx)
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
        const grupos = await Grupo.find({})
        return grupos
    },
    obtenerAlumnos: async (_, { }, ctx) => {
        ValidarToken(ctx)
        const alunmnos = await Alumno.find({})
        return alunmnos
    },
    obtenerCursos: async (_, { }, ctx) => {
        ValidarToken(ctx)
        const cursos = await Curso.find({})
        return cursos
    },
    obtenerCursosPorProfesor: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //Verificar si profe existe
        profesorExiste = await Profesor.findById(id)
        if (!profesorExiste) throw new Error('El profesor no existe')
        const cursos = await Curso.find({
            profesores: {
                $in: [profesorExiste]
            }
        })
        return cursos
    },
    obtenerCursoPorID: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        //console.log(ctx)
        //Verificar si el curso existe
        cursoExiste = await Curso.findById(id)
        if (!cursoExiste) throw new Error('El curso no existe')

        //Verificar si el curso le corresponde al profesor
        const { usuario } = ctx
        const profVerif = cursoExiste.profesores.filter(prof => prof._id.toString() === usuario.id)
        if (profVerif.length === 0) throw new Error('No tienes las credenciales')
        return cursoExiste
    },
    obtenerModulos: async (_, { }, ctx) => {
        ValidarToken(ctx)
        const modulos = await Modulo.find({})
        return modulos
    },
    obtenerModulosPorCurso: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        const { tipo } = ctx.usuario
        const idprof = ctx.usuario.id
        let condProf = false
        const modulos = await Modulo.find({ "curso._id": ObjectId(id) })

        if (modulos.length > 0) {
            modulos.map(modulo => {
                //eliminando curso._id y agregando curso.id (ésto no es necesario pero estoy probando)
                modulo.curso.id = modulo.curso._id
                delete modulo.curso._id
                modulo.curso.profesores.map((prof) => {
                    if (tipo === 'profesor') {
                        //Verificar si el curso le corresponde al profesor (ésto si es necesario)
                        if (prof._id.toString() === idprof) condProf = prof._id.toString() === idprof || condProf
                    }
                    //eliminando profe._id y agregando profe.id (ésto no es necesario pero estoy probando)
                    prof.id = prof._id
                    delete prof._id
                })
            })
            if (tipo === 'profesor' && !condProf) throw new Error('No tienes las credenciales')
        }

        return modulos
    },
    obtenerLecciones: async (_, { }, ctx) => {
        ValidarToken(ctx)
        const lecciones = await Leccion.find({}).populate('modulo')
        return lecciones
    },
    getArticulos: async () => {
        const res = await axios.get('http://localhost:4000/api/article/5de1a282df8f5732a4c8e66e')
        console.log(res.data)
        const { _id, date, title, content, image } = res.data.article
        const article = { id: _id, date, title, content, image }
        console.log(article)
        return article
    },
    obtenerLeccionesPorModulo: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        const { tipo } = ctx.usuario
        const iduser = ctx.usuario.id
        //Verificar si existe módulo
        const moduloExiste = await Modulo.findById(id)
        if (!moduloExiste) throw new Error('El módulo no existe')
        const lecciones = await Leccion.find({ "modulo": id }).populate('modulo')
        //si es profe verificar que el modulo (y curso) le corresponde
        if (tipo === 'profesor') {
            const verf = moduloExiste.curso.profesores.filter(prof => prof._id.toString() === iduser)
            if (verf.length === 0) throw new Error('No tienes las credenciales')
        }
        return lecciones
    },
    obtenerLeccionesPorID: async (_, { id }, ctx) => {
        ValidarToken(ctx)
        const lecciones = await Leccion.findById(id).populate('modulo')
        return lecciones
    },
    posts: async (root, args, context) => {
        const post = await Post.find({})
        return post
    }
}

module.exports = controller;