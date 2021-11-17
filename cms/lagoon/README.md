# Dockerfiles
This directory contains the Dockerfiles that are used during the deployment
of branch and PR environments for DPL CMS and for building source releases.

the cli, nginx and php dockerfiles are used to generate the container-images
that Lagoon uses in PR/Branch environments. These files mirrors the files used for production deployments in
https://github.com/danskernesdigitalebibliotek/dpl-platform/blob/main/infrastructure/dpladm/env-repo-template/. Should you need to make modifications
to these files, make sure to also make the changes to the production versions.

`source.dockerfile` is used build and store a release of dpl-cms. For PR/branch
environments the file is used as the first step in building the Lagoon images.
The same file is used by the Github action that builds tagged releases of
dpl-cms.
