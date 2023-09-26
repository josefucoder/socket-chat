const { io } = require('../server');
const { Usuarios }= require('../clases/usuarios');
const { crearMensaje } = require('../utilidades/utilidades')

const usuarios = new Usuarios();


io.on('connection', (client) => {

    console.log('Usuario conectado');

    client.on("entrarChat", (data, callback)=>{

        if( !data.nombre || !data.sala ){

            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            })
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona( client.id, data.nombre, data.sala );

        client.broadcast.to(data.sala).emit('listadoPersonas', usuarios.getPersonasPorSala(data.sala))

        callback( usuarios.getPersonasPorSala( data.sala ) );
    });

    client.on('crearMensaje', (data)=>{

        let persona = usuarios.getPersona(client.id)

        let mensaje = crearMensaje( persona.nombre, data.mensaje );

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    })

    client.on('disconnect',()=>{
        
        let personaBorrada = usuarios.borrarPersona( client.id );

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${ personaBorrada.nombre} salio del chat`))

        client.broadcast.to(personaBorrada.sala).emit('listadoPersonas', usuarios.getPersonasPorSala(personaBorrada.sala))
    });

    client.on('mensajePrivado', data=>{

        // if( !data.nombre ){

        //     return callback({
        //         error: true,
        //         mensaje: 'El nombre es necesario'
        //     })
        // }

        let persona = usuarios.getPersona( client.id );
        client.broadcast.to(data.receptor).emit('mensajePrivado', crearMensaje( persona.nombre , data.mensaje ));
    })

});