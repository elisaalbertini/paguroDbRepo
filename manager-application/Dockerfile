FROM node:20-slim AS build
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build 

FROM nginx:latest AS ngi

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/manager-application /usr/share/nginx/html

EXPOSE 80