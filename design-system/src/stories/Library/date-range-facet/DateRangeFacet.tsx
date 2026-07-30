// Import default styling
import "flatpickr/dist/flatpickr.css";
import flatpickr from "flatpickr";
import { english } from "flatpickr/dist/l10n/default";
import { Danish } from "flatpickr/dist/l10n/da";
import { Instance } from "flatpickr/dist/types/instance";
import { BaseOptions } from "flatpickr/dist/types/options";
import { FC, useCallback, useRef, useState } from "react";

export type DateRangeFacetProps = {
  placeholder?: string;
  locale?: "en" | "da";
  // Pre-selected range, as Y-m-d strings: [from, to].
  defaultDate?: string[];
};

// Single flatpickr range picker, mirroring the CMS theme's
// date-range-facet.js behaviour: one readonly text input that opens a
// range calendar formatted as Y-m-d. While a range is selected the calendar
// icon is replaced by a clickable clear button.
const DateRangeFacet: FC<DateRangeFacetProps> = ({
  placeholder = "All dates",
  locale = "en",
  defaultDate,
}) => {
  const picker = useRef<Instance | null>(null);
  const [isActive, setIsActive] = useState(false);

  const pickerRef = useCallback(
    (node: Node | null) => {
      if (node === null) {
        // Detached/unmounted: destroy the instance so flatpickr removes its
        // body-appended calendar and document listeners instead of leaking.
        picker.current?.destroy();
        return;
      }

      const options: Partial<BaseOptions> = {
        mode: "range",
        // Keep the underlying value as Y-m-d (parses defaultDate, matches the
        // CMS timestamp logic) but show the Danish d.m.y format to the user.
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d.m.y",
        // Pin the visible (alt) input's class; otherwise flatpickr appends
        // " form-control input", and the authored markup below would not match
        // the rendered DOM that consumers copy from the Storybook HTML tab.
        altInputClass: "date-range-facet__input",
        // rangeSeparator lives on the locale; override it for the dash.
        locale: {
          ...(locale === "en" ? english : Danish),
          rangeSeparator: " – ",
        },
        defaultDate,
        onChange: (selectedDates) => setIsActive(selectedDates.length > 0),
      };

      picker.current = flatpickr(node, options);
      // Reflect any pre-selected range in the active state.
      setIsActive(picker.current.selectedDates.length > 0);
    },
    [locale, defaultDate],
  );

  const handleClear = () => {
    picker.current?.clear();
    setIsActive(false);
  };

  const className = isActive
    ? "date-range-facet date-range-facet--active"
    : "date-range-facet";

  return (
    <div className={className}>
      <input
        ref={pickerRef}
        type="text"
        readOnly
        className="date-range-facet__input"
        placeholder={placeholder}
      />
      <span className="date-range-facet__icon" aria-hidden="true" />
      <button
        type="button"
        className="date-range-facet__clear"
        aria-label="Clear date range"
        onClick={handleClear}
      />
    </div>
  );
};

export default DateRangeFacet;
