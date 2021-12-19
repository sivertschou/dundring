if [ ! -f .env ]; then
    echo ".env does not exist; creating it ⚡️"
    printf "PORT=\nNODE_ENV=development\nTOKEN_SECRET=\nDATA_PATH=\nSLACK_USER_CREATION=\nSLACK_ERRORS=\nSLACK_GROUP_SESSION=\nSLACK_FEEDBACK=\n" > .env
fi

if [ ! -d data ]; then
    echo "data directory does not exits; creating it ⚡️"
    mkdir -p data
    printf "[]" > data/users.json
    printf "[]" > data/messages.json
fi

# Make sure parent preparations are done
echo "Make sure project configs are installed ⚡️"
cd .. && npm install
echo "Done configuring project ⚡️"
