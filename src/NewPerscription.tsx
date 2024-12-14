import React, { FC, useState } from "react";
import { Duration, Prescription, Time } from "./models";
import { postNewPerscription } from "./client";

const NewPerscription: FC = () => {
  const [formData, setFormData] = useState<Prescription>({
    Id: 0,
    Medication: {
      Id: 0,
      Name: "",
      Generic: false,
      Brand: "",
    },
    Schedule: {
      Period: 0,
      Doses: [],
    },
    Doses: 0,
    Refills: 0,
    ScheduleStart: new Date(Date.now()),
  });

  const [errors, setErrors] = useState({
    Error: false,
    ErrorStr: "",
  });

  const handleRootChange = (key: string, value: Time) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleChange = (key: string, value: string | boolean) => {
    setFormData({
      ...formData,
      Medication: {
        ...formData.Medication,
        [key]: value,
      },
    });
  };

  const handleNewScheduledDoseChange = (
    index: number,
    key: string,
    value: string | boolean | number | Time,
  ) => {
    setFormData((prev) => ({
      ...prev,
      Schedule: {
        ...prev.Schedule,
        Doses: prev.Schedule.Doses.map((d, i) =>
          i === index ? { ...d, [key]: value } : d,
        ),
      },
    }));
  };

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      Schedule: {
        ...prev.Schedule,
        Doses: [
          ...prev.Schedule.Doses,
          {
            DurationIntoPeriod: 0,
            Amount: 0,
            Unit: "",
            Taken: false,
            Time: new Date(),
          },
        ],
      },
    }));
  };

  const removeField = (dur: Duration) => {
    setFormData((prev) => ({
      ...prev,
      Schedule: {
        ...prev.Schedule,
        Doses: prev.Schedule.Doses.filter(
          (dose) => dose.DurationIntoPeriod !== dur,
        ),
      },
    }));
  };

  const validate = () => {
    const newErrors: typeof errors = {
      Error: false,
      ErrorStr: "",
    };

    // TODO client side form validation

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form Submitted", formData);

      const rx: Prescription = { ...formData };

      await postNewPerscription(rx);
      // Perform any further actions like API calls here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-medication-form">
      <div className="form-group">
        <label htmlFor="medicationName">Medication Name:</label>
        <input
          type="text"
          id="medicationName"
          name="medicationName"
          value={formData.Medication.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          className={errors.Error ? "error" : ""}
        />
        {errors.Error && (
          <span className="error-message">{errors.ErrorStr}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="isMedicationGeneric">Is the medication generic:</label>
        <input
          type="checkbox"
          id="isMedicationGeneric"
          name="isMedicationGeneric"
          value={formData.Medication.Generic.toString()}
          onChange={(e) => handleChange("Generic", e.target.value == "true")}
          className={errors.Error ? "error" : ""}
        />
        {errors.Error && (
          <span className="error-message">{errors.ErrorStr}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="brand">Brand:</label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={formData.Medication.Brand}
          onChange={(e) => handleChange("Brand", e.target.value)}
          className={errors.Error ? "error" : ""}
        />
        {errors.Error && (
          <span className="error-message">{errors.ErrorStr}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="startTime">Start Time:</label>
        <input
          type="text"
          id="startTime"
          name="startTime"
          value={formData.ScheduleStart.toString()}
          onChange={(e) =>
            handleRootChange("ScheduleStart", new Date(e.target.value))
          }
          className={errors.Error ? "error" : ""}
        />
        {errors.Error && (
          <span className="error-message">{errors.ErrorStr}</span>
        )}
      </div>

      <div className="form-group">
        <label>Scheduled Doses:</label>
        {formData.Schedule.Doses.map((dose, index) => (
          <div key={dose.DurationIntoPeriod} className="dynamic-field">
            <label>Duration Into Period:</label>
            <input
              type="number"
              value={dose.DurationIntoPeriod}
              onChange={(e) =>
                handleNewScheduledDoseChange(
                  index,
                  "DurationIntoPeriod",
                  +e.target.value,
                )
              }
              placeholder="Enter duration into period"
            />
            <label>Amount of Medication: </label>
            <input
              type="number"
              value={dose.Amount}
              onChange={(e) =>
                handleNewScheduledDoseChange(index, "Amount", +e.target.value)
              }
              placeholder="Enter the amount of medicine"
            />
            <label>Unit of amount specified: </label>
            <input
              type="text"
              value={dose.Unit}
              onChange={(e) =>
                handleNewScheduledDoseChange(index, "Unit", e.target.value)
              }
              placeholder="Enter the unit of the amount listed"
            />
            <button
              type="button"
              onClick={() => removeField(dose.DurationIntoPeriod)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}>
          + Add Scheduled Dose
        </button>
      </div>

      <button type="submit">Add Medication</button>
    </form>
  );
};

export default NewPerscription;
