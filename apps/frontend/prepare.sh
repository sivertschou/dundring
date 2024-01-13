config="\
VITE_DOMAIN=http://localhost:5173
VITE_HTTP_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
"

echo "frontend/prepare.sh – Starting ⚡️"
if [ ! -f .env ]; then
	echo ".env does not exist. Create it with default values: ⚡️"
	printf "$config" >.env
	echo "$config"
	echo ".env created ⚡️"
fi
echo "frontend/prepare.sh – Done ⚡️"
