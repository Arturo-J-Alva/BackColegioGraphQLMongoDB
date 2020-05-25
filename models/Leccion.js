const mongoose = require('mongoose')

const LeccionSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
        //unique: true
    },
    modulo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Modulo'
    },
    descripcion: {
        type: String,
        trim: true
    },
    video: {
        type: String,
        trim: true
    },
    recursos: {
        type: Array
    },
    tareas: {
        type: Array
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