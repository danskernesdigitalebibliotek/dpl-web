import { Button } from "../Buttons/button/Button";
import { MaterialGrid } from "../material-grid/MaterialGrid";
import MaterialGridData from "../material-grid/MaterialGridData";

interface ReservationSuccesProps {
  showRecommendations?: boolean;
}

const ReservationSucces = ({
  showRecommendations = true,
}: ReservationSuccesProps) => {
  return (
    <section className="reservation-modal reservation-modal--confirm">
      <div className="reservation-modal--text-section">
        <h2 className="text-header-h3 pb-32">
          Materialet er hjemme og er nu reserveret til dig!
        </h2>
        <p className="reservation-success__text pb-16">
          “Audrey Hepburn” er reserveret til dig
        </p>
        <p className="reservation-success__text pb-16">
          Du står nummer 1 i køen. Der er 3 eksemplarer hjemme.
        </p>
        <p className="reservation-success__text pb-48">
          Materialet er hjemme, og du får besked så snart det ligger klar til
          dig - afhentning på Københavns Hovedbibliotek.
        </p>
        <Button
          classNames="reservation-modal__confirm-button"
          label="OK"
          disabled={false}
          collapsible={false}
          size="small"
          buttonType="none"
          variant="filled"
        />
      </div>
      {showRecommendations && (
        <div className="reservation-modal__recommendations">
          <h4 className="reservation-modal__recommendations-title">
            Du er måske også interesseret i...
          </h4>
          <MaterialGrid
            selectedAmountOfMaterialsForDisplay={4}
            initialMaximumDisplay={4}
            materials={MaterialGridData}
          />
        </div>
      )}
    </section>
  );
};

export default ReservationSucces;
