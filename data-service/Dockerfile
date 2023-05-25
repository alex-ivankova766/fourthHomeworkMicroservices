FROM node

WORKDIR /data-service

COPY /data-service/package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]