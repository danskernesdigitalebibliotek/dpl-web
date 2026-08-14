import React from "react";

// Shown in place of the action buttons when a material cannot be borrowed,
// reserved or opened through the website.
const MaterialUnavailableNotice: React.FC = () => {
  return (
    <div
      className="material-unavailable-notice"
      data-cy="material-unavailable-notice"
    >
      <p className="material-unavailable-notice__title">
        Materialet er ikke tilgængeligt via hjemmesiden
      </p>
      <p className="material-unavailable-notice__description">
        Besøg biblioteket og få hjælp fra en bibliotekar eller prøv om
        materialet er tilgængeligt på{" "}
        <a
          className="material-unavailable-notice__link"
          href="https://bibliotek.dk"
          target="_blank"
          rel="noreferrer"
          data-cy="material-unavailable-notice-link"
        >
          Bibliotek.dk
        </a>
      </p>
    </div>
  );
};

export default MaterialUnavailableNotice;
