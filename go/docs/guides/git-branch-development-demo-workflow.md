# Runbook: Git Branch Strategy and workflow for Development and Demoing

## Overview

This runbook documents the feature development and demoing  Git workflow for
the GO project, including branch creation, pull request process, tagging,
and deployment procedures for testing environments.

## When to Use This Runbook

- Starting work on a new feature or bug fix
- Creating releases for customer testing
- Deploying to test environments (playground, demo)
- Managing feature integration back to develop branch

## Prerequisites

- Access to GO repository
- JIRA access for ticket creation/management
- Access to DPL-CMS repository for deployment coordination
- Lagoon CLI access for manual deployments
- Understanding of Git branching workflows

## Workflow Overview

1. Create JIRA task
2. Create feature branch
3. Develop
4. Create PR
5. Create release tag
6. Update DPL-CMS

## Step-by-Step Procedure

### Step 1: Create JIRA Task

1. Navigate to JIRA project
2. Create a new task with format: `DDF-[number]-[brief-description]`
3. Fill in task details and acceptance criteria
4. Assign to appropriate developer

**Example**: `DDF-123-test-issue`

### Step 2: Create Feature Branch

1. Ensure you're on the latest develop branch:

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create new feature branch from develop:

   ```bash
   git checkout -b DDF-123-test-issue
   ```

3. Push the new branch to remote:

   ```bash
   git push -u origin DDF-123-test-issue
   ```

### Step 3: Develop Feature

1. Implement the feature or fix
2. Make regular commits with descriptive messages
3. Follow existing code patterns and conventions
4. Ensure code quality and testing standards

### Step 4: Create Pull Request

1. Push final changes to feature branch:

   ```bash
   git push origin DDF-123-test-issue
   ```

2. Create pull request from feature branch to `develop`
3. Fill in PR description with:
   - Link to JIRA ticket
   - Description of changes
   - Testing instructions
   - Any breaking changes or considerations

4. Request code review from team members
5. Wait for PR approval

### Step 5: Create Release Tag for Testing

After PR approval, create a release tag for customer testing:

1. **Tag Naming Convention**: `[environment]-[year][month][day].[sequence_number]`

   **Available Test Environments:**
   - `playground` - Playground testing environment
   - `demo` - Demo testing environment

2. **Create the tag** from your feature branch:

   ```bash
   git tag playground-20250829.1
   git push origin playground-20250829.1
   ```

   **Examples:**
   - `demo-20250701.1`
   - `playground-20250701.1`
   - `playground-20250701.2` (if second release same day)

### Step 6: Update DPL-CMS with Release Tag

1. Navigate to DPL-CMS repository
2. Switch to the appropriate environment branch:
   - For playground: `dpl-go-reload-playground`
   - For demo: `dpl-go-demo`

3. Open `node.dockerfile`
4. Update the `dpl-go-node` version number with your release tag
5. Commit and push the change:

   ```bash
   git add node.dockerfile
   git commit -m "Update dpl-go-node to [tag-name]"
   git push origin [environment-branch]
   ```
