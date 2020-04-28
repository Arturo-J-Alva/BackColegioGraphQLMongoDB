const mongoose = require('mongoose')
require('dotenv').config({path: 'variables.env'})

const conectarDB = async () => {
    try{
        await mongoose.connect(process.env.DB_MONGO,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log('DB conectada')

    }catch(e){
        console.log('Error:',e)
        process.exit(1) //detiene la aplicación
    }
}

module.exports = conectarDB