import React from "react";
import FullCalendar, { CalendarRef } from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import da from "@fullcalendar/react/locales/da";

import classicThemePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import OpeningHoursEditorEventContent from "./OpeningHoursEditorEventContent";
import useOpeningHoursEditor from "./useOpeningHoursEditor";
import DialogFormEdit from "./DialogFormEdit";
import Dialog from "../../components/dialog/Dialog";
import useDialog from "../../components/dialog/useDialog";
import DialogFormAdd from "./DialogFormAdd";
import { OpeningHoursCategoriesType } from "./types";
import { useConfig } from "../../core/utils/config";
import { useText } from "../../core/utils/text";
import watchIcon from "@danskernesdigitalebibliotek/dpl-design-system/build/icons/basic/icon-watch-static.svg";

export type OpeningHoursEditorType = {
  initialDate?: Date;
};

const OpeningHoursEditor: React.FC<OpeningHoursEditorType> = ({
  initialDate
}) => {
  // OpeningHoursEditorEventContent cannot be rendered as a standard component,
  // thus preventing the use of useText hook within it.
  const t = useText();
  const iconAltText = t("openingHoursRepeatedIconAltText");
  const config = useConfig();
  const openingHoursCategories = config<OpeningHoursCategoriesType[]>(
    "openingHoursEditorCategoriesConfig",
    {
      transformer: "jsonParse"
    }
  );

  const fullCalendarRef = React.useRef<CalendarRef>(null);
  const fullCalendarApi = fullCalendarRef.current?.getApi();

  const {
    events,
    handleEventAdd,
    handleEventEditing,
    handleEventRemove,
    handleDatesSet,
    isLoading
  } = useOpeningHoursEditor();

  const { dialogContent, openDialogWithContent, closeDialog, dialogRef } =
    useDialog({
      onClose: () => {
        if (fullCalendarApi) fullCalendarApi.unselect();
      }
    });

  return (
    <>
      <Dialog closeDialog={closeDialog} ref={dialogRef}>
        {dialogContent}
      </Dialog>

      {isLoading && (
        <div className="opening-hours-editor__loading">
          <img src={watchIcon} alt="" />

          <h1>{t("openingHoursLoadingText")}</h1>
        </div>
      )}

      {/* The wrapper is used by our Cypress tests to scope calendar assertions. */}
      <div data-cy="opening-hours-editor">
        <FullCalendar
          initialDate={initialDate ?? undefined}
          ref={fullCalendarRef}
          plugins={[
            classicThemePlugin,
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin
          ]}
          // FullCalendar generates hashed CSS class names, and its toolbar
          // buttons are only identifiable by their localised aria-label, so we
          // attach our own stable class for the Cypress tests to target. The
          // calendar grid itself needs no such hook: FullCalendar renders
          // native `data-date`, `data-time` and `aria-current` attributes.
          buttonClass={({ name }) => `js-opening-hours-editor-button-${name}`}
          headerToolbar={{
            left: "dayGridMonth,timeGridWeek",
            center: "title",
            right: "prev,next today"
          }}
          initialView="timeGridWeek"
          views={{
            timeGridWeek: {
              // Ensure that the week view shows the correct
              // date range format (e.g. "17. - 23. aug. 2026").
              titleFormat: { year: "numeric", month: "short", day: "numeric" }
            }
          }}
          locale={da}
          selectable={!isLoading}
          select={
            isLoading
              ? undefined
              : (selectedEventInfo) =>
                  openDialogWithContent(
                    <DialogFormAdd
                      selectedEventInfo={selectedEventInfo}
                      handleEventAdd={handleEventAdd}
                      openingHoursCategories={openingHoursCategories}
                      closeDialog={closeDialog}
                    />
                  )
          }
          unselectAuto={false}
          eventClick={
            isLoading
              ? undefined
              : (clickInfo) =>
                  openDialogWithContent(
                    <DialogFormEdit
                      eventInfo={clickInfo.event}
                      handleEventEditing={handleEventEditing}
                      handleEventRemove={handleEventRemove}
                      openingHoursCategories={openingHoursCategories}
                      closeDialog={closeDialog}
                    />
                  )
          }
          eventContent={(eventInput) => (
            <OpeningHoursEditorEventContent
              eventInput={eventInput}
              iconAltText={iconAltText}
            />
          )}
          events={events}
          height="auto"
          // Ensures that the calendar stays compact when
          // switching to the month view. Larger numbers
          // for `aspectRatio` makes smaller heights.
          viewDidMount={(view) => {
            if (view.view.type === "dayGridMonth") {
              fullCalendarApi?.setOption("aspectRatio", 3);
            }
          }}
          selectMirror
          allDaySlot={false}
          datesSet={handleDatesSet}
        />
      </div>
    </>
  );
};

export default OpeningHoursEditor;
