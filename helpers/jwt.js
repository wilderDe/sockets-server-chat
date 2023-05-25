const jwt = require('jsonwebtoken');

const generarJWT = ( uid ) => {

    return new Promise( ( resolve, reject ) => {
        const payload = { uid };

        //console.log(process.env.JWT_KEY)
        //console.log(uid)
        //generamos el jwt
        jwt.sign( payload, process.env.JWT_KEY,{
            expiresIn: '24h', //en cuanto tiempo va expirar el token
        }, ( err, token ) => {
            
            if( err ){
                console.log(err)
                reject('No se pudo generar el JWT');
            }else{
                resolve( token )
            }

        })

    })

}

//Esta fucion es para verificar la persona logeada dese el front
const comprovarJWT = ( token='' ) => {

    try {
        
        const { uid } = jwt.verify( token, process.env.JWT_KEY);

        return [true, uid]

    } catch (error) {
        console.log(error)
        return [false, null]
    }

}


module. exports = {
    generarJWT,
    comprovarJWT
}