FROM node:20-slim AS build
WORKDIR /tmp
COPY package*.json webpack.node.config.js tsconfig.json . 
COPY src ./src
RUN npm install
RUN npm run build
FROM node:20-slim AS start
WORKDIR /app
ENV DB_CONNECTION_ADDRESS "mongodb://mongo:27017"
EXPOSE 8090
COPY --from=build tmp/dist/orders-service/bundle.js .
CMD [ "node","bundle.js" ]

