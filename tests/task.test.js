const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
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
} = require('./fixtures/db')

beforeEach(setupDatabase)

afterEach(tearDownDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${validUser.tokens[0].token}`)
        .send({
            description: 'Learn a new programming language'
        })
        .expect(201)

    // Assert that task has been added to the database.
    const task = Task.findById(response.body._id)
    expect(task).not.toBeNull()
    //expect(task.completed).toEqual(false) // TODO: Why isn't this working?
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Assert that two tasks are returned.
    expect(response.body.length).toEqual(2)
})

test('Should not delete other users tasks', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    // Assert that it is still in database
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            desc: 'Learn a new programming language'
        })
        .expect(400)
})

test('Should not create task with invalid completed', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            complete: true
        })
        .expect(400)
})

test('Should not update task with invalid description', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            desc: 'Learn a new programming language'
        })
        .expect(400)
})

test('Should not update task with invalid completed', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            comp: true
        })
        .expect(400)
})

test('Should delete user task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Assert that it is not in database
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not update other users task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(404)
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1)
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1)
})

test('Should sort task by description', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=description:desc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('Second Task')
})

test('Should sort task by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('Second Task')
})

test('Shoud sort task by updateAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('Second Task')
})

test('Shoud fetch pages of tasks', async () => {
    const response = await request(app)
        .get('/tasks?limit=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(1)
})