const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')

const conectarDB = require('./config/db')

const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

conectarDB()

//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        //console.log(req.headers['content-length'])
        
        const token = req.headers['authorization'] || ''
        //console.log('token: ',token.replace('Bearer ',''))
        if(token){
            try{
                const usuario= jwt.verify(token.replace('Bearer ',''),process.env.PALABRA_SECRETA_TOKEN)
                //console.log(usuario.nombre)
                return {usuario,authToken:'valid'}
            }catch(e){
                //console.log('error...')
                //console.log(e.message)
                //"invalud token" "jwt expired"
                if(e.message==='jwt expired'){
                    return {authToken:'expired'}
                }
                return {authToken:'invalid'}
                
               
            }
        }
    }
})

//arrancar el servidor
server.listen({port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log('Servidor listo en la URL ' + url)
})