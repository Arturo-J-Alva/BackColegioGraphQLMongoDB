const mongoose = require('mongoose')

const AlumnoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    ndoc: {
        type: Object,
        required: true,
        trim: true,
        unique: true
    },
    sexo: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    apoderado: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    grupo: {
        type: Object,
        required: true
    },
    domicilio: {
        type: String,
        trim: true
    }
})

module.exports=mongoose.model('Alumno',AlumnoSchema)