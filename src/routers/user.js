const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()

// Create User
// POST /users
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()

        // Send a welcome email.
        sendWelcomeEmail(user.email, user.name)

        const token = await user.generateAuthToken()
        res.status(201).send( { user, token })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

// Login user
//POST /users/login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

// Logout user
// POST /users/logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// Logout All Users
// POST /users/logoutAll
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// Read Users
// GET /users/me
router.get('/users/me', auth, async (req, res) => {
    try {
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// Update User
// PATCH /users/me
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// Delete User
// DELETE /users/me
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()

        // Send an account cancellation email.
        sendCancellationEmail(req.user.email, req.user.name)

        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

// Define multer settings for avatar uploads
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('File type must be an image (jpg,jpeg,png).'))
        }
        callback(undefined, true)
    }
})

// Upload an avatar image for the user
// POST /users/me/avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // Converts to .png and resize file.
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send({ message: "Avatar saved."})
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Delete an avatar image for the user
// DELETE /users/me/avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({ message: "Avatar deleted."})
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Get the avatar for the specified user id.
// GET /users/:id/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('Not Found!')
        }

        res.set('Content-Type','image/png')
        res.status(200).send(user.avatar)
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

module.exports = router