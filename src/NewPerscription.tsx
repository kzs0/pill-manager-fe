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
    return <div className="text-center py-8">Please Login to Add Medications</div>;
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
    return null;
  }

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-backdrop" aria-hidden="true"></div>
      <div className="modal-container">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
            <form onSubmit={handleSubmit}>
              <div className="px-6 pt-5 pb-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-6">
                    Add New Medication
                  </h3>

                  <div className="space-y-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Doses</label>
                        <input
                          type="number"
                          value={prescription.Doses}
                          onChange={(e) =>
                            handleChange("Doses", parseInt(e.target.value) || 0)
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Refills</label>
                        <input
                          type="number"
                          value={prescription.Refills}
                          onChange={(e) =>
                            handleChange("Refills", parseInt(e.target.value) || 0)
                          }
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Schedule Start</label>
                        <input
                          type="datetime-local"
                          value={prescription.ScheduleStart}
                          onChange={(e) =>
                            handleChange("ScheduleStart", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3 rounded-b-xl">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => SetOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Medication
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
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">Medication Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={Medication.Name}
            onChange={(e) => onChange("Name", e.target.value)}
            className="input"
            placeholder="Medication name"
          />
        </div>
        <div>
          <label className="label">Brand</label>
          <input
            type="text"
            value={Medication.Brand}
            onChange={(e) => onChange("Brand", e.target.value)}
            className="input"
            placeholder="Brand name (optional)"
          />
        </div>
      </div>
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id="generic-checkbox"
          checked={Medication.Generic}
          onChange={(e) => onChange("Generic", e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        />
        <label 
          htmlFor="generic-checkbox" 
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Generic medication
        </label>
      </div>
    </div>
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
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 pt-2">Schedule Information</h4>
      <div>
        <label className="label">Period</label>
        <input
          type="text"
          value={Schedule.Period}
          onChange={(e) => onChange("Period", e.target.value)}
          className="input"
          placeholder="e.g., daily, weekly"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">Doses</h5>
          <button
            type="button"
            onClick={addDose}
            className="btn btn-secondary btn-sm"
          >
            Add Dose
          </button>
        </div>
        
        <div className="space-y-4">
          {Schedule.Doses.map((dose, index) => (
            <div
              key={index}
              className="card p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dose #{index + 1}</h6>
                <button
                  type="button"
                  onClick={() => removeDose(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Duration Into Period</label>
                  <input
                    type="text"
                    value={dose.DurationIntoPeriod}
                    onChange={(e) =>
                      handleDoseChange(index, "DurationIntoPeriod", e.target.value)
                    }
                    className="input"
                    placeholder="Duration"
                  />
                </div>
                <div>
                  <label className="label">Amount</label>
                  <input
                    type="text"
                    value={tempDoseAmount ? tempDoseAmount[index] : dose.Amount}
                    onChange={(e) => handleDoseAmountChange(index, e.target.value)}
                    className="input"
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input
                    type="text"
                    value={dose.Unit}
                    onChange={(e) => handleDoseChange(index, "Unit", e.target.value)}
                    className="input"
                    placeholder="e.g., mg, ml"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {Schedule.Doses.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
              No doses added yet. Click "Add Dose" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;
