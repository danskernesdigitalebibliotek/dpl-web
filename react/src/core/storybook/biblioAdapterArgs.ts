export const argTypes = {
  useBiblioAdapterConfig: {
    description: "Use the Biblio adapter instead of Publizon (feature flag)",
    control: { type: "text" }
  },
  biblioTolerateUnknownMaterialsConfig: {
    description:
      "TEMPORARY: render a material the adapter answers 404 for as " +
      "unavailable instead of failing the page",
    control: { type: "text" }
  }
};

export default {
  useBiblioAdapterConfig: "0",
  biblioTolerateUnknownMaterialsConfig: "0"
};

export interface BiblioAdapterArgs {
  useBiblioAdapterConfig: string;
  biblioTolerateUnknownMaterialsConfig: string;
}
