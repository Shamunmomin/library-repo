FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/*.jar libraryjar.jar

RUN mvn clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java","-jar","libraryjar.jar"]