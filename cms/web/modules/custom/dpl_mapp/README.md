# Introduction

This module integrates Drupal with the [Mapp Intelligence system](https://documentation.mapp.com/1.0/en/intelligence-5210292.html).

# Requirements

Usage of this module requires that you have a Mapp Intelligence account for your
website.

# Instalation

1. Activate module the way you would do with a standard Drupal module.
2. Configure your Mapp account at `/admin/config/system/dpl-mapp`.

# Usage

The module supports three forms of integration once the module is loaded.

## Automatic page tracking

All page views are tracked automatically.

## Direct usage

A `wts` variable is available in the global scope. This can be used to
[send manual tracking requests](https://documentation.mapp.com/1.0/en/how-to-send-manual-tracking-requests-page-updates-7240681.html)
by pushing events etc.

## DOM integration

The module provides integration with the DOM based on classes used on specific
elements. If an element has the `js-dpl-mapp` class is clicked then an event
will be pushed to Mapp with event id matching the value of the HTML data
attribute `dpl-mapp-event-id` and data corresponding JSON within the
`dpl-mapp-event-data` data attribute. None of these attributes are required.

### Example

Clicking the button below will push an event to Mapp with the id `subscribe` and
the data `{ newsletterId: "local-news" }`

```html
 <button class="js-dpl-mapp"
         data-dpl-mapp-event-id="subscribe"
         data-dpl-mapp-event-data="{
            &quot;newsletterId&quot;: &quot;local-news&quot;
         }" >
  Subscribe to newsletter
</button>
```

# Troubleshooting

## Console logging

The module will log events pushed through the DOM integration to the browser
console where they can be inspected.
