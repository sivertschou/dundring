if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "PORT=\nTOKEN_SECRET=\nDATA_PATH=\n" > .env
fi

if [ ! -d data ]; then
    echo "data does not exist. Create it"
    mkdir -p data
    printf "[]" > data/users.json
    printf "[]" > data/messages.json
fi

# Make sure parent preparations are done
echo "Make sure project configs are installed ⚡️"
cd .. && npm install
echo "Done configuring project ⚡️"