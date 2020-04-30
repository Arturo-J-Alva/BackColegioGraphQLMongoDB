const mongoose = require('mongoose')

const CursoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nivel: {
        type: Object,
        required: true
    },
    imagen:{
        type: String,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now
    },
    profesores: {
        type: Array,
        require:true
    }
})

module.exports=mongoose.model('Curso',CursoSchema)