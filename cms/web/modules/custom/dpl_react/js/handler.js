(function dplReact(Drupal, $) {
  // Behaviors might be called with a DOM element (document on page
  // load) or a jQuery object (on AJAX load). DPL React expects a DOM
  // element with querySelectorAll, so this tries to do the right
  // thing.
  const getElement = function getElement(element) {
    if (typeof element.querySelectorAll !== "function") {
      element = element[0] || element;
    }

    if (typeof element.querySelectorAll !== "function") {
      return null;
    }

    return element;
  };

  Drupal.behaviors.dplReactHandler = {
    attach(context) {
      const element = getElement(context);
      if (element) {
        $.ajax({
          url: "/dpl-react/user-tokens",
          dataType: "script",
          cache: true,
          success() {
            window.dplReact.mount(element);
          }
        });
      }
    },
    detach(context) {
      const element = getElement(context);
      if (element) {
        window.dplReact.unmount(element);
      }
    }
  };
})(Drupal, jQuery);
