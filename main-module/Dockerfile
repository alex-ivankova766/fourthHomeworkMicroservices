FROM node

WORKDIR /main-module

COPY /main-module/package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]