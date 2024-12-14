import axios from "axios";
import { Prescription, RemainingDoses } from "./models";

const medicationClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getScheduledDoses = async (): Promise<RemainingDoses[]> => {
  const response = await medicationClient.get("/rx/remaining");
  return response.data;
};

export const postNewPerscription = async (
  rx: Prescription,
): Promise<Prescription> => {
  const response = await medicationClient.post("/rx", rx);
  console.log(response);
  return response.data;
};
