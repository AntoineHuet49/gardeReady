import { Element } from "./Element";
import { Section } from "./Section";

export type Vehicule = {
    id: number;
    name: string;
    elements?: Element[]; // Rétrocompatibilité
    sections?: Section[]; // Nouvelle structure hiérarchique
};