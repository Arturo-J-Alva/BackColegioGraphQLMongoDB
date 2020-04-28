const mongoose = require('mongoose')

const GrupoSchema = mongoose.Schema({
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
    seccion: {
        type: String,
        required: true,
        trim: true
    },
    tutor:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tutor'
    }
})

module.exports=mongoose.model('Grupo',GrupoSchema)