FROM node

WORKDIR /api

COPY package.json .

RUN npm i

EXPOSE $PORT

COPY . .

CMD [ "node", "index.js" ]