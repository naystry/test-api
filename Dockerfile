FROM node:lts

WORKDIR /src/app

COPY . .

RUN npm install

CMD ["npm", "run", "start"]
