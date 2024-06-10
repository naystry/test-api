FROM node:20

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV MODEL_URL=https://storage.googleapis.com/skintone-ml/model_klasifikasi.json

CMD ["npm", "run", "start"]
