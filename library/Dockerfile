FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/libraryjar.jar libraryjar.jar

RUN mvn clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java","-jar","libraryjar.jar"]