if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "REACT_HTTP_BASE_URL=\nREACT_WS_BASE_URL=\n" > .env
fi
