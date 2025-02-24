import React, { useEffect, useState } from "react";
import { Prescription, Medication, Schedule, ScheduledDose } from "./models";
import { useAuth0 } from "@auth0/auth0-react";
import { postNewPerscription } from "./client";
import dayjs from "dayjs";

type NewPrescriptionProps = {
  RefreshDoses: () => void;
  SetLoaded: (loaded: boolean) => void;
  Open: boolean;
  SetOpen: (open: boolean) => void;
};

// Main Prescription Form
const PrescriptionForm: React.FC<NewPrescriptionProps> = ({
  RefreshDoses,
  SetLoaded,
  Open,
  SetOpen,
}) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [prescription, setPrescription] = useState<Prescription>({
    ID: "",
    Medication: {
      ID: "",
      Name: "",
      Generic: false,
      Brand: "",
    },
    Schedule: {
      Period: "",
      Doses: [],
    },
    Doses: 0,
    Refills: 0,
    ScheduleStart: "",
  });

  useEffect(() => {
    const f = async () => {
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
          console.log("failed to access token");
          return;
        }

        setLoaded(true);
      } catch (e) {
        console.log(e);
      }
    };

    if (!loaded) {
      f();
    }
  }, [loaded, setLoaded, isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <div>Please Login to View Doses</div>;
  }

  const handleChange = <K extends keyof Prescription>(
    field: K,
    value: Prescription[K],
  ) => {
    setPrescription((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedicationChange = <K extends keyof Medication>(
    field: K,
    value: Medication[K],
  ) => {
    setPrescription((prev) => ({
      ...prev,
      Medication: { ...prev.Medication, [field]: value },
    }));
  };

  const handleScheduleChange = <K extends keyof Schedule>(
    field: K,
    value: Schedule[K],
  ) => {
    setPrescription((prev) => ({
      ...prev,
      Schedule: { ...prev.Schedule, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tk = await getAccessTokenSilently({
      authorizationParams: {
        audience: `https://kenzo.us.auth0.com/api/v2/`,
        scope: "read:current_user",
      },
    });

    prescription.ScheduleStart = dayjs(prescription.ScheduleStart).format(
      "YYYY-MM-DDTHH:mm:ssZ",
    );

    console.log("Form Submitted:", prescription);

    postNewPerscription(prescription, tk);

    RefreshDoses();
    SetLoaded(false);
  };

  if (!Open) {
    return <div></div>;
  }

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500/75 transition-opacity"
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <div className="px-4 pt-5 bg-gray-400 text-white pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-base font-semibold text-white"
                      id="modal-title"
                    >
                      Enter a new Prescription
                    </h3>

                    {/* Medication Fields */}
                    <MedicationForm
                      Medication={prescription.Medication}
                      onChange={handleMedicationChange}
                    />

                    {/* Schedule Fields */}
                    <ScheduleForm
                      Schedule={prescription.Schedule}
                      onChange={handleScheduleChange}
                    />

                    {/* Other Fields */}
                    <div>
                      <label>Doses:</label>
                      <input
                        type="number"
                        value={prescription.Doses}
                        onChange={(e) =>
                          handleChange("Doses", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label>Refills:</label>
                      <input
                        type="number"
                        value={prescription.Refills}
                        onChange={(e) =>
                          handleChange("Refills", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <label>Schedule Start:</label>
                      <input
                        type="datetime-local"
                        value={prescription.ScheduleStart}
                        onChange={(e) =>
                          handleChange("ScheduleStart", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-400 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-300 sm:ml-3 sm:w-auto"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => SetOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Medication Form
type MedicationFormProps = {
  Medication: Medication;
  onChange: <K extends keyof Medication>(
    field: K,
    value: Medication[K],
  ) => void;
};

const MedicationForm: React.FC<MedicationFormProps> = ({
  Medication,
  onChange,
}) => {
  return (
    <fieldset>
      <legend>Medication</legend>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={Medication.Name}
          onChange={(e) => onChange("Name", e.target.value)}
          className="bg-gray-400 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div>
        <label>Brand:</label>
        <input
          type="text"
          value={Medication.Brand}
          onChange={(e) => onChange("Brand", e.target.value)}
          className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div>
        <label>Generic:</label>
        <input
          type="checkbox"
          checked={Medication.Generic}
          onChange={(e) => onChange("Generic", e.target.checked)}
          className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        />
      </div>
    </fieldset>
  );
};

// Schedule Form with Dynamic Doses
type ScheduleFormProps = {
  Schedule: Schedule;
  onChange: <K extends keyof Schedule>(field: K, value: Schedule[K]) => void;
};

const ScheduleForm: React.FC<ScheduleFormProps> = ({ Schedule, onChange }) => {
  const [tempDoseAmount, setTempDoseAmount] = useState<string[]>();
  const handleDoseAmountChange = (index: number, value: string) => {
    const updatedDoses = [...Schedule.Doses];
    if (
      updatedDoses[index] &&
      updatedDoses[index].Amount != (parseFloat(value) || 0)
    ) {
      handleDoseChange(index, "Amount", parseFloat(value));
    }

    if (tempDoseAmount) {
      const tempDoseClone = [...tempDoseAmount];
      tempDoseClone[index] = value;
      setTempDoseAmount(tempDoseClone);
    }
  };

  const handleDoseChange = (
    index: number,
    field: keyof ScheduledDose,
    value: unknown,
  ) => {
    const updatedDoses = [...Schedule.Doses];
    updatedDoses[index] = { ...updatedDoses[index], [field]: value };
    onChange("Doses", updatedDoses);
  };

  const addDose = () => {
    onChange("Doses", [
      ...Schedule.Doses,
      { DurationIntoPeriod: "", Amount: 0, Unit: "" },
    ]);
  };

  const removeDose = (index: number) => {
    const updatedDoses = Schedule.Doses.filter((_, i) => i !== index);
    onChange("Doses", updatedDoses);
  };

  return (
    <fieldset>
      <legend className="font-bold pt-2">Schedule</legend>
      <div>
        <label>Period:</label>
        <input
          type="text"
          value={Schedule.Period}
          onChange={(e) => onChange("Period", e.target.value)}
          className="border border-gray-300 text-gray-900 shadow-sm text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>

      <h3>Doses</h3>
      {Schedule.Doses.map((dose, index) => (
        <div
          key={index}
          className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <label>Duration Into Period:</label>
          <input
            type="text"
            value={dose.DurationIntoPeriod}
            onChange={(e) =>
              handleDoseChange(index, "DurationIntoPeriod", e.target.value)
            }
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <label>Amount:</label>
          <input
            type="text"
            value={tempDoseAmount}
            onChange={(e) => handleDoseAmountChange(index, e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <label>Unit:</label>
          <input
            type="text"
            value={dose.Unit}
            onChange={(e) => handleDoseChange(index, "Unit", e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => removeDose(index)}
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addDose}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
      >
        Add Dose
      </button>
    </fieldset>
  );
};

export default PrescriptionForm;
