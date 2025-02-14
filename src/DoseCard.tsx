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
  Refresh: number;
};

const DoseCard: FC<DoseCardProps> = ({ NumberOfDosesToShow, Refresh }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [doses, setDoses] = useState<RemainingDoses[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

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
        setLoaded(true);
      } catch (e) {
        console.log(e);
      }
    };

    // // if (doses.length === 0 && !loaded) {
    fetchDoses();
    // }
  }, [
    doses,
    setDoses,
    loaded,
    setLoaded,
    isAuthenticated,
    getAccessTokenSilently,
    Refresh,
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
      <div>Next Dose</div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {doses.map((dose) => (
          <li
            key={dose.Medication.Name}
            style={{ marginBottom: "10px" }}
            className="block max-w-xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <div>
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
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Taken
                  </button>
                  <button
                    onClick={() =>
                      handleDoseAction(schedule.ID, schedule.Time, "skipped")
                    }
                    className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
