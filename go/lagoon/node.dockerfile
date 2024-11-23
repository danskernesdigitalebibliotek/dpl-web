FROM uselagoon/node-20-builder:latest as builder
COPY package.json /app/
RUN yarn

FROM uselagoon/node-20:latest
COPY --from=builder /app/node_modules /app/node_modules
COPY . /app/

EXPOSE 3000

# Desperate I know.
# This was introduced after continuously getting an error
# about the .next/trace directory not being writable.
# TODO: We should investigate how to set proper user/group permissions
RUN mkdir -p /app/.next/trace
RUN chmod -R 777 /app/.next

CMD ["/app/lagoon/start.sh"]
