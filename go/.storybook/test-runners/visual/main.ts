import config from "../../main"

// test-storybook resolves the story globs against this directory, so point
// them back at go's sources.
const visualConfig = {
  ...config,
  stories: (config.stories as string[]).map(glob => `../../${glob}`),
}

export default visualConfig
