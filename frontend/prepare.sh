if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "REACT_APP_HTTP_URL=\nREACT_APP_WS_URL=\n" > .env
fi
