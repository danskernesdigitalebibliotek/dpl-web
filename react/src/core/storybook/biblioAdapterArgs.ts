export const argTypes = {
  useBiblioAdapterConfig: {
    description:
      "Lend through the service layer instead of Publizon (feature flag)",
    control: { type: "text" } as const
  },
  biblioTolerateUnknownMaterialsConfig: {
    description:
      "TEMPORARY: render a material the adapter answers 404 for as " +
      "unavailable instead of failing the page",
    control: { type: "text" } as const
  },
  publizonReservationsClosedConfig: {
    description:
      "TEMPORARY: freeze the Publizon reservation queue while Biblio " +
      "migrates it - no new reservations and no cancellations. Loans are " +
      "unaffected",
    control: { type: "text" } as const
  }
};

export default {
  useBiblioAdapterConfig: "0",
  biblioTolerateUnknownMaterialsConfig: "0",
  publizonReservationsClosedConfig: "0"
};

export interface BiblioAdapterArgs {
  useBiblioAdapterConfig: string;
  biblioTolerateUnknownMaterialsConfig: string;
  publizonReservationsClosedConfig: string;
}
