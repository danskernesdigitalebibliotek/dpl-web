# Lagoon Environment Variables Runbook

## Overview

This runbook provides instructions for retrieving and managing environment
variables for Lagoon projects using the Lagoon CLI.
This is essential for debugging configuration issues or setting up local
development environments.

## When to Use This Runbook

- Debugging environment-specific configuration issues
- Setting up local development environment to match production
- Verifying environment variable values

## Prerequisites

- Lagoon CLI installed and configured
- Valid authentication with Lagoon platform

## Step-by-Step Procedure

### Step 1: List Environment Variables

1. Open terminal
2. Run the following command to retrieve environment variables:

   ```bash
   lagoon list variables -p [PROJECT_NAME] --reveal
   ```

   Replace `[PROJECT_NAME]` with the actual project name

### Step 2: Review Output

1. The command will display all environment variables for the project
2. Variables will be shown with their actual values (due to `--reveal` flag)

## Examples

### Basic Usage

If you need to check variables across multiple projects:

```bash
# Check pr environment variables
lagoon list variables -p dpl-cms --reveal
```

Or a specific environment:

```bash
# Check kobenhavn production (main) environment
lagoon list variables -p kobenhavn -e main --reveal
```
