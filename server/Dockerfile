FROM node:20-slim
WORKDIR /app
ENV DB_CONNECTION_ADDRESS "mongodb://mongo:27017"
COPY . .
EXPOSE 3000
RUN npm install
COPY . .
CMD [ "npx", "ts-node","/app/src/server.ts" ]