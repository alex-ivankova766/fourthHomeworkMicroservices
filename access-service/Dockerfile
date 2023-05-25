FROM node

WORKDIR /access-service

COPY /access-service/package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]