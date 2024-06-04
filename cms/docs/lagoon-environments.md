# Lagoon environments

We use the [Lagoon application delivery platform](https://docs.lagoon.sh/) to
host environments for different stages of the DPL CMS project. Our Lagoon
installation is managed by [the DPL Platform project](https://github.com/danskernesdigitalebibliotek/dpl-platform/).

One such type of environment is [pull request environments](https://docs.lagoon.sh/using-lagoon-advanced/workflows/#pull-requests).
These environments are automatically created when a developer creates a pull
request with a change against the project and allows developers and project
owners to test the result before the change is accepted.

## Howtos

### Create an environment for a pull request

1. Create a pull request for the change on GitHub. The pull request must be
   created from a branch in the same repository as the target branch.
2. Wait for GitHub Actions related to Lagoon deployment to complete. Note: This
   deployment process can take a while. Be patient.
3. A link to the deployed environment is available in the section between pull
   request activity and Actions
4. The environment is deleted when the pull request is closed

### Access the administration interface for a pull request environment

Accessing the administration interface for a pull request environment may be
needed to test certain functionalities. This can be achieved in two ways:

#### Through the Lagoon administration UI

1. Access the administration UI (see below)
2. Go to the environment corresponding to the pull request number
3. Go to the Task section for the environment
4. Select the "Generate login link [drush uli]" task and click "Run task"
5. Refresh the page to see the task in the task list and wait a bit
6. Refresh the page to see the task complete
7. Go to the task page
8. The log output contains a one-time login link which can be used to access
   the administration UI

#### Through the Lagoon CLI

1. Run `task lagoon:drush:uli`
2. The log output contains a one-time login link which can be used to access
   the administration UI

### Access the Lagoon administration UI

1. Contact administrators of the DPL Platform Lagoon instance to apply for an
   user account.
2. Access the URL for the UI of the instance e.g <https://ui.lagoon.dplplat01.dpl.reload.dk/>
3. Log in with your user account (see above)
4. Go to the dpl-cms project

### Setup the Lagoon CLI

1. Locate [information about the Lagoon instance to use in the DPL Platform
   documentation](https://github.com/danskernesdigitalebibliotek/dpl-platform/blob/main/docs/platform-environments.md)
2. Access the URL for the UI of the instance
3. Log in with your user account (see above)
4. Go to the Settings page
5. Add your SSH public key to your account
6. Install the [Lagoon CLI](https://uselagoon.github.io/lagoon-cli/)
7. Configure the Lagoon CLI to use the instance:

   ```sh
   lagoon config add \
     --lagoon [instance name e.g. "dpl-platform"] \
     --hostname [host to connect to with SSH] \
     --port [SSH port] \
     --graphql [url to GraphQL endpoint] \
     --ui [url to UI] \
   ```

8. Verify the installation:

   ```sh
   lagoon login --lagoon [instance name]
   lagoon whoami --lagoon [instance name]
   ```

9. Use the DPL Platform as your default Lagoon instance:

   ```sh
   lagoon config default --lagoon [instance name]
   ```

### Using cron in pull request environments

The `.lagoon.yml` has an environments section where it is possible to control
various settings.
On root level you specify the environment you want to address (eg.: `main`).
And on the sub level of that you can define the cron settings.
The cron settings for the main branch looks (in the moment of this writing)
like this:

```yaml
environments:
  main:
    cronjobs:
    - name: drush cron
      schedule: "M/15 * * * *"
      command: drush cron
      service: cli
```

If you want to have cron running on a pull request environment, you have to
make a similar block under the environment name of the PR.
Example: In case you would have a PR with the number #135 it would look
like this:

```yaml
environments:
  pr-135:
    cronjobs:
    - name: drush cron
      schedule: "M/15 * * * *"
      command: drush cron
      service: cli
```

#### Workflow with cron in pull request environments

This way of making sure cronb is running in the PR environments is
a bit tedious but it follows the way Lagoon is handling it.
A suggested workflow with it could be:

+ Create PR with code changes as normally
+ Write the `.lagoon.yml` configuration block connected to the current PR #
+ When the PR has been approved you delete the configuration block again
