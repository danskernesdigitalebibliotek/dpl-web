# Releases

## Building and publishing releases

A CMS release is built by pushing a tag that matches the following pattern:

```shell
# Replace <version> with the version.
git tag <version>

# Eg.
git tag 2026.34.2
```

The actual release is performed by the `CMS / Publish release` GitHub Actions
workflow (`.github/workflows/cms-publish-release.yml`). Its `CMS / Publish
source` job invokes `task source:deploy`, which in turn uses the tasks
`source:build` and `source:push` to build and publish the release. The same
workflow publishes the database snapshot image and appends links to both
container images to the GitHub release notes.

Using the action should be the preferred choice for building and publishing
releases, but should you need to - it is possible to run the task manually
given you have the necessary permissions for pushing the resulting source-image.
Should you only need to produce the image, but not push it the task you can opt
for just invoking the `source:build` task.

You can override the name of the built image and/or the destination registry
temporarily by providing a number of environment variables (see the
[CMS Taskfile](../../cms/Taskfile.yml)). To permanently change these
configurations, eg. in a fork, change the defaults directly in
`cms/Taskfile.yml`.
