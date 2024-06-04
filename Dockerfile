FROM hub.ladcloud.ru/docker-hub/node:20.11.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
