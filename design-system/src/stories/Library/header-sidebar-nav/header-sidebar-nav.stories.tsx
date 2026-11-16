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
