const mongoose = require('mongoose')

const NivelSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    cronograma: {
        type: String,
        required: true,
        trim: true
    }
})

module.exports=mongoose.model('Nivel',NivelSchema)