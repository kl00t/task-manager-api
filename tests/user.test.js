const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

// Generate valid object id for the user
const validUserId = new mongoose.Types.ObjectId()

// Create a valid user
const validUser = {
    _id: validUserId,
    name: 'Mike',
    email: 'mike@example.com',
    age: 21,
    password: 'MyV@alidP@ssword123!',
    tokens: [{
        token: jwt.sign( { _id: validUserId }, process.env.JWT_SECRET)
    }]
}

const inValidUser = {
    name: 'Dave',
    email: 'dave@example.com',
    age: 40,
    password: 'Red@123!'
}

beforeEach( async () => {
    // runs before each test run
    await User.deleteMany()
    await new User(validUser).save()
})

afterEach( async () => {
    // runs after each test run
    //await User.deleteMany()
})

test('Should signup a new user', async () => {
    
    const newUser = {
        name: 'Frank Adams',
        email: 'frank_adams@example.com',
        age: 41,
        password: 'MyV@alidP@ssword123!'
    }
    
    const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201)

        // Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()
        
        // Assertions about the response
        expect(response.body).toMatchObject({
            user: {
                name: newUser.name,
                email: newUser.email,
                age: newUser.age
            },
            token: user.tokens[0].token
        })

        // Assert that password not in clear text format
        expect(user.password).not.toBe(newUser.password)
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: validUser.email,
            password: validUser.password
        })
        .expect(200)

        // Assert that the user is in the database
        const user = await User.findById(validUserId)
        expect(user).not.toBeNull()

        // the response token should be the users second token
        expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: inValidUser.email,
            password: inValidUser.password
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .send()
        .expect(200)

        // Assert that the user is not in the database
        const user = await User.findById(validUserId)
        expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

        // Assert that the image is in the database
        const user = await User.findById(validUserId)
        expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should not delete avatar image for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me/avatar')
        .expect(401)
})

test('Should delete avatar image', async () => {
    await request(app)
        .delete('/users/me/avatar')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .expect(200)

        // Assert that the image is not in the database
        const user = await User.findById(validUserId)
        expect(user).not.toHaveProperty('user.avatar');
})

test('Should update valid user fields', async () => {
    
    const updatedUser = {
        name: 'Adam',
        email: 'dave@example.com',
        age: 27,
        password: 'Blu&345?'
    }

    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .send()
        .expect(200)

        // Assert that the user is in the database
        const user = await User.findById(validUserId)
        expect(user).not.toBeNull()

        // Assert that the fields have changed
        expect(response.body).not.toMatchObject({
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                age: updatedUser.age,
                password: updatedUser.password
            }
        })
})

test('Should not update for unauthenticated user', async () => {
    await request(app)
        .patch('/users/me')
        .send({name: 'Bob'})
        .expect(401)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .send({
            name: 'Adam',
            location: 'Manchester',
            shoeSize: 9
        })
        .expect(400)
})