(function dplReact(Drupal) {
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

  // Simplified port of jQuery DOMEval to vanilla JS.
  // https://github.com/jquery/jquery/blob/3.6.0/src/core/DOMEval.js
  const DOMEval = function DOMEval(code) {
    const doc = document;
    const script = doc.createElement("script");
    script.text = code;
    doc.head.appendChild(script).parentNode.removeChild(script);
  };

  Drupal.behaviors.dplReactHandler = {
    attach(context) {

      // TODO: Slet denne igen
      document.addEventListener("click", function () {
        test = TEST_THIS_IS_NOT_DEFINED_EITHER;
      });
      const test = TEST_THIS_IS_NOT_DEFINED;

      const element = getElement(context);
      if (element) {
        // Port jQuery.ajax with dataType script to vanilla JS with Fetch API.
        fetch("/dpl-react/user-tokens", {
          headers: {
            Accept:
              "text/javascript, application/javascript, " +
              "application/ecmascript, application/x-ecmascript",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `HTTP error response: ${response.status} - ${response.statusText}`
              );
            }
            return response.text();
          })
          .then((response) => {
            DOMEval(response);
            window.dplReact.mount(element);
          });
      }
    },
    detach(context) {
      const element = getElement(context);
      if (element) {
        window.dplReact.unmount(element);
      }
    },
  };
})(Drupal);
