if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "REACT_APP_HTTP_URL=http://localhost:8092/api\nREACT_APP_WS_URL=ws://localhost:8092" > .env
fi