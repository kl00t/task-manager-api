const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        // get the token from the Auth header.
        const token = req.header('Authorization').replace('Bearer ', '') 
        
        // validate the token against the secret.
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // find the user id from the id in the token and token exists
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }) 
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth