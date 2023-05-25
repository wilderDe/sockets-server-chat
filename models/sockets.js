const { usuarioConectado, usuarioDesconectado, getUsuarios, grabarMensaje } = require("../controllers/sockets");
const { comprovarJWT } = require("../helpers/jwt");

class Sockets {

    constructor( io ) {

        this.io = io;

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', async( socket ) => {
            //Con este token tendremos el uid y lo podremos conectar
            const [valido, uid ] = comprovarJWT(socket.handshake.query['x-token'])

            if( !valido ){
                console.log('socket no identidicado');
                return socket.disconnect();
            }
            console.log("Cliente conectado! ", uid)
            await usuarioConectado( uid );

            //Unir al usuario a una sala de socket.io 
            socket.join( uid );
            

            //TODO: Validar el JWT
            //Si el token no es vlaido, desconectarlo

            //TODO: Saber que usuario esta activo mediante el UID del token

            // Emitir a "todos" los usuarios conectados y que se esta conectando
            this.io.emit( 'lista-usuarios', await getUsuarios() )


            //TODO: Socket join, a una sala con uid

            //TODO: Escuchar cuando el cliente manda un mensaje
            //mensaje-personal
            socket.on('mensaje-personal', async( payload ) => {
                const mensaje = await grabarMensaje(payload); 
                //Emitimos a la sala quie se creo en la linea 27
                this.io.to( payload.para ).emit('mensaje-personal', mensaje)
                this.io.to( payload.de ).emit('mensaje-personal', mensaje)
            })


            //TODO: Disconnect
            //Marcar en la BD que el usuario se desconecto
            
            //TOOD: Emitir todos los usuarios conectados
            
            socket.on('disconnect', async() => {
                console.log('cliente desconectado! ', uid)
                await usuarioDesconectado( uid )
                this.io.emit( 'lista-usuarios', await getUsuarios() )

            })
        });
    }

}


module.exports = Sockets;