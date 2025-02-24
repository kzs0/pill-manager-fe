import { FC, useEffect, useState } from "react";
import { DosesTillEmpty, DosesTillRefill, RemainingDoses } from "./models";
import {
  getScheduledDoses,
  markDoseAsTaken,
  markDoseAsSkipped,
} from "./client";
import { useAuth0 } from "@auth0/auth0-react";

type DoseCardProps = {
  NumberOfDosesToShow: number;
  Loaded: boolean;
  SetLoaded: (loaded: boolean) => void;
};

const DoseCard: FC<DoseCardProps> = ({
  NumberOfDosesToShow,
  Loaded,
  SetLoaded,
}) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [doses, setDoses] = useState<RemainingDoses[]>([]);

  useEffect(() => {
    const fetchDoses = async () => {
      try {
        if (!isAuthenticated) {
          return;
        }

        const tk = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://kenzo.us.auth0.com/api/v2/`,
            scope: "read:current_user",
          },
        });

        if (tk === undefined) {
          console.log("Failed to access token");
          return;
        }

        const ds = await getScheduledDoses(tk);
        ds.sort((a, b) => a.Medication.Name.localeCompare(b.Medication.Name));

        setDoses(ds);
        SetLoaded(true);
      } catch (e) {
        console.log(e);
      }
    };

    if (doses.length === 0 && !Loaded) {
      fetchDoses();
    }
  }, [
    doses,
    setDoses,
    Loaded,
    SetLoaded,
    isAuthenticated,
    getAccessTokenSilently,
  ]);

  const handleDoseAction = async (
    doseID: string,
    doseTime: Date,
    action: "taken" | "skipped",
  ) => {
    try {
      const tk = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://kenzo.us.auth0.com/api/v2/`,
          scope: "read:current_user",
        },
      });

      if (action === "taken") {
        await markDoseAsTaken(doseID, doseTime, tk); // Replace with actual API logic
      } else if (action === "skipped") {
        await markDoseAsSkipped(doseID, doseTime, tk); // Replace with actual API logic
      }

      setDoses((prevDoses) => {
        const d = prevDoses.map((dose) => ({
          ...dose,
          Doses: dose.Doses.filter((d) => d.ID !== doseID),
        }));

        return d;
      });
    } catch (e) {
      console.log(`Failed to mark dose as ${action}:`, e);
    }
  };

  if (!isAuthenticated) {
    return <div>Please Login to View Doses</div>;
  }

  return (
    <div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {doses.map((dose) => (
          <li
            key={dose.Medication.Name}
            style={{ marginBottom: "10px" }}
            className="block max-w-xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="mb-2">
              <strong>Medication:</strong> {dose.Medication.Name}
              <div>Doses until refill: {DosesTillRefill(dose.Doses)} </div>
              <div>Doses until empty: {DosesTillEmpty(dose.Doses)}</div>
            </div>
            {dose.Doses.slice(0, NumberOfDosesToShow).map((schedule) => (
              <div key={schedule.ID}>
                <strong>Time:</strong>{" "}
                {new Date(schedule.Time).toLocaleString()}{" "}
                <strong>Amount:</strong> {schedule.Amount} {schedule.Unit}
                <div>
                  <button
                    onClick={() => {
                      handleDoseAction(schedule.ID, schedule.Time, "taken");
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 mr-2 mb-2 rounded"
                  >
                    Taken
                  </button>
                  <button
                    onClick={() =>
                      handleDoseAction(schedule.ID, schedule.Time, "skipped")
                    }
                    className="bg-red-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                  >
                    Skipped
                  </button>
                </div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoseCard;
