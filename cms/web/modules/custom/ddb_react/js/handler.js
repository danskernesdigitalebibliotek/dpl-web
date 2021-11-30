(function ddbReact(Drupal, $) {
  // Behaviors might be called with a DOM element (document on page
  // load) or a jQuery object (on AJAX load). DDB React expects a DOM
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

  Drupal.behaviors.ddbReactHandler = {
    attach(context) {
      const element = getElement(context);
      if (element) {
        $.ajax({
          url: "/ddb-react/user-tokens",
          dataType: "script",
          cache: true,
          success() {
            window.ddbReact.mount(element);
          }
        });
      }
    },
    detach(context) {
      const element = getElement(context);
      if (element) {
        window.ddbReact.unmount(element);
      }
    }
  };
})(Drupal, jQuery);
