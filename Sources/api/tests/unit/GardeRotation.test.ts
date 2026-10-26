import { describe, expect, it } from 'vitest';
import { gardeIndexForShift, isFriday } from '~~/Utils/GardeRotation';

// Mêmes cas que client/src/App/utils/planning.test.ts : référence 02/10/2026 = Garde 1, 3 gardes
const ref = '2026-10-02';
const garde = (shift: string) => gardeIndexForShift(shift, ref, 3) + 1;

describe('gardeIndexForShift', () => {
    it.each([
        ['2026-10-02', 1],
        ['2026-10-09', 2],
        ['2026-09-25', 3],
        ['2026-09-18', 2],
        ['2026-10-23', 1],
        ['2026-10-30', 2], // après le passage à l'heure d'hiver
        ['2026-04-03', 2], // 26 semaines avant, heure d'été
    ])('la semaine du %s est tenue par la garde %i', (shift, numero) => {
        expect(garde(shift)).toBe(numero);
    });
});

describe('isFriday', () => {
    it('accepte un vendredi AAAA-MM-JJ', () => {
        expect(isFriday('2026-10-02')).toBe(true);
    });

    it.each([['2026-10-03'], ['2026-02-30'], ['02/10/2026'], [20261002], [undefined]])('refuse %s', (value) => {
        expect(isFriday(value)).toBe(false);
    });
});
