FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
