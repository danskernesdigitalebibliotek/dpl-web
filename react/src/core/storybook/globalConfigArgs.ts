export const argTypes = {
  errorMessagesConfig: {
    description: "Configuration for error messages behaviour",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: {
        summary:
          '{"containerId":"dpl-react-apps-error-messages","shouldOnlyShowOneError":true,"showCloseButton":true}'
      }
    }
  },
  agencyConfig: {
    description: "The site's own agency id",
    control: { type: "text" },
    table: {
      type: { summary: "text" },
      defaultValue: { summary: '{"id":"710100"}' }
    }
  }
};

export default {
  errorMessagesConfig:
    '{"containerId":"dpl-react-apps-error-messages","shouldOnlyShowOneError":true,"showCloseButton":true}',
  agencyConfig: '{"id":"710100"}'
};

export interface GlobalConfigProps {
  errorMessagesConfig: string;
  agencyConfig: string;
}
