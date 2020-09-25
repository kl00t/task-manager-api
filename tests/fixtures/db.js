const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

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

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Robert',
    email: 'robert@example.com',
    age: 33,
    password: 'MyV@alidP@ssword123!',
    tokens: [{
        token: jwt.sign( { _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Frank',
    email: 'frank@example.com',
    age: 33,
    password: 'MyV@alidP@ssword123!',
    tokens: [{
        token: jwt.sign( { _id: userTwoId }, process.env.JWT_SECRET)
    }]
}
const inValidUser = {
    name: 'Dave',
    email: 'dave@example.com',
    age: 40,
    password: 'Red@123!'
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task.',
    completed: true,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()

    await new User(validUser).save()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

const tearDownDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
}

module.exports = {
    validUserId,
    inValidUser,
    validUser,
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
    tearDownDatabase
}