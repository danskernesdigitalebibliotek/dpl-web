/**
 * @file
 * Handles Mapp tracking in the browser.
 */

(function dplMapp(once) {
  const pushEvent = function pushEvent(eventId, eventData) {
    console.debug('DPL Mapp: Pushing %s event %o', eventId, eventData);

    // Ensure that the Mapp object is defined before pushing event.
    if (typeof window.wts !== 'undefined') {
      window.wts.push(['send', eventId, eventData]);
    }
  };

  Drupal.behaviors.dpl_mapp = {
    attach(context) {
      // Send Mapp events attached through the HTML.
      once('js-dpl-mapp', '.js-dpl-mapp', context).forEach(
        function elementHandler(el) {
          el.addEventListener('click', function clickHandler() {
            const eventId = this.dataset.dplMappEventId || 'click';
            const eventDataString = this.dataset.dplMappEventData;
            let eventData = {};
            try {
              eventData = JSON.parse(eventDataString);
            } catch (e) {
              console.debug(
                'DPL Mapp: Event data not recognized as JSON: %s',
                eventDataString,
              );
            }

            pushEvent(eventId, eventData);
          });
        },
      );
    },
  };
})(once);
