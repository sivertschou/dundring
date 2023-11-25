# Spin up local database

1. Pull the database image
   ```
   docker pull mysql:8.0
   ```
2. Start the database
   ```
    docker run \
      --name dundring-mysql \
      -e MYSQL_ROOT_PASSWORD=password \
      -e MYSQL_DATABASE=dundring \
      -e MYSQL_USER=mysql \
      -e MYSQL_PASSWORD=password \
      -p 3306:3306 \
      mysql:8.0
   ```
3. Push the migrations to the database
   ```
   DATABASE_URL=mysql://mysql:password@localhost:3306/dundring \
     yarn db:push
   ```
   You can also set this in the `.env` file. See `.env.example`
