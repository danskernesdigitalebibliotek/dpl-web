Drupal.behaviors.dpl_admin = {
  // eslint-disable-next-line no-unused-vars
  attach(context, settings) {
    const that = this;

    const dateTimeFields = context.querySelectorAll(
      '[type="date"][name$="[value][date]"]:not(.is-dpl-admin-range-initialized),' +
        '[type="time"][name$="[value][time]"]:not(.is-dpl-admin-range-initialized)'
    );

    dateTimeFields.forEach((input) => {
      input.classList.add("is-dpl-admin-range-initialized");
      that.dateRangeInit(input, context);
    });
  },

  // Set the start date as a default date for end date input fields.
  dateRangeInit(input, context) {
    const name = input.getAttribute("name");

    if (!name) {
      return;
    }

    // Create the name of the end date element based on the name of the start date element
    const endValueName = name.replace("[value]", "[end_value]");
    input.addEventListener("change", () => {
      // Recurring events/Drupal appears to insert the end value input using
      // AJAX after altering the start value, despite the input already
      // existing. We cant really listen for that, so we'll do a poor-mans
      // event listener: waiting a second, and then looking up for the end
      // value input.
      setTimeout(() => {
        const endValueInput = context.querySelector(`[name="${endValueName}"]`);
        endValueInput.value = endValueInput.value || input.value;
      }, 1000);
    });
  },
};
