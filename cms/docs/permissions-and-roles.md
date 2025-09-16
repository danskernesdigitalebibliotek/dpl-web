# Permissions and roles

'mediator':

* For users who frequently create dynamic content on the website.
* Can create and edit events, articles, pages, and campaigns in
  /admin/content.

'editor':

* For users who, in addition to content creation, are responsible for
  static content (e.g., opening hours) and the site's structure.
* Can coordinate and manage the work of mediators.
* Has access to the same as mediator plus all content types in
  /admin/content, as well as taxonomy and menus in /admin/structure.

'local_administrator':

* For users who need to configure the website in terms of settings,
  appearance, integrations, general information, library usage, etc.
* Has access to the same as editor plus the site's configuration
  options in /admin/config, user creation in /admin/people, and
  changing the site's appearance in /admin/appearance.
* This is the role assigned to trusted users on regular libraries.

'administrator':

* Can modify the site beyond the CMS's standard settings, e.g., by
  enabling and disabling modules.
* Has access to everything in the CMS.
* This is the role assigned to trusted users on webmaster libraries.
