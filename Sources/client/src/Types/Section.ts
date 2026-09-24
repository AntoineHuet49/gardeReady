import { Element } from "./Element";

export type Section = {
    id: number;
    name: string;
    vehicule_id?: number;
    parent_section_id?: number;
    has_photo?: boolean;
    subSections?: Section[];
    elements?: Element[];
};

export type SectionHierarchy = Section & {
    path?: Section[]; // Chemin complet de la racine jusqu'à cette section
    level?: number;   // Niveau de profondeur dans la hiérarchie
};