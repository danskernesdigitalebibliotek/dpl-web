/**
 * @file
 * Replace the facets_date_range pair of date inputs with a single flatpickr
 * range picker. Mirrors the module's auto-submit by redirecting to the
 * drupalSettings URL template once a range is chosen.
 */
/* global flatpickr */
((Drupal, once) => {
  /**
   * Safely parse and validate a URL string before redirecting to prevent
   * XSS (javascript:) and Open Redirect vulnerabilities.
   * * @param {string} urlString - The unvalidated URL template string.
   */
  const safeRedirect = (urlString) => {
    try {
      // 1. Parse the URL (uses current origin as base if the path is relative)
      const targetUrl = new URL(urlString, window.location.origin);

      // 2. Prevent Javascript URIs (XSS protection)
      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        throw new Error('Unsafe URL protocol detected.');
      }

      // 3. Prevent Open Redirects (Ensure it stays on the same domain)
      if (targetUrl.origin !== window.location.origin) {
        throw new Error('External redirects are not allowed.');
      }

      // 4. Safe to execute redirect
      window.location.href = targetUrl.toString();
    } catch (error) {
      console.error('Redirection blocked:', error.message);
    }
  };

  Drupal.behaviors.novelDateRangeFacet = {
    attach(context, settings) {
      if (typeof flatpickr === 'undefined') {
        return;
      }

      const widgets = once(
        'novel-date-range-facet',
        '.facets-widget-date_range',
        context,
      );

      const that = this;

      widgets.forEach((widget) => {
        that.initWidget(widget, settings);
      });
    },

    initWidget(widget, settings) {
      const minInput = widget.querySelector(
        'input[data-type="date-range-min"]',
      );
      const maxInput = widget.querySelector(
        'input[data-type="date-range-max"]',
      );
      const list = widget.querySelector('ul');
      const facetId = list ? list.dataset.drupalFacetId : null;
      const daterangeSettings = settings.facets && settings.facets.daterange;
      const dateRange =
        facetId && daterangeSettings ? daterangeSettings[facetId] : null;

      if (!minInput || !maxInput || !facetId || !dateRange) {
        return;
      }

      const container = document.createElement('div');
      container.className = 'date-range-facet';

      const picker = document.createElement('input');
      picker.type = 'text';
      picker.className = 'date-range-facet__input';
      picker.placeholder = Drupal.t('All dates', {}, { context: 'dpl_event' });

      // Calendar icon shown while no range is selected.
      const icon = document.createElement('span');
      icon.className = 'date-range-facet__icon';
      icon.setAttribute('aria-hidden', 'true');

      // Clear button replacing the calendar icon while a range is active.
      const clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'date-range-facet__clear';
      clearButton.setAttribute(
        'aria-label',
        Drupal.t('Clear date range', {}, { context: 'dpl_event' }),
      );

      container.appendChild(picker);
      container.appendChild(icon);
      container.appendChild(clearButton);
      widget.insertBefore(container, widget.firstChild);

      [minInput, maxInput].forEach((input) => {
        const wrapper = input.closest('.form-item') || input;
        wrapper.hidden = true;
      });

      const setActive = (active) => {
        container.classList.toggle('date-range-facet--active', active);
      };

      const initial = [minInput.value, maxInput.value].filter(Boolean);

      const instance = flatpickr(picker, {
        mode: 'range',
        // Keep the underlying value as Y-m-d (matches the timestamp logic in
        // onClose) but show the Danish d.m.y format to the user.
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd.m.y',
        // Without this flatpickr names the visible input
        // "date-range-facet__input form-control input"; pin it so the
        // rendered field carries exactly the documented styling class.
        altInputClass: 'date-range-facet__input',
        // rangeSeparator lives on the locale; override it for the dash.
        locale: { rangeSeparator: ' – ' },
        defaultDate: initial.length ? initial : undefined,
        onChange(selectedDates) {
          setActive(selectedDates.length > 0);
        },
        onClose(selectedDates) {
          if (selectedDates.length !== 2) {
            return;
          }
          // Match facets_date_range's UTC-midnight timestamp semantics.
          const toUtcTs = (date) =>
            Date.parse(flatpickr.formatDate(date, 'Y-m-d')) / 1000;
          const min = toUtcTs(selectedDates[0]);
          const max = toUtcTs(selectedDates[1]);

          safeRedirect(
            dateRange.url
              .replace('__date_range_min__', min)
              .replace('__date_range_max__', max),
          );
        },
      });

      // Reflect the server-side active state on load.
      setActive(initial.length > 0);

      clearButton.addEventListener('click', () => {
        if (initial.length) {
          // The page is already filtered by this facet — reload without it.
          // Empty min/max is how facets_date_range expresses "no range".
          safeRedirect(
            dateRange.url
              .replace('__date_range_min__', '')
              .replace('__date_range_max__', ''),
          );
          return;
        }
        // Nothing applied yet: just reset the unsubmitted selection.
        instance.clear();
        setActive(false);
      });
    },

    // The events view uses AJAX (use_ajax: true), so the facet markup is
    // replaced on every filter interaction. flatpickr appends its calendar to
    // <body> (outside the replaced markup) and binds document-level listeners,
    // so without an explicit destroy each re-render would orphan a calendar and
    // stack a duplicate picker. Tear instances down before the markup is swapped.
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      context
        .querySelectorAll('.facets-widget-date_range .date-range-facet__input')
        .forEach((input) => {
          if (input._flatpickr) {
            input._flatpickr.destroy();
          }
        });
    },
  };
})(Drupal, once);
