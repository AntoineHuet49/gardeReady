import { Garde } from "../../Types/Garde";
import { addDays } from "../../App/utils/planning";

export type Shift = { start: Date; garde: Garde };

export const formatDay = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export const shiftEnd = (start: Date) => addDays(start, 7);

// Les couleurs de garde sont saisies en texte libre (« Rouge », « Verte »…) : on traduit les noms français
// courants (masculin et féminin) en couleur CSS ; un hex ou un nom anglais passe tel quel.
const FRENCH_COLORS: Record<string, string> = {
    rouge: "#dc2626", jaune: "#eab308", orange: "#f97316", rose: "#ec4899", marron: "#92400e", cyan: "#06b6d4",
    bleu: "#2563eb", bleue: "#2563eb", vert: "#16a34a", verte: "#16a34a", violet: "#9333ea", violette: "#9333ea",
    noir: "#171717", noire: "#171717", blanc: "#e5e5e5", blanche: "#e5e5e5", gris: "#6b7280", grise: "#6b7280",
};
const FALLBACK_COLOR = "#6b7280"; // valeur non reconnue : gris neutre plutôt qu'aucune couleur

export const gardeColor = (color: string) => {
    const css = FRENCH_COLORS[color.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")] ?? color.trim();
    return CSS.supports("color", css) ? css : FALLBACK_COLOR;
};

// Fond teinté + liseré de la couleur de la garde (lisible en thème clair comme sombre)
export const gardeTint = (color: string): React.CSSProperties => ({
    borderLeftColor: gardeColor(color),
    backgroundColor: `color-mix(in oklab, ${gardeColor(color)} 25%, transparent)`,
});

export const responsableName = (garde: Garde) =>
    garde.responsableUser ? `${garde.responsableUser.firstname} ${garde.responsableUser.lastname}` : null;
