import { test, expect, Page } from '@playwright/test';
import { adminState, userState } from './helpers';

// Mercredi 21/10/2026 : la garde en cours a pris son service le vendredi 16/10/2026
const NOW = new Date('2026-10-21T12:00:00+02:00');

const gear = (page: Page) => page.getByRole('button', { name: 'Paramètres de rotation des gardes' });
// La rotation se règle dans une modale ouverte par l'engrenage ; elle se ferme après un enregistrement réussi
const rotationForm = (page: Page) => page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Rotation des gardes' }) });
const dateInput = (page: Page) => rotationForm(page).getByLabel('Date de référence de la rotation');

async function openRotation(page: Page) {
    await gear(page).click();
    await expect(rotationForm(page)).toBeVisible();
}

async function setRotation(page: Page, friday: string) {
    await openRotation(page);
    await dateInput(page).fill(friday);
    await rotationForm(page).getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Rotation des gardes enregistrée !').last()).toBeVisible();
    await expect(rotationForm(page)).toBeHidden();
}

// Carte de la semaine en cours dans la vue Liste
const currentShift = (page: Page) => page.getByRole('button').filter({ has: page.getByText('En cours', { exact: true }) });

// Le 2e test lit la rotation réglée par le 1er
test.describe.configure({ mode: 'serial' });

test.describe('admin', () => {
    test.use({ storageState: adminState });

    test("l'admin règle la rotation des gardes", async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await page.goto('/planning');
        await expect(page.getByText('Planning non configuré')).toBeVisible();

        // Un jour autre qu'un vendredi est refusé
        await openRotation(page);
        await dateInput(page).fill('2026-10-15');
        await expect(rotationForm(page).getByText('Choisissez un vendredi.')).toBeVisible();
        await expect(rotationForm(page).getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
        await rotationForm(page).getByRole('button', { name: 'Fermer' }).first().click();
        await expect(rotationForm(page)).toBeHidden();

        // La garde 1 prend son service le vendredi de référence...
        await setRotation(page, '2026-10-16');
        await page.getByRole('tab', { name: 'Liste' }).click();
        await expect(currentShift(page)).toContainText('Garde 1');

        // ...et les gardes tournent dans l'ordre des numéros, une semaine chacune
        await setRotation(page, '2026-10-09');
        await expect(currentShift(page)).toContainText('Garde 2');
    });
});

test.describe('utilisateur', () => {
    test.use({ storageState: userState });

    test("l'utilisateur voit la garde en cours et son détail", async ({ page }) => {
        await page.clock.setFixedTime(NOW);
        await page.goto('/planning');
        await expect(gear(page)).toHaveCount(0);

        await page.getByRole('tab', { name: 'Liste' }).click();
        await expect(currentShift(page)).toContainText('Garde 2');

        await currentShift(page).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('heading', { name: 'Garde 2' })).toBeVisible();
        await expect(dialog.getByText('Responsable : John Doe')).toBeVisible();
        await expect(dialog.getByRole('listitem').filter({ hasText: 'John Doe' })).toBeVisible();
    });
});
