FROM node:20-slim AS build
WORKDIR /tmp
COPY package*.json webpack.node.config.js tsconfig.json . 
COPY src ./src
RUN npm install
RUN npm run build
FROM node:20-slim AS start
WORKDIR /app
ENV DB_CONNECTION_ADDRESS "mongodb://mongo:27017"
ENV WAREHOUSE_ADDRESS "warehouse-service"
ENV MENU_ADDRESS "menu-service"
ENV ORDER_ADDRESS "orders-service"
EXPOSE 3000
COPY --from=build tmp/dist/server/bundle.js .
CMD [ "node","bundle.js" ]