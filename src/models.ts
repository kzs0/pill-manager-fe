type Duration = number;

type Time = Date;

interface RemainingDoses {
  Medication: Medication;
  Doses: Dose[];
}

interface Dose {
  Time: Time;
  Amount: number;
  Unit: string;
}

interface ScheduledDose {
  DurationIntoPeriod: Duration; // duration in milliseconds
  Amount: number;
  Unit: string;
  Taken: boolean;
  Time: Time;
}

interface Schedule {
  Period: Duration; // duration in milliseconds
  Doses: ScheduledDose[];
}

interface Medication {
  Id: number;
  Name: string;
  Generic: boolean;
  Brand: string;
}

interface Prescription {
  Id: number;
  Medication: Medication;
  Schedule: Schedule;
  Doses: number;
  Refills: number;
  ScheduleStart: Time;
}

interface Taken {
  Id: number;
  Time: Time;
  Medication: Medication;
}

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
