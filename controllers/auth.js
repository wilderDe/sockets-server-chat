const { generarJWT } = require('../helpers/jwt');
const Usuario   = require('../models/usuario');
const bcrypt    = require('bcryptjs');

const crearUsuario = async(req, res) => { 

    try {
        const { email, password } = req.body

        const existeEmail = await Usuario.findOne({email});
        //Verifcamos si existe el email
        if(existeEmail){
            return res.status(400).json({
                ok: false,
                msg: 'El email ya existe'
            })
        }

        const usuario = new Usuario(req.body)
        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        //Guardar usuario en BD
        await usuario.save()
        //Generar el JWT
        const token = await generarJWT(usuario._id);

        res.json({
            ok:true,
            msg: 'Usuario creado',
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg:'Hable con el administrador'
        })
    }
}

const login = async(req, res) => {
    const { email, password } = req.body
    try {
        //Verificar si el email existe
        const usuarioDB = await Usuario.findOne({ email });
        if(!usuarioDB){
            return res.status(404).json({
                ok: false,
                msg:'Email no encontrado'
            })
        }

        //Valida el password
        const validPassword = bcrypt.compareSync(password, usuarioDB.password)
        if(!validPassword){
            return res.status(400).json({
                ok: false,
                msg:'Password no es correcto'
            })
        }
        
        //Generar Token
        const token = await generarJWT(usuarioDB._id)


        res.json({
            ok: true,
            usuario: usuarioDB,
            token   
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg:'Hable con el administrador'
        })
    }

}

const renewToken = async(req, res) => {

    const uid = req.uid

    //generar un JWT
    const token = await generarJWT(uid);

    //Obtener el usuario por uid
    const usuario = await Usuario.findById(uid);
    

    res.json({
        ok: true,
        usuario,
        token
    })
}

module.exports = {
    crearUsuario,
    login,
    renewToken
}