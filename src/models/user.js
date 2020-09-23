const mongoose = require('mongoose');
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Your password must not contain "password".')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// Defines virtual relationship between Owner and Tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    
    // Remove properties from user object
    delete userObject.password
    delete userObject.tokens
    delete userObject.__v
    delete userObject.avatar
    
    return userObject
}

// Generate an auth token based on the user credentials.
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign( { _id: user._id.toString() }, 'THIS_IS_A_SECRET')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// Find the user credentials by user and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( { email })
    if (!user) {
        throw new Error('Unable to login.')
    }
    
    const isMatch = await bcryptjs.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login.')
    }

    return user
}

// Has the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    
    // hash the user password
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next() // must be called at end of function
})

// Deletes user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany( { owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User