# Alternative Lagoon File Transfer Runbook

## Overview

This runbook provides alternative instructions for transferring files from Lagoon
environments to local development when the Lagoon UI backup feature fails. This
is particularly useful for webmaster libraries that depend on module files being
available locally.
The regular way of transferring files is described in [this document](../local-development.md).

## When to Use This Runbook

- Need to download files from a Lagoon environment to local development
- Setting up a webmaster library locally that requires module files
- Manual file synchronization between environments

## Prerequisites

- Lagoon CLI installed and configured
- SSH access to the target Lagoon project

## Step-by-Step Procedure

### Step 1: Connect to Lagoon Environment

1. Open terminal
2. Connect to the target project's SSH environment:

   ```bash
   lagoon ssh -p [project] -e main
   ```

   Replace `[project]` with the actual project name

### Step 2: Create Archive of Files

Choose one of the following options based on your needs:

#### Option A: All Site Files

```bash
tar -cvzf /tmp/[project]_files.tar.gz /app/web/sites/default/files/
```

#### Option B: Drupal Modules Only

```bash
tar -cvzf /tmp/[project]_files_modules.tar.gz /app/web/sites/default/files/modules_local
```

Replace `[project]` with your project name for consistent naming.

### Step 3: Exit SSH Session

```bash
exit
```

Or use keyboard shortcut: `Ctrl + D`

### Step 4: Get SSH Connection String

1. Retrieve the SSH connection details:

   ```bash
   lagoon ssh -p [project] -e main --conn-string
   ```

2. Note the connection string format: `[project]-[environment]@[ip]`

### Step 5: Transfer Files Using SCP

1. Use SCP to copy the archive to your local machine:

   ```bash
   scp [project]-[environment]@[ip]:/tmp/[project]_files.tar.gz /tmp/
   ```

### Step 6: Extract Files Locally

1. Navigate to the temporary directory:

   ```bash
   cd /tmp
   ```

2. Extract the archive:

   ```bash
   tar -xzf [project]_files.tar.gz
   ```

### Step 7: Copy Files to Project

1. Navigate to your local project directory
2. Copy the necessary files to your project's `web/sites/default/files/` directory:

   ```bash
   cp -r /tmp/app/web/sites/default/files/* /path/to/your/project/web/sites/default/files/
   ```

## Example Walkthrough

For a project called "skanderborg":

```bash
# Step 1: Connect to SSH
lagoon ssh -p skanderborg -e main
```

```bash
# Step 2: Create archive (modules only)
tar -cvzf /tmp/skanderborg_files_modules.tar.gz /app/web/sites/default/files/modules_local

```bash
# Step 3: Exit SSH
exit

```bash
# Step 4: Get connection string
lagoon ssh -p skanderborg -e main --conn-string
```

```bash
# Step 5: Transfer files
scp skanderborg-main@ssh.lagoon.amazeeio.cloud:/tmp/skanderborg_files_modules.tar.gz/tmp/
```

```bash
# Step 6: Extract locally
cd /tmp
tar -xzf skanderborg_files_modules.tar.gz
```

```bash
# Step 7: Copy to project
cp -r /tmp/app/web/sites/default/files/modules_local/* ./web/sites/default/files/modules_local/
```

## Troubleshooting

### Issue: SSH Connection Failed

The `lagoon ssh`command fails occasionally. Usually it is in the ssh handshake
phase. Just run the command again until it succeeds.
