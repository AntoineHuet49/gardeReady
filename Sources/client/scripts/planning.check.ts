// Contrôle rapide de la rotation : `TZ=Europe/Paris node scripts/planning.check.ts`
import assert from "node:assert/strict";
import { gardeForShift, shiftStartOf, toDateOnly } from "../src/App/utils/planning.ts";

const gardes = [1, 2, 3];
const ref = "2026-10-02"; // vendredi : Garde 1
const at = (s: string) => {
    const start = shiftStartOf(new Date(s));
    return { start: `${toDateOnly(start)} ${start.getHours()}h`, garde: gardeForShift(start, ref, gardes) };
};

// Relève le vendredi à 8h
assert.deepEqual(at("2026-10-02T07:59:00"), { start: "2026-09-25 8h", garde: 3 });
assert.deepEqual(at("2026-10-02T08:00:00"), { start: "2026-10-02 8h", garde: 1 });
assert.deepEqual(at("2026-10-02T18:00:00"), { start: "2026-10-02 8h", garde: 1 });
assert.deepEqual(at("2026-10-08T23:00:00"), { start: "2026-10-02 8h", garde: 1 });
assert.deepEqual(at("2026-10-09T08:00:00"), { start: "2026-10-09 8h", garde: 2 });
// Passage à l'heure d'hiver (25/10/2026) sans décalage
assert.deepEqual(at("2026-10-30T09:00:00"), { start: "2026-10-30 8h", garde: 2 });
// Passé et cycle complet
assert.deepEqual(at("2026-09-18T12:00:00"), { start: "2026-09-18 8h", garde: 2 });
assert.deepEqual(at("2026-10-23T12:00:00"), { start: "2026-10-23 8h", garde: 1 });
// Heure d'été (29/03/2026) : 26 semaines avant la référence
assert.deepEqual(at("2026-04-03T08:30:00"), { start: "2026-04-03 8h", garde: 2 });

console.log("planning.check OK");
