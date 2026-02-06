#Novel Theme Documentation

## How is the theme set up to use dpl-design-system assets

The Novel theme is set up to use dpl-design-system assets by requiring it as a
package in ```composer.json```. The assets consist of javascript files, css
styles and icons and are installed within the custom Novel theme in an "assets"
folder.

You can find the ```dist.zip``` file with the latest assets (or different tags)
under ["Releases" on the github repo](https://github.com/danskernesdigitalebibliotek/dpl-design-system/releases).
The latest release is getting rebuild on merge to the main branch, and the
tag-release points to a specific commit.

### Styling and base.css

The ```base.css``` file consists of all the ```scss``` styling from
dpl-design-system transpiled into one file.

It includes typography, colors, spacing, and styling of all the components.

The file is loaded on all pages by adding it to the ```base``` library in
```novel.libraries.yml```.

### How to implement a component from dpl-design-system

Find the component you would like to implement in the dpl-design-system
Storybook, eg. the [Button component](https://danskernesdigitalebibliotek.github.io/dpl-design-system/?path=/story/atoms-button--default).

In Storybook, copy the markup for the component from the HTML tab in the addons
panel and paste it to either a new or existing twig file in your project. Use
the markup from the Storybook HTML tab as a starting point to implement a
component.

Be aware that a component can have different states, like the Button, and
therefore different classes/markup for each state.

If the component includes an icon, you will have to change the ```src``` path
for it to look in the ```assets/dpl-design-system/icons/``` folder.

#### Include JS for components

If a component uses JS, you must consider if it is a global feature like the
"Header" or "Accordion" component which should be loaded on every page, or if it
is component-specific JS, that should be loaded only when the component is
shown.

The global JS should be included in the ```base``` library in
```novel.libraries.yml``` file.

The component-specific JS should also be included in the
```novel.libraries.yml``` file, but as a separate library.

It is possible to load the JS libraries with either attaching it to a render
array, or attach it in the twig file that should use it.
