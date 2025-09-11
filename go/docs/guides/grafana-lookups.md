# Grafana Lookups Runbook

## Overview

This runbook describes the various Grafana queries that can be used in order to
identify errors or troubleshoot things gone wrong.

## Synchronisation problems between BNF (Delingstjenesten) and library sites

### See all bnf actions on a specific library sites filtered by UUID

If you want to see what happened to a certain piece of conntent you can filter
it like this:

```logql
{app="cli-persistent", namespace="herning-main"} | json | subtype = `bnf` | message =~ `.*9dfc9d54-7087-41d5-ae11-469aa003c262.*`
```

[Grafana link](https://grafana.lagoon.dplplat01.dpl.reload.dk/explore?schemaVersion=1&panes=%7B%22yg0%22%3A%7B%22datasource%22%3A%22P8E80F9AEF21F6940%22%2C%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22datasource%22%3A%7B%22type%22%3A%22loki%22%2C%22uid%22%3A%22P8E80F9AEF21F6940%22%7D%2C%22editorMode%22%3A%22builder%22%2C%22expr%22%3A%22%7Bapp%3D%5C%22cli-persistent%5C%22%2C+namespace%3D%5C%22herning-main%5C%22%7D+%7C+json+%7C+subtype+%3D+%60bnf%60+%7C+message+%3D%7E+%60.*9dfc9d54-7087-41d5-ae11-469aa003c262.*%60%22%2C%22queryType%22%3A%22range%22%7D%5D%2C%22range%22%3A%7B%22from%22%3A%221754892000000%22%2C%22to%22%3A%221754985600000%22%7D%7D%7D&orgId=1)

## Cache Revalidation Monitoring

### Track revalidation of specific piece of content on a specific site

If you want to see if a library site sent a revalidation requests to its Go site,
you can query like this:

```logql
{namespace="ingress-nginx"} | json | path = `/cache/revalidate` | request_query =~ `^tags=node%3A1192.*` | vhost=`www.go.herningbib.dk`
```

[Grafana Link](https://grafana.lagoon.dplplat01.dpl.reload.dk/explore?schemaVersion=1&panes=%7B%22yg0%22%3A%7B%22datasource%22%3A%22P8E80F9AEF21F6940%22%2C%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22datasource%22%3A%7B%22type%22%3A%22loki%22%2C%22uid%22%3A%22P8E80F9AEF21F6940%22%7D%2C%22editorMode%22%3A%22builder%22%2C%22expr%22%3A%22%7Bnamespace%3D%5C%22ingress-nginx%5C%22%7D+%7C+json+%7C+path+%3D+%60%2Fcache%2Frevalidate%60+%7C+request_query+%3D%7E+%60%5Etags%3Dnode%253A1192.*%60+%7C+vhost%3D%60www.go.herningbib.dk%60%22%2C%22queryType%22%3A%22range%22%7D%5D%2C%22range%22%3A%7B%22from%22%3A%221754884594000%22%2C%22to%22%3A%221754924194000%22%7D%7D%7D&orgId=1)

Note:
In the near future it will be possible to follow the UUID as a cache tag as well,
when the feature has been merged.

### All graphql requests sent to a specific library site

If you want to track all graphql requests sent from Go to a specific library site,
you can query like this:

```logql
{namespace="ingress-nginx"} | json | path = `/graphql` | http_user_agent = `node` | vhost=`nginx.main.silkeborg.dplplat01.dpl.reload.dk`
```

[Grafana Link](https://grafana.lagoon.dplplat01.dpl.reload.dk/explore?schemaVersion=1&panes=%7B%22an3%22%3A%7B%22datasource%22%3A%22P8E80F9AEF21F6940%22%2C%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22datasource%22%3A%7B%22type%22%3A%22loki%22%2C%22uid%22%3A%22P8E80F9AEF21F6940%22%7D%2C%22editorMode%22%3A%22builder%22%2C%22expr%22%3A%22%7Bnamespace%3D%5C%22ingress-nginx%5C%22%7D+%7C+json+%7C+path+%3D+%60%2Fgraphql%60+%7C+http_user_agent+%3D+%60node%60+%7C+vhost%3D%60nginx.main.silkeborg.dplplat01.dpl.reload.dk%60%22%2C%22queryType%22%3A%22range%22%7D%5D%2C%22range%22%3A%7B%22from%22%3A%22now-5m%22%2C%22to%22%3A%22now%22%7D%7D%7D&orgId=1)

### Follow build process of a site being deployed

The Lagoon deployment UI is ok. But if you want to keep track of everything
happening in the deployment process you can query like this:

```logql
{namespace="dpl-cms-pr-1707", container="lagoon-build"}
```

[Grafana Link](https://grafana.lagoon.dplplat01.dpl.reload.dk/explore?schemaVersion=1&panes=%7B%22afu%22%3A%7B%22datasource%22%3A%22P8E80F9AEF21F6940%22%2C%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22datasource%22%3A%7B%22type%22%3A%22loki%22%2C%22uid%22%3A%22P8E80F9AEF21F6940%22%7D%2C%22editorMode%22%3A%22builder%22%2C%22expr%22%3A%22%7Bnamespace%3D%5C%22dpl-cms-pr-1707%5C%22%2C+container%3D%5C%22lagoon-build%5C%22%7D%22%2C%22queryType%22%3A%22range%22%7D%5D%2C%22range%22%3A%7B%22from%22%3A%22now-5m%22%2C%22to%22%3A%22now%22%7D%7D%7D&orgId=1)

## General Query Patterns

### Label Selectors

- `{app="...", namespace="..."}` - Target specific applications in specific namespaces
- `{namespace="...", container="..."}` - Target specific containers within a namespace

### Log Processing

- `| json` - Parse JSON-formatted log entries
- `| message =~ "pattern"` - Filter by message content using regex
- `| path = "/endpoint"` - Filter by HTTP path
- `| http_user_agent = "agent"` - Filter by user agent
- `| vhost="domain"` - Filter by virtual host
