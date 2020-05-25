const mongoose = require('mongoose')

const GrupoSchema = mongoose.Schema({
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
    seccion: {
        type: String,
        required: true,
        trim: true
    },
    tutor:{
        type: Object,
        required: true
    }
})

module.exports=mongoose.model('Grupo',GrupoSchema)