export const argTypes = {
  materialUnavailableTitleText: {
    description: "Title of the notice shown when a material has no actions",
    control: { type: "text" }
  },
  materialUnavailableDescriptionText: {
    description:
      "Description of the notice shown when a material has no actions. The link is appended after it",
    control: { type: "text" }
  },
  materialUnavailableCompactDescriptionText: {
    description:
      "Description of the compact notice shown when a manifestation has no actions",
    control: { type: "text" }
  },
  materialUnavailableLinkText: {
    description: "Link text of the notice shown when a material has no actions",
    control: { type: "text" }
  },
  materialUnavailableUrl: {
    description:
      "Url the patron is sent to when a material has no actions on the website",
    control: { type: "text" }
  }
};

export default {
  materialUnavailableTitleText:
    "The material is not available through the website",
  materialUnavailableDescriptionText:
    "Visit the library and get help from a librarian or check whether the material is available at",
  materialUnavailableCompactDescriptionText: "Contact the library for access",
  materialUnavailableLinkText: "Bibliotek.dk",
  materialUnavailableUrl: "https://bibliotek.dk"
};

export interface MaterialUnavailableNoticeArgs {
  materialUnavailableTitleText: string;
  materialUnavailableDescriptionText: string;
  materialUnavailableCompactDescriptionText: string;
  materialUnavailableLinkText: string;
  materialUnavailableUrl: string;
}
