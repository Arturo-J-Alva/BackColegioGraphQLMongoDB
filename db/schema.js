const { gql } = require('apollo-server')

const typeDefs = gql`
    type Token {
        token: String
    }
    type Nivel {
        id: ID
        nombre:String
        cronograma: String
    }
    type Profesor {
        id: ID
        nombre: String
        apellido: String
        telefono: String
        ndoc: Ndoc
        sexo: Sexo
        email: String
        password: String
    }
    type Tutor {
        id: ID
        nombre: String
        apellido: String
        telefono: String
        ndoc: Ndoc
        sexo: Sexo
        email: String
        password: String
    }
    type Grupo {
        id: ID
        nombre: String
        nivel: Nivel
        seccion: String
        tutor: Tutor
    }
    type Alumno {
        id: ID
        nombre: String
        apellido: String
        ndoc: Ndoc
        sexo: Sexo       
        apoderado:String
        telefono: String
        email: String
        password: String
        grupo: Grupo
        domicilio:String
    }
    type Ndoc {
        tipo: TipoDoc!,
        numero: String!
    }

    enum Sexo{
        MASCULINO
        FEMENINO
        OTRO
    }
    enum TipoDoc{
        DNI
        CARNET_DE_EXTRANJERIA
        PASAPORTE
    }

    input NivelInput {
        nombre:String!
        cronograma: String
    }
    input TutorInput {
        nombre: String
        apellido: String
        telefono: String
        ndoc: NdocInput
        sexo: Sexo
        email: String
        password: String
    }
    input NdocInput {
        tipo: TipoDoc!,
        numero: String!
    }
    input ProfesorInput {
        nombre: String
        apellido: String
        telefono: String
        ndoc: NdocInput
        sexo: Sexo
        email: String
        password: String
    }
    input GrupoInput {
        nombre: String
        nivel: ID
        seccion: String
        tutor: ID
    }
    input AutenticarInput{
        email:String!
        password:String!
    }
    input AlumnoInput {
        nombre: String
        apellido: String
        ndoc: NdocInput
        sexo: Sexo       
        apoderado:String
        telefono: String
        email: String
        password: String
        grupo: ID
        domicilio:String
    }

    type Query {
    #Nivel
    obtenerNiveles:[Nivel]

    #Tutor
    obtenerTutores:[Tutor]

    #Profesor
    obtenerProfesores:[Profesor]

    #Grupo
    obtenerGrupos:[Grupo]

    #Alumno
    obtenerAlumnos:[Alumno]
    }

    type Mutation {
    # Nivel
    nuevoNivel(input: NivelInput!): Nivel
    actualizarNivel(id: ID!, input:NivelInput): Nivel
    eliminarNivel(id: ID!):String

    #Tutor
    nuevoTutor(input: TutorInput!): Tutor
    actualizarTutor(id: ID!, input:TutorInput): Tutor
    eliminarTutor(id: ID!):String
    autenticarTutor(input: AutenticarInput!): Token

    #Profesor
    nuevoProfesor(input: ProfesorInput!): Profesor
    actualizarProfesor(id: ID!, input:ProfesorInput): Profesor
    eliminarProfesor(id: ID!):String
    autenticarProfesor(input: AutenticarInput!): Token

    #Grupo
    nuevoGrupo(input:GrupoInput!):Grupo
    actualizarGrupo(id: ID!, input:GrupoInput):Grupo
    eliminarGrupo(id:ID!):String

    #Alumno
    nuevoAlumno(input:AlumnoInput!):Alumno
    }

`

module.exports = typeDefs