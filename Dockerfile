FROM node:20

WORKDIR /src/app

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
