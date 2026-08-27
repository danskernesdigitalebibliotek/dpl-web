import clsx from "clsx";
import * as React from "react";
import { useEffect, useState } from "react";
import { ButtonFavouriteId } from "../button-favourite/button-favourite";
import MaterialListItem from "../card-item-list/MaterialListItem";
import RecommendedMaterial from "../recommended-material/recommended-material";
import { useEventStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";
import { MaterialGridItem } from "./helper";

export type MaterialGridProps = {
  materials: MaterialGridItem[];
  title?: string;
  description?: string;
  buttonText?: string;
  initialMaximumDisplay?: number;
  onAddToFavourites: (id: ButtonFavouriteId) => void;
};

const defaultIncrement: number = 4;

// Business logic states that there cannot be more than 100 items displayed.
// This limit should ideally be happening in the editor-input, but we'll
// add a safeguard here.
const maxAmount: number = 100;

const MaterialGrid: React.FC<MaterialGridProps> = ({
  materials,
  title,
  description,
  buttonText,
  initialMaximumDisplay = defaultIncrement,
  onAddToFavourites
}) => {
  const firstNewItemRef = React.useRef<HTMLLIElement>(null);
  const { track } = useEventStatistics();

  const moreMaterialsThanInitialMaximum =
    materials.length > initialMaximumDisplay;

  const amountToDisplay = Math.min(maxAmount, materials.length);

  const [
    currentAmountOfDisplayedMaterials,
    setCurrentMaterialsDisplayedMaterials
  ] = useState(initialMaximumDisplay);

  // Focus on the first new item when the user clicks the "Show more" button
  useEffect(() => {
    if (firstNewItemRef.current) {
      firstNewItemRef.current.focus();
    }
  }, [currentAmountOfDisplayedMaterials]);

  const [showAllMaterials, setShowAllMaterials] = useState(false);

  function handleShowAllMaterials() {
    // Tracked under the same Mapp event (47) as material clicks so DDF can see
    // grid engagement as a whole. A fixed marker distinguishes the "show more"
    // interaction from clicks on the materials themselves.
    track("click", {
      id: statistics.materialGridClick.id,
      name: statistics.materialGridClick.name,
      trackedData: "Klik på Materiale grids vis mere"
    });
    setCurrentMaterialsDisplayedMaterials(amountToDisplay);
    setShowAllMaterials(!showAllMaterials);
  }

  if (!materials.length) {
    // eslint-disable-next-line no-console
    console.warn(`No materials to show for MaterialGrid: ${title}`);
    return null;
  }

  const titleClasses = clsx("material-grid__title", {
    "material-grid__title--no-description": !description
  });
  return (
    <div className="material-grid">
      {(title || description) && (
        <div className="material-grid__text-wrapper">
          {title && <h2 className={titleClasses}>{title}</h2>}
          {description && (
            <p className="material-grid__description">{description}</p>
          )}
        </div>
      )}
      <ul className="material-grid__items">
        {materials
          .slice(0, currentAmountOfDisplayedMaterials)
          .map((material, index) => {
            return (
              <MaterialListItem
                key={material.wid}
                ref={index === initialMaximumDisplay ? firstNewItemRef : null}
              >
                <RecommendedMaterial
                  partOfGrid
                  wid={material.wid}
                  title={material.title}
                  author={material.author}
                  coverUrl={material.coverUrl}
                  url={material.url}
                  onAddToFavourites={onAddToFavourites}
                />
              </MaterialListItem>
            );
          })}
      </ul>
      {moreMaterialsThanInitialMaximum && !showAllMaterials && buttonText && (
        <button
          className="material-grid__show-more btn-primary btn-outline btn-medium"
          data-show-more
          aria-expanded={showAllMaterials ? "true" : "false"}
          type="button"
          onClick={() => handleShowAllMaterials()}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
export default MaterialGrid;
