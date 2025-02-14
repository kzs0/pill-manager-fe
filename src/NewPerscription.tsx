import React, { useEffect, useState } from "react";
import { Prescription, Medication, Schedule, ScheduledDose } from "./models";
import { useAuth0 } from "@auth0/auth0-react";
import { postNewPerscription } from "./client";
import dayjs from "dayjs";

type NewPrescriptionProps = {
  RefreshDoses: () => void;
};

// Main Prescription Form
const PrescriptionForm: React.FC<NewPrescriptionProps> = ({ RefreshDoses }) => {
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Prescription Form</h1>

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
          onChange={(e) => handleChange("Doses", parseInt(e.target.value) || 0)}
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
          onChange={(e) => handleChange("ScheduleStart", e.target.value)}
        />
      </div>

      <button type="submit">Submit</button>
    </form>
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
        />
      </div>
      <div>
        <label>Generic:</label>
        <input
          type="checkbox"
          checked={Medication.Generic}
          onChange={(e) => onChange("Generic", e.target.checked)}
        />
      </div>
      <div>
        <label>Brand:</label>
        <input
          type="text"
          value={Medication.Brand}
          onChange={(e) => onChange("Brand", e.target.value)}
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

    const tempDoseClone = [...tempDoseAmount];
    tempDoseClone[index] = value;
    setTempDoseAmount(tempDoseClone);
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
      <legend>Schedule</legend>
      <div>
        <label>Period:</label>
        <input
          type="text"
          value={Schedule.Period}
          onChange={(e) => onChange("Period", e.target.value)}
        />
      </div>

      <h3>Doses</h3>
      {Schedule.Doses.map((dose, index) => (
        <div key={index}>
          <label>Duration Into Period:</label>
          <input
            type="text"
            value={dose.DurationIntoPeriod}
            onChange={(e) =>
              handleDoseChange(index, "DurationIntoPeriod", e.target.value)
            }
          />
          <label>Amount:</label>
          <input
            type="text"
            value={tempDoseAmount}
            onChange={(e) => handleDoseAmountChange(index, e.target.value)}
          />
          <label>Unit:</label>
          <input
            type="text"
            value={dose.Unit}
            onChange={(e) => handleDoseChange(index, "Unit", e.target.value)}
          />
          <button type="button" onClick={() => removeDose(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addDose}>
        Add Dose
      </button>
    </fieldset>
  );
};

export default PrescriptionForm;
