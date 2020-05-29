const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
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
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    telefono: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports=mongoose.model('Admin',AdminSchema)