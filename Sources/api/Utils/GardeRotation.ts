// Rotation des gardes côté serveur (miroir de client/src/App/utils/planning.ts) : une semaine de garde est
// identifiée par son vendredi de relève (AAAA-MM-JJ), les gardes tournent dans l'ordre des numéros.
// Pas d'import : le fichier est exécuté tel quel par scripts/rotation.check.ts.

const DAY_MS = 86_400_000;

/** Vérifie qu'une chaîne est une date AAAA-MM-JJ valide tombant un vendredi. */
export function isFriday(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getUTCDay() === 5;
}

/** Index (dans les gardes triées par numero) de la garde de service la semaine du vendredi `shiftDate`. */
export function gardeIndexForShift(shiftDate: string, referenceDate: string, gardeCount: number): number {
    const weeks = Math.round((Date.parse(shiftDate) - Date.parse(referenceDate)) / DAY_MS / 7);
    return ((weeks % gardeCount) + gardeCount) % gardeCount;
}
