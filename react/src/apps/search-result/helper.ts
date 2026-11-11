import { head, mapValues } from "lodash";
import { getMaterialTypes } from "../../core/utils/helpers/general";
import { Manifestation } from "../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { FacetFieldEnum } from "../../core/dbc-gateway/generated/graphql";
import { FacetOrigin, Filter, FilterItemTerm } from "../../core/filter.slice";
import invalidSwitchCase from "../../core/utils/helpers/invalid-switch-case";

export const mapFacetToFilter = (facet: FacetFieldEnum) => {
  switch (facet) {
    case FacetFieldEnum.Materialtypesspecific:
      return "materialTypesSpecific";
    case FacetFieldEnum.Worktypes:
      return "workTypes";
    case FacetFieldEnum.Creators:
      return "creators";
    case FacetFieldEnum.Subjects:
      return "subjects";
    case FacetFieldEnum.Dk5:
      return "dk5";
    default:
      return "invalid";
  }
};

export const getFirstMaterialTypeFromFilters = (
  filters: Filter,
  manifestations: Manifestation[]
) => {
  const materialTypeFilter = head(
    Object.keys(filters[FacetFieldEnum.Materialtypesspecific] || {}).sort()
  ) as ManifestationMaterialType;
  const allMaterialTypes = getMaterialTypes(manifestations);
  return materialTypeFilter && allMaterialTypes.includes(materialTypeFilter)
    ? materialTypeFilter
    : undefined;
};

export const allFacetFields = [
  FacetFieldEnum.Materialtypesgeneral,
  FacetFieldEnum.Materialtypesspecific,
  FacetFieldEnum.Creators,
  FacetFieldEnum.Year,
  FacetFieldEnum.Mainlanguages,
  FacetFieldEnum.Subjects,
  FacetFieldEnum.Genreandform,
  FacetFieldEnum.Fictionalcharacters,
  FacetFieldEnum.Dk5,
  FacetFieldEnum.Age,
  FacetFieldEnum.Libraryrecommendation,
  FacetFieldEnum.Generalaudience,
  FacetFieldEnum.Lix,
  FacetFieldEnum.Let,
  FacetFieldEnum.Gameplatform,
  FacetFieldEnum.Accesstypes,
  FacetFieldEnum.Canalwaysbeloaned,
  FacetFieldEnum.Fictionnonfiction,
  FacetFieldEnum.Childrenoradults
];

export const formatFacetTerms = (filters: {
  [key: string]: { [key: string]: FilterItemTerm };
}) => {
  return Object.keys(filters).reduce(
    (acc, key) => ({
      ...acc,
      [key]: Object.keys(filters[key])
    }),
    {}
  );
};

export const createFilters = (
  facets: {
    [key: string]: { [key: string]: FilterItemTerm };
  },
  branchIdList: string[]
) => {
  return {
    ...formatFacetTerms(facets),
    ...(branchIdList.length > 0 ? { branchId: branchIdList } : {})
  };
};

export function getAllFilterPathsAsString(
  filterObject: Filter,
  origin: FacetOrigin
) {
  const mappedFilterValues = mapValues(filterObject, (filter) => {
    return Object.keys(filter).filter((term) => filter[term].origin === origin);
  });

  const filterNames = Object.keys(mappedFilterValues);
  let allFilterPathsAsString = "";

  filterNames.forEach((filterName) => {
    mappedFilterValues[filterName].forEach((filterValue) => {
      if (allFilterPathsAsString !== "") {
        allFilterPathsAsString = allFilterPathsAsString.concat(";");
      }
      allFilterPathsAsString = allFilterPathsAsString.concat(
        `facet.${filterName}:${filterValue}`
      );
    });
  });

  return allFilterPathsAsString;
}

export const getFacetFieldTranslation = (name: FacetFieldEnum) => {
  switch (name.toLowerCase()) {
    case FacetFieldEnum.Accesstypes.toLowerCase():
      return "facetAccessTypesText";
    case FacetFieldEnum.Canalwaysbeloaned.toLowerCase():
      return "facetCanAlwaysBeLoanedText";
    case FacetFieldEnum.Childrenoradults.toLowerCase():
      return "facetChildrenOrAdultsText";
    case FacetFieldEnum.Creators.toLowerCase():
      return "facetCreatorsText";
    case FacetFieldEnum.Dk5.toLowerCase():
      return "facetDk5Text";
    case FacetFieldEnum.Fictionnonfiction.toLowerCase():
      return "facetFictionNonfictionText";
    case FacetFieldEnum.Fictionalcharacters.toLowerCase():
      return "facetFictionalCharactersText";
    case FacetFieldEnum.Genreandform.toLowerCase():
      return "facetGenreAndFormText";
    case FacetFieldEnum.Mainlanguages.toLowerCase():
      return "facetMainLanguagesText";
    case FacetFieldEnum.Materialtypesspecific.toLowerCase():
      return "facetMaterialTypesSpecificText";
    case FacetFieldEnum.Materialtypesgeneral.toLowerCase():
      return "facetMaterialTypesGeneralText";
    case FacetFieldEnum.Subjects.toLowerCase():
      return "facetSubjectsText";
    case FacetFieldEnum.Worktypes.toLowerCase():
      return "facetWorkTypesText";
    case FacetFieldEnum.Year.toLowerCase():
      return "facetYearText";
    case FacetFieldEnum.Gameplatform.toLowerCase():
      return "facetGamePlatformText";
    case FacetFieldEnum.Age.toLowerCase():
      return "facetAgeText";
    case FacetFieldEnum.Generalaudience.toLowerCase():
      return "facetGeneralAudienceText";
    case FacetFieldEnum.Lix.toLowerCase():
      return "facetLixText";
    case FacetFieldEnum.Let.toLowerCase():
      return "facetLetText";
    case FacetFieldEnum.Libraryrecommendation.toLowerCase():
      return "facetLibraryRecommendationText";
    default:
      return invalidSwitchCase<string>(name as never);
  }
};
