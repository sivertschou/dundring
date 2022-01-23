if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "REACT_APP_DOMAIN=http://localhost:3000\nREACT_APP_HTTP_URL=http://localhost:8080/api\nREACT_APP_WS_URL=ws://localhost:8080" > .env
fi

# Make sure parent preparations are done
echo "Make sure project configs are installed ⚡️"
cd .. && npm install
echo "Done configuring project ⚡️"
