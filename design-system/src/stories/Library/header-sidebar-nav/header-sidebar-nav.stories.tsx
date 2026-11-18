import { Meta, StoryFn } from "@storybook/react-webpack5";

import HeaderSidebarNav, { HeaderSidebarNavProps } from "./header-sidebar-nav";
import { menuItems } from "../header-menu-list/HeaderMenuListData";

export default {
  title: "Library / Header Sidebar Nav",
  component: HeaderSidebarNav,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=1354-8717&mode=design&t=FVZ4DJ3kACnnV4jO-4",
    },
  },
  argTypes: {
    menuLinks: {
      table: {
        category: "Content",
      },
      description: "The links of the menu",
      control: { type: "object" },
    },
  },
  args: {
    menuLinks: menuItems,
  },
} as Meta<typeof HeaderSidebarNav>;

// The id is what header-sidebar-nav-js.js opens the menu from, like the
// burger button in the header.
const Template: StoryFn<typeof HeaderSidebarNav> = (
  args: HeaderSidebarNavProps,
) => (
  <>
    <button
      type="button"
      id="header-sidebar-nav__toggle"
      aria-controls="sidebarNav"
      aria-expanded="false"
    >
      Open menu
    </button>
    <HeaderSidebarNav {...args} />
  </>
);

export const Default = Template.bind({});

// Lets Argos and axe cover the open menu. Opens it the way the toggle does:
// header-sidebar-nav-js.js binds once per page, and Storybook switches stories
// without a reload, so clicking the toggle here may do nothing.
export const Open = Template.bind({});
Open.play = async ({ canvasElement }) => {
  const dialog = canvasElement.querySelector("dialog");
  const toggle = canvasElement.querySelector("#header-sidebar-nav__toggle");
  if (!dialog || !toggle) {
    throw new Error("The story is missing the sidebar menu or its toggle.");
  }
  dialog.showModal();
  toggle.setAttribute("aria-expanded", "true");
  // axe doesn't wait for the slide-in to finish.
  await Promise.allSettled(
    dialog
      .getAnimations({ subtree: true })
      .map((animation) => animation.finished),
  );
};
