if [ ! -f .env ]; then
    echo ".env does not exist. Create it"
    printf "REACT_APP_BASE_URL=\n" > .env
fi
