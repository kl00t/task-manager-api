const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT
const inMaintenanceMode = false

// Register express middleware
app.use((req, res, next) => {
    if (inMaintenanceMode) {
        res.status(503).send('API currently in maintenance mode.')
    } else {
        next()
    }
})

app.use(express.json()) // automatically parse incoming requests as JSON
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Listening on port ' + port)
})