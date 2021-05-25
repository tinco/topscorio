FROM node
ADD . /app
WORKDIR /app
RUN npm run build
ENV SERVER_PORT 8080
EXPOSE 8080
CMD npm run start