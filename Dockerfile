FROM node:20

WORKDIR /src/app

COPY . .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
