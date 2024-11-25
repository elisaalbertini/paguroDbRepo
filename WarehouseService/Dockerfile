FROM gradle:8.7.0-jdk17
WORKDIR /DistributedCafeProject
ENV DB_CONNECTION_ADDRESS "mongodb://mongo:27017"
COPY . .
EXPOSE 8080
ENTRYPOINT java -jar .WarehouseService/build/output/WarehouseService.jar