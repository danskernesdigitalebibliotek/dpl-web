FROM uselagoon/node-20-builder:latest as builder
COPY package.json /app/
RUN npm install
RUN npm run build

FROM uselagoon/node-20:latest
COPY --from=builder /app/node_modules /app/node_modules
COPY . /app/

EXPOSE 3000

CMD ["/app/lagoon/start.sh"]