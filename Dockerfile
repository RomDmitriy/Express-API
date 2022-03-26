FROM node

WORKDIR /api

COPY package.json .

RUN npm i

COPY . .

CMD [ "node", "index.js" ]