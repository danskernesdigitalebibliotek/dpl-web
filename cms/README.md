# dpl-cms
CMS of the Danish Public Libraries.

# Publishing new version of source image
When you run: `task source:deploy` a new docker image will be build and deployed to the container registry.
The image contains the source code of the DPL cms project.

# Running a local development
If you want to develop and maintain the DPL cms project locally you can run: `dev:setup`.
The command builds the site with dependencies and starts the required docker containers.
## Prerequisities
In order to run local development you need:
* go-task, https://taskfile.dev
* docker