type Duration = number;

type Time = Date;

type Prescription = {
  ID: string;
  Medication: Medication;
  Schedule: Schedule;
  Doses: number;
  Refills: number;
  ScheduleStart: string;
};

type Medication = {
  ID: string;
  Name: string;
  Generic: boolean;
  Brand: string;
};

type ScheduledDose = {
  DurationIntoPeriod: string; // Replace `string` with a custom `Duration` type if defined
  Amount: number;
  Unit: string;
};

type Schedule = {
  Period: string; // Replace `string` with a custom `Duration` type if defined
  Doses: ScheduledDose[];
};

type RemainingDoses = {
  Medication: Medication;
  Doses: Dose[];
};

function DosesTillEmpty(doses: Dose[]): number {
  return doses.length;
}

function DosesTillRefill(doses: Dose[]): number {
  let earliest = Number.POSITIVE_INFINITY;
  const counters = new Map<number, number>();

  for (const dose of doses) {
    if (dose.Refill < earliest) {
      earliest = dose.Refill;
    }

    counters.set(dose.Refill, (counters.get(dose.Refill) ?? 0) + 1);
  }

  return counters.get(earliest) ?? 0;
}

type Dose = {
  ID: string;
  Time: Time;
  Amount: number;
  Unit: string;
  Refill: number;
};

type Taken = {
  ID: string;
  Time: Time;
  Medication: Medication;
};

export const medicationsList: Prescription[] = [];

export type {
  RemainingDoses,
  Dose,
  Schedule,
  ScheduledDose,
  Medication,
  Prescription,
  Taken,
  Duration,
  Time,
};

export { DosesTillEmpty, DosesTillRefill };
