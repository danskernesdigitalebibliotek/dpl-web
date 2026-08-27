import React, { ComponentType, FC } from "react";
import { useGetV1ProductsIdentifier } from "../../../../core/publizon/publizon";
import { MaterialProps } from "./material-fetch-hoc";
import {
  mapDigitalMaterialToBasicDetailsType,
  mapProductToBasicDetailsType
} from "../../../../core/utils/helpers/list-mapper";
import { ListType } from "../../../../core/utils/types/list-type";
import useBiblioAdapter from "../../../../core/utils/useBiblioAdapter";
import { useDigitalMaterial } from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  hasDigitalReservationId,
  isReservationType
} from "../../../../core/utils/types/reservation-type";

type InputProps = {
  item: ListType;
};

const fetchDigitalMaterial =
  <P extends object>(
    Component: ComponentType<P & MaterialProps>,
    LoadingComponent?: ComponentType
  ): FC<P & InputProps> =>
  ({ item, ...props }: InputProps) => {
    // If this is a physical book, another HOC fetches the data and this
    // HOC just returns the component
    if (item.faust) {
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Component {...(props as P)} item={item} />;
    }

    if (item.identifier) {
      const viaBiblioAdapter = useBiblioAdapter();

      // A service layer loan carries its own catalogue fields; nothing to
      // look up.
      const hasOwnDetails = Boolean(item.details);

      // Who describes a material is read off the item, never discovered by
      // asking. A loan from before the switch is Publizon's - the only reason
      // Publizon is still asked during the transition.
      const isDigitalItem =
        isReservationType(item) && hasDigitalReservationId(item);
      const isProvidedByServiceLayer =
        viaBiblioAdapter && !hasOwnDetails && isDigitalItem;

      const { data: serviceLayerMaterial, isLoading: isLoadingServiceLayer } =
        useDigitalMaterial(isProvidedByServiceLayer ? item.identifier : null);

      const { data: productsData, isLoading: isLoadingPublizon } =
        useGetV1ProductsIdentifier(item.identifier, {
          query: { enabled: !hasOwnDetails && !isProvidedByServiceLayer }
        });

      // The description is whatever the most authoritative source has: the
      // fields the item itself carries, otherwise the provider that was asked.
      const digitalMaterial =
        item.details ??
        (serviceLayerMaterial
          ? mapDigitalMaterialToBasicDetailsType(serviceLayerMaterial)
          : null) ??
        (productsData?.product
          ? mapProductToBasicDetailsType(productsData.product)
          : null);

      // if the fallback component is provided we can show it while the data is loading
      if (isLoadingServiceLayer || isLoadingPublizon)
        return LoadingComponent ? <LoadingComponent /> : null;

      if (!digitalMaterial) return null;

      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Component {...(props as P)} item={item} material={digitalMaterial} />
      );
    }
    return null;
  };

export default fetchDigitalMaterial;
