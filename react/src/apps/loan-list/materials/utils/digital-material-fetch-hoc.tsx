import React, { useEffect, useState, ComponentType, FC } from "react";
import { useGetV1ProductsIdentifier } from "../../../../core/publizon/publizon";
import { BasicDetailsType } from "../../../../core/utils/types/basic-details-type";
import { MaterialProps } from "./material-fetch-hoc";
import {
  mapBiblioMaterialToBasicDetailsType,
  mapProductToBasicDetailsType
} from "../../../../core/utils/helpers/list-mapper";
import { ListType } from "../../../../core/utils/types/list-type";
import useBiblioAdapter from "../../../../core/utils/useBiblioAdapter";
import useBiblioMaterial from "../../../../core/biblio/useBiblioMaterial";
import {
  isBiblioReservation,
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
      const [digitalMaterial, setDigitalMaterial] =
        useState<BasicDetailsType>();
      const useBiblio = useBiblioAdapter();

      // A Biblio loan carries its own catalogue fields; nothing to look up.
      const hasOwnDetails = Boolean(item.details);

      // Who describes a material is read off the item, never discovered by
      // asking. A loan from before the switch is Publizon's - the only reason
      // Publizon is still asked during the transition.
      const isBiblioItem = isReservationType(item) && isBiblioReservation(item);
      const isProvidedByBiblio = useBiblio && !hasOwnDetails && isBiblioItem;

      const { data: biblioMaterial, isLoading: isLoadingBiblio } =
        useBiblioMaterial(isProvidedByBiblio ? item.identifier : null);

      const {
        data: productsData,
        isSuccess: isSuccessDigital,
        isLoading: isLoadingPublizon
      } = useGetV1ProductsIdentifier(item.identifier, {
        query: {
          enabled: !!item.identifier && !hasOwnDetails && !isProvidedByBiblio
        }
      });

      useEffect(() => {
        if (item.details) {
          setDigitalMaterial(item.details);
          return;
        }
        if (biblioMaterial) {
          setDigitalMaterial(
            mapBiblioMaterialToBasicDetailsType(biblioMaterial)
          );
          return;
        }
        if (productsData && isSuccessDigital && productsData.product) {
          setDigitalMaterial(
            mapProductToBasicDetailsType(productsData.product)
          );
        } else {
          // todo error handling, missing in figma
        }
      }, [productsData, isSuccessDigital, biblioMaterial, item.details]);

      // if the fallback component is provided we can show it while the data is loading
      if (isLoadingBiblio || isLoadingPublizon)
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
