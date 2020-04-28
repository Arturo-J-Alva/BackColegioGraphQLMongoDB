const mongoose = require('mongoose')

const CursoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nivel: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Nivel'
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

module.exports=mongoose.model('Curso',CursoSchema)