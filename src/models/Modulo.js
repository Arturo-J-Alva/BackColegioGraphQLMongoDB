const mongoose = require('mongoose')

const ModuloSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    curso: {
        type: Object,
        required: true,
    },
    imagen:{
        type: String,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('Modulo',ModuloSchema)