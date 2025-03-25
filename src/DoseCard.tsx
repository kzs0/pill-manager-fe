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
        await markDoseAsTaken(doseID, doseTime, tk);
      } else if (action === "skipped") {
        await markDoseAsSkipped(doseID, doseTime, tk);
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
    return <div className="text-center py-8">Please Login to View Doses</div>;
  }

  if (doses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="card p-8 mx-auto max-w-md">
          <p className="text-gray-600 dark:text-gray-300">No medications found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Add a medication to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Medications</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doses.map((dose) => (
          <div
            key={dose.Medication.Name}
            className="card p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{dose.Medication.Name}</h3>
              {dose.Medication.Brand && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1">
                  {dose.Medication.Brand}
                </span>
              )}
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
              <div>
                <span className="font-medium">Until refill:</span>{" "}
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md">
                  {DosesTillRefill(dose.Doses)}
                </span>
              </div>
              <div>
                <span className="font-medium">Until empty:</span>{" "}
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-md">
                  {DosesTillEmpty(dose.Doses)}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              {dose.Doses.slice(0, NumberOfDosesToShow).map((schedule) => (
                <div key={schedule.ID} className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Time:</span>{" "}
                      <span className="font-medium">
                        {new Date(schedule.Time).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>{" "}
                      <span className="font-medium">
                        {schedule.Amount} {schedule.Unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleDoseAction(schedule.ID, schedule.Time, "taken");
                      }}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Taken
                    </button>
                    <button
                      onClick={() =>
                        handleDoseAction(schedule.ID, schedule.Time, "skipped")
                      }
                      className="btn btn-danger btn-sm flex-1"
                    >
                      Skipped
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoseCard;
