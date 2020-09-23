# task-manager-api

## Description

Task Manager REST API application written using Node.js and using MongoDB.

## Dependencies

```sh
express
mongodb
mongoose
sendgrid/mail
jsonwebtoken
validator
bcryptjs
multer
sharp
```

## Dev Dependencies

```sh
nodemon
env-cmd
```
## Environment Variables

The following environment variables will need to be setup within ./config.dev.env.

```sh
PORT=
SENDGRID_API_KEY=
SENDGRID_TO_ADDRESS=
SENDGRID_FROM_ADDRESS=
JWT_SECRET=
MONGODB_URL=
```

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
POST /users/logout
POST /users/logoutAll
GET /users/me
PATCH /users/me
DELETE /users/me
POST /users/me/avatar
DELETE /users/me/avatar
GET /users/:id/avatar
```
