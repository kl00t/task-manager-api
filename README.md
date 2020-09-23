# task-manager-api

## Description

Task Manager REST API application written using Node.js and using MongoDB.

## Dependencies

-express
-mongodb
-mongoose
-sendgrid/mail
-jsonwebtoken
-validator
-bcryptjs
-multer
-sharp

## Dev Dependencies

-nodemon
-env-cmd

## Environment Variables

The following environment variables will need to be setup in the task-manager-api/config directory.

PORT=

SENDGRID_API_KEY=

SENDGRID_TO_ADDRESS=

SENDGRID_FROM_ADDRESS=

JWT_SECRET=

MONGODB_URL=

## Install

```sh
npm install
```

## Usage

```sh
npm run start
```

## Development

```sh
npm run dev
```

## Run tests

```sh
npm run test
```

## Endpoints

```sh
POST /users
POST /users/login
```
