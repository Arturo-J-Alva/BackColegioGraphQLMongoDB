const mongoose = require('mongoose')

const ModuloSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    curso: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Curso'
    },
    imagen:{
        type: String,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now()
    }
})

module.exports=mongoose.model('Modulo',ModuloSchema)