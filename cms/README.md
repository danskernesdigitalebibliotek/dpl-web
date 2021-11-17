# dpl-cms
This is the main repository used for building the core Drupal CMS which is used by the danish public libraries.

# Running a local development
If you want to develop and maintain the DPL cms project locally you can run: `dev:reset`.
The command builds the site with dependencies and starts the required docker containers.

## Prerequisites
In order to run local development you need:
* go-task, https://taskfile.dev
* docker
* Preferably support for `VIRTUAL_HOST` environment variables for Docker containers. Examples: [Dory (OSX)](https://github.com/FreedomBen/dory) or [`nginx-proxy`](https://github.com/nginx-proxy/nginx-proxy).

## Other initial steps

If you are using a mac/OSX it is recommended to use nfs on the mounted volumes in docker-compose.

Look at [mac-nfs.readme.md](mac-nfs.readme.md) in order to set it up.

# Publishing new version of source image
When you run: `task source:deploy` a new docker image will be build and deployed to the container registry.
The image contains the source code of the DPL cms project.
