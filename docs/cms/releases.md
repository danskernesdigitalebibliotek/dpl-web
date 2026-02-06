# Releases

## Building and publishing releases

A release of dpl-cms can be build by pushing a tag that matches the following
pattern:

```shell
# Replace <version> with the version.
git tag <version>

# Eg.
git tag 1.2.3
```

The actual release is performed by the `Publish source` Github action which
invokes `task source:deploy`  which in turn uses the tasks `source:build` and
`source:push` to build and publish the release.

Using the action should be the preferred choice for building and publishing
releases, but should you need to - it is possible to run the task manually
given you have the necessary permissions for pushing the resulting source-image.
Should you only need to produce the image, but not push it the task you can opt
for just invoking the `source:build` task.

You can override the name of the built image and/or the destination registry
temporarily by providing a number of environment variables (see the
[Taskfile](Taskfile.yml)). To permanently change these configurations, eg. in
a fork, change the defaults directly in the `Taskfile.yml`.
