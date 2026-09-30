// Rotation des gardes : chaque garde est de service du vendredi 8h (relève) au vendredi suivant 8h,
// dans l'ordre des numéros, à partir d'un vendredi de référence où la première garde prend son service.
// ponytail: heures lues dans le fuseau du navigateur (Europe/Paris pour le SDIS) ; à revoir si usage hors France.

export const RELEVE_HOUR = 8;
export const PRISE_DE_GARDE_HOUR = 18;
const FRIDAY = 5;
const DAY_MS = 86_400_000;

// Numéro de jour calendaire (insensible aux changements d'heure été/hiver)
const dayNumber = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;

export const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());

export const parseDateOnly = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
};

export const toDateOnly = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Début (vendredi 8h) de la garde en service à l'instant `date`. */
export function shiftStartOf(date: Date): Date {
    let back = (date.getDay() - FRIDAY + 7) % 7;
    if (back === 0 && date.getHours() < RELEVE_HOUR) back = 7;
    const friday = addDays(date, -back);
    return new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), RELEVE_HOUR);
}

/** Garde de service pour la semaine commençant à `shiftStart`. `gardes` doit être trié par numero. */
export function gardeForShift<T>(shiftStart: Date, referenceDate: string, gardes: T[]): T | undefined {
    if (gardes.length === 0) return undefined;
    const weeks = Math.round((dayNumber(shiftStart) - dayNumber(parseDateOnly(referenceDate))) / 7);
    return gardes[((weeks % gardes.length) + gardes.length) % gardes.length];
}

/** Lundi 0h de la semaine contenant `date`. */
export function mondayOf(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}
