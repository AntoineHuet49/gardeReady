// Contrôle rapide de la rotation serveur : `node scripts/rotation.check.ts`
// Mêmes cas que client/scripts/planning.check.ts (référence 02/10/2026 = Garde 1, 3 gardes).
import assert from "node:assert/strict";
import { gardeIndexForShift, isFriday } from "../Utils/GardeRotation.ts";

const ref = "2026-10-02";
const garde = (shift: string) => gardeIndexForShift(shift, ref, 3) + 1;

assert.equal(garde("2026-10-02"), 1);
assert.equal(garde("2026-10-09"), 2);
assert.equal(garde("2026-09-25"), 3);
assert.equal(garde("2026-09-18"), 2);
assert.equal(garde("2026-10-23"), 1);
assert.equal(garde("2026-10-30"), 2); // après le passage à l'heure d'hiver
assert.equal(garde("2026-04-03"), 2); // 26 semaines avant, heure d'été

assert.ok(isFriday("2026-10-02"));
assert.ok(!isFriday("2026-10-03"));
assert.ok(!isFriday("2026-02-30"));
assert.ok(!isFriday("02/10/2026"));
assert.ok(!isFriday(20261002));

console.log("rotation.check OK");
