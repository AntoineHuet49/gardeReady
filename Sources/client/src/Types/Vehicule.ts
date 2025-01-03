import { Element } from "./Element";

export type Vehicule = {
    id: number;
    name: string;
    elements?: Element[];
};