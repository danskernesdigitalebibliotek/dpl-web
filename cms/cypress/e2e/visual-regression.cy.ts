/**
 * Visual regression tests for the CMS.
 *
 * Captures screenshots of key pages at mobile and desktop viewports
 * and compares them against baseline snapshots. Pages match the
 * Lighthouse test URLs from .lighthouserc.js.
 *
 * Run: task ci:cypress:visual-regression
 * Update baselines: task ci:cypress:visual-regression:update
 */

const pages = [
  {
    name: 'search-results',
    url: '/search?q=harry+potter&x=0&y=0',
  },
  {
    name: 'work-detail',
    url: '/work/work-of:870970-basis:25245784?type=bog',
  },
  {
    name: 'articles',
    url: '/articles',
  },
  {
    name: 'branches',
    url: '/branches',
  },
  {
    name: 'example-article',
    url: '/by_uuid/node/dac275e4-9b8c-4959-a13a-6b9fdbc1f6b0',
  },
  {
    name: 'contact-page',
    url: '/by_uuid/node/d50683cc-8011-49ba-a6ea-82e56de97b80',
  },
];

const viewports: { name: string; width: number; height: number }[] = [
  { name: 'mobile', width: 400, height: 900 },
  { name: 'desktop', width: 1200, height: 900 },
];

describe('Visual regression', () => {
  viewports.forEach(({ name: vpName, width, height }) => {
    describe(`${vpName} (${width}px)`, () => {
      pages.forEach(({ name, url }) => {
        it(`${name}`, () => {
          cy.viewport(width, height);
          cy.visit(url);
          // Allow async content (React apps, images) to settle.
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(2000);
          cy.matchImageSnapshot(`${name}-${vpName}`);
        });
      });
    });
  });
});
