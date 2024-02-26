# Dundring backend ⚡️

The backend is created with [Express](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).

### Running the backend

Install dependencies and do the required config.

```
$ npm i
```

Run the app

```
$ npm start
```

### Setup and use local database

1. Set `DATABASE_URL=file:./dundring.db

2. Use Prisma to init the db : `npx prisma migrate dev --name init`

hiehiheii
