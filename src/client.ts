import axios from "axios";
import { Prescription, RemainingDoses } from "./models";

const medicationClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkBackend = async (token: string): Promise<boolean> => {
  const headers = { headers: { Authorization: "Bearer " + token } };
  const response = await medicationClient.get("/", headers);

  return response.status == 200;
};

export const getScheduledDoses = async (
  token: string,
): Promise<RemainingDoses[]> => {
  const headers = { headers: { Authorization: "Bearer " + token } };
  const response = await medicationClient.get("/rx/remaining", headers);

  return response.data;
};

export const postNewPerscription = async (
  rx: Prescription,
  token: string,
): Promise<Prescription> => {
  const headers = { headers: { Authorization: "Bearer " + token } };
  const response = await medicationClient.post("/rx", rx, headers);

  return response.data;
};

export const markDoseAsTaken = async (
  doseID: string,
  time: Date,
  token: string,
) => {
  const headers = { headers: { Authorization: "Bearer " + token } };
  await medicationClient.post("/rx/taken/" + doseID, { time: time }, headers);

  return;
};

export const markDoseAsSkipped = async (
  doseID: string,
  time: Date,
  token: string,
) => {
  const headers = { headers: { Authorization: "Bearer " + token } };
  await medicationClient.post("/rx/skipped/" + doseID, { time: time }, headers);

  return;
};
