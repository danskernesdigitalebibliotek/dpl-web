export const argTypes = {
  useBiblioAdapterConfig: {
    description: "Use the Biblio adapter instead of Publizon (feature flag)",
    control: { type: "text" }
  }
};

export default {
  useBiblioAdapterConfig: "0"
};

export interface BiblioAdapterArgs {
  useBiblioAdapterConfig: string;
}
