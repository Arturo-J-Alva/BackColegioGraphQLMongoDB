const mongoose = require('mongoose')

const LeccionSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    modulo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Modulo'
    },
    teoria: {
        type: Array,
        required: true
    },
    recursos: {
        type: Array,
        required: true
    },
    tareas: {
        type: Array,
        required: true
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

module.exports=mongoose.model('Leccion',LeccionSchema)