config="\
PORT=8080
NODE_ENV=development
TOKEN_SECRET=12345
DATA_PATH=data
SLACK_USER_CREATION=
SLACK_ERRORS=
SLACK_GROUP_SESSION=
SLACK_FEEDBACK=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
DATABASE_URL=
"

echo "backend/prepare.sh – Starting ⚡️"
if [ ! -f .env ]; then
    echo ".env does not exist. Create it with default values: ⚡️"
    printf "$config" > .env
    echo "$config"
    echo ".env created ⚡️"
fi

if [ ! -d data ]; then
    echo "data directory does not exits; creating it ⚡️"
    mkdir -p data
    printf "[]" > data/users.json
    printf "[]" > data/messages.json
fi
echo "backend/prepare.sh – Done ⚡️"
