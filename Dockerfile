FROM maven:3.8.2-openjdk-11 as BUILD

WORKDIR /build
COPY src/tourreservation/ /build/

RUN mvn -P warpack-with-env,local clean install -DskipTests=true


FROM tomcat:jdk11

COPY --from=BUILD /build/terasoluna-tourreservation-web/target/terasoluna-tourreservation-web.war webapps/
