FROM uselagoon/mariadb-10.6-drupal:latest

COPY .build/dpl-cms-default.sql /docker-entrypoint-initdb.d/010-dpl-cms-default.sql
