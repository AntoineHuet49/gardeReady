import { Garde } from "../../Types/Garde";
import { addDays } from "../../App/utils/planning";

export type Shift = { start: Date; garde: Garde };

export const formatDay = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export const shiftEnd = (start: Date) => addDays(start, 7);

// Les couleurs de garde sont saisies en texte libre (« Rouge », « jaune »…) : on traduit les noms français
// courants en couleur CSS ; un hex ou un nom anglais passe tel quel.
const FRENCH_COLORS: Record<string, string> = {
    rouge: "#dc2626", bleu: "#2563eb", vert: "#16a34a", jaune: "#eab308", orange: "#f97316",
    violet: "#9333ea", rose: "#ec4899", noir: "#171717", blanc: "#e5e5e5", gris: "#6b7280",
    marron: "#92400e", cyan: "#06b6d4",
};

export const gardeColor = (color: string) =>
    FRENCH_COLORS[color.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")] ?? color;

export const responsableName = (garde: Garde) =>
    garde.responsableUser ? `${garde.responsableUser.firstname} ${garde.responsableUser.lastname}` : null;
