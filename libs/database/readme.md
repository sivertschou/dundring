# Spin up local database

1. Pull the database image
   ```
   docker pull postgres:16.1-alpine
   ```
2. Start the database
   ```
   docker run \
     -p 5432:5432 \
     -e POSTGRES_PASSWORD=password \
     postgres:16.1-alpine
   ```
3. Push the migrations to the database
   ```
    DATABASE_URL=postgres://postgres:password@localhost:5432/dundring \
     yarn db:migrate
   ```
   You can also set this in the `.env` file. See `.env.example`
