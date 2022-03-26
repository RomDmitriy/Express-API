FROM node

WORKDIR /api

COPY package.json .

RUN npm i

ENV PORT 5000

COPY . .

CMD [ "node", "index.js" ]