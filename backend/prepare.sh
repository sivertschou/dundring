config="\
PORT=8080
NODE_ENV=development
TOKEN_SECRET=12345
DATA_PATH=data
SLACK_USER_CREATION=
SLACK_ERRORS=
SLACK_GROUP_SESSION=
SLACK_FEEDBACK=
"
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

# Make sure parent preparations are done
echo "Make sure project configs are installed ⚡️"
cd .. && npm install
echo "Done configuring project ⚡️"
