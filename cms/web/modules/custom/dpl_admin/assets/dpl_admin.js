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

  // A helper function, adding X minutes to a time string ("14:15" => "14:30").
  addMinutesToTime(timestring, minutesToAdd) {
    // Parse the input time string
    const [hours, minutes] = timestring.split(":").map(Number);

    // Convert hours and minutes to minutes and add 15 minutes
    const totalMinutes = hours * 60 + minutes + minutesToAdd;

    // Calculate the new hours and minutes, taking care to wrap correctly
    // Use modulo 24 for hours to wrap at 24 hours
    const newHours = Math.floor(totalMinutes / 60) % 24;

    // Use modulo 60 for minutes to wrap at 60 minutes
    const newMinutes = totalMinutes % 60;

    // Format the new time as HH:MM, padding with zeroes if necessary
    const formattedHours = newHours.toString().padStart(2, "0");
    const formattedMinutes = newMinutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  },

  // Set the start date as a default date for end date input fields.
  dateRangeInit(input, context) {
    const that = this;
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
        let inputValue = input.value;

        if (name.includes("[time]")) {
          inputValue = that.addMinutesToTime(inputValue, 60);
        }

        const endValueInput = context.querySelector(`[name="${endValueName}"]`);
        endValueInput.value = endValueInput.value || inputValue;
      }, 1000);
    });
  },
};
