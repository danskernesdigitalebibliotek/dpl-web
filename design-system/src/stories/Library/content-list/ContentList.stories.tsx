import { Meta, StoryFn } from "@storybook/react-webpack5";
import ContentList from "./ContentList";
import ContentListData from "./ContentListData";
import { ContentListItem } from "../content-list-item/ContentListItem";

export default {
  title: "Library / Content List",
  component: ContentList,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=7527-54179&mode=dev",
    },
    layout: "fullscreen",
  },
} as Meta<typeof ContentList>;
const Template: StoryFn<typeof ContentList> = (args) => (
  <ContentList {...args} />
);

export const Default = Template.bind({});

Default.args = {
  items: ContentListData,
};

// Month separators as shown in the events overview. In the CMS these are
// inserted by content-list-month-separator.js; this story renders the resulting
// markup directly to document the separator styling and target markup.
const withMonthSeparatorsItems = ContentListData.map((item, index) => ({
  ...item,
  // Spread items across three months so the separators are visible.
  monthLabel: ["juli", "august", "september"][
    Math.floor((index / ContentListData.length) * 3)
  ],
}));

export const WithMonthSeparators: StoryFn<typeof ContentList> = () => {
  let lastMonth: string | null = null;
  let isFirstSeparator = true;

  return (
    // The wrapper dissolves the <ul> with `display: contents` so the sticky
    // separators pin across paged lists; the explicit list role restores the
    // semantics that dissolving strips, and the separators are aria-hidden
    // because each event's own date already carries the month.
    <div className="content-list-month-wrapper">
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles --
          the "redundant" role is the point: `display: contents` strips the
          <ul>'s implicit list semantics in some screen readers. */}
      <ul className="content-list" role="list">
        {withMonthSeparatorsItems.flatMap((item, index) => {
          const nodes = [];

          if (item.monthLabel !== lastMonth) {
            nodes.push(
              <li
                key={`separator-${index}`}
                className={
                  isFirstSeparator
                    ? "content-list__month-separator content-list__month-separator--first"
                    : "content-list__month-separator"
                }
                aria-hidden="true"
              >
                {item.monthLabel}
              </li>,
            );
            lastMonth = item.monthLabel;
            isFirstSeparator = false;
          }

          nodes.push(
            <li
              key={index}
              className="content-list__item"
              data-content-list-month={item.monthLabel}
            >
              <ContentListItem {...item} />
            </li>,
          );

          return nodes;
        })}
      </ul>
    </div>
  );
};
