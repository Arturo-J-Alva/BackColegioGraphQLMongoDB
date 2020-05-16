const { gql } = require('apollo-server')

const typeDefs = gql`
    type Token {
        token: String
        usuario: DatosUsuario
    }
    type DatosUsuario {
        nombre: String
        apellido: String
        email: String
        tipo:String
        id:ID
    }
    type TokenAlumno {
        token: String
        usuario: DatosAlumno
    }
    type DatosAlumno {
        nombre: String
        apellido: String
        email: String
        tipo:String
        id:ID
        nivel: Nivel
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
    type Article {
        id:ID
        date: String
        title: String
        content: String
        image: String
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
    type Curso {
        id: ID
        nombre: String
        nivel: Nivel
        imagen: String
        creado: String
        profesores: [Profesor]
    }
    type Modulo {
        id: ID
        nombre: String
        curso: ID
        imagen: String
        creado: String
    }
    type ModuloDeCurso {
        id: ID
        nombre: String
        curso: Curso
        imagen: String
        creado: String
    }
    type Leccion {
        id: ID
        nombre: String
        modulo: ID
        teoria:[Teoria]
        recursos:[Recurso]
        tareas:[Tarea]
        imagen: String
        creado: String
    }
    type Teoria {
        nombre: String
        video: String
        link: String
        descripcion: String
    }
    type Recurso {
        nombre: String
        link: String
        descripcion: String
    }
    type Tarea {
        nombre: String
        link: String
        descripcion: String
    }
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }
    type Post {
        author: String
        comment: String
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
    input CursoInput {
        nombre: String
        nivel: ID
        imagen: String
        profesores: [ID]
    }
    input ModuloInput {
        nombre: String
        curso: ID
        imagen: String
    }
    input LeccionInput {
        nombre: String
        modulo: ID
        teoria:[TeoriaInput]
        recursos:[RecursoInput]
        tareas:[TareaInput]
        imagen: String
    }
    input TeoriaInput {
        nombre: String
        video: String
        link: String
        descripcion: String
    }
    input RecursoInput {
        nombre: String
        link: String
        descripcion: String
    }
    input TareaInput {
        nombre: String
        link: String
        descripcion: String
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

    #Curso
    obtenerCursos:[Curso]

    #Módulo
    obtenerModulos:[Modulo]
    obtenerModulosPorCurso(id:ID!):[ModuloDeCurso]

    #Leccion
    obtenerLecciones:[Leccion]
    obtenerLeccionesPorModulo(id:ID!):[Leccion]

    #Peticion http get
    getArticulos: Article

    #upload
    uploads: [File]

    #post
    posts: [Post]
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
    actualizarAlumno(id: ID!, input:AlumnoInput):Alumno

    #Alumno
    nuevoCurso(input:CursoInput!):Curso
    actualizarCurso(id:ID!,input:CursoInput):Curso
    eliminarCurso(id:ID!): String
    autenticarAlumno(input: AutenticarInput!): TokenAlumno

    #Módulo
    nuevoModulo(input:ModuloInput!):Modulo
    actualizarModulo(id:ID!,input:ModuloInput): Modulo
    eliminarModulo(id:ID!): String

    #Leccion
    nuevoLeccion(input:LeccionInput!):Leccion
    actualizarLeccion(id:ID!,input:LeccionInput): Leccion
    eliminarLeccion(id:ID!): String

    #Upload
    uploadFile(file: Upload!): File!
    uploadFiles(files: [Upload]!): [File]!
    
    #Post
    addPost(author: String, comment: String): Post
    }

    type Subscription {
    postAdded: Post
    }
`

module.exports = typeDefs