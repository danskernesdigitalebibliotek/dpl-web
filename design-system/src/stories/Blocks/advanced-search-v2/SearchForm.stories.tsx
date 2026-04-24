import { StoryFn, Meta } from "@storybook/react-webpack5";
import SearchForm from "./SearchForm";

export default {
  title: "Blocks / Advanced Search v2 / Form",
  component: SearchForm,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SearchForm>;

const Template: StoryFn<typeof SearchForm> = () => (
  <div className="search">
    <div className="search__title-bar">
      <div className="search__header">
        <h1 className="search__header__title">Avanceret søgning</h1>
      </div>
      <a
        href="/advanced-search?advancedSearchCql=*"
        className="search__cql-link"
      >
        CQL-søgning
      </a>
    </div>
    <SearchForm />
  </div>
);

export const Default = Template.bind({});
