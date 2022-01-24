config="\
REACT_APP_DOMAIN=http://localhost:3000
REACT_APP_HTTP_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080
"

if [ ! -f .env ]; then
    echo ".env does not exist. Create it with default values: ⚡️"
    printf "$config" > .env
    echo "$config"
    echo ".env created ⚡️"
fi

# Make sure parent preparations are done
echo "Make sure project configs are installed ⚡️"
cd .. && npm install
echo "Done configuring project ⚡️"
