import { FC, useEffect, useState } from "react";
import { RemainingDoses } from "./models";
import { getScheduledDoses } from "./client";

const DoseCard: FC = () => {
  const [doses, setDoses] = useState<RemainingDoses[]>([]);

  useEffect(() => {
    const f = async () => {
      const ds = await getScheduledDoses();
      ds.sort((a, b) => a.Medication.Name.localeCompare(b.Medication.Name));
      setDoses(ds);
    };

    if (doses.length == 0) {
      f();
    }
  }, [doses, setDoses]);

  return (
    <div>
      <div>Next Dose</div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {doses.map((dose) => (
          <li key={dose.Medication.Name} style={{ marginBottom: "10px" }}>
            <div>
              <strong>Medication:</strong> {dose.Medication.Name}
            </div>
            {dose.Doses.map((schedule) => (
              <div>
                <strong>Time:</strong> {schedule.Time.toLocaleString()}{" "}
                <strong>Amount:</strong> {schedule.Amount} {schedule.Unit}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoseCard;
