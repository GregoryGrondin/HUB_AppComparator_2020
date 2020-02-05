FROM node:13.0.1-alpine

WORKDIR /api

COPY . .

EXPOSE 8080

RUN npm install

CMD ["npm", "start"]