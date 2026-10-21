import { test, expect, Locator } from '@playwright/test';
import { adminState, collapse, openCollapse } from './helpers';

test.use({ storageState: adminState });

// Les modales réinitialisent leur formulaire puis donnent le focus au champ ~100 ms après l'ouverture :
// on attend ce focus pour ne pas saisir avant la réinitialisation.
async function fillWhenFocused(input: Locator, value: string) {
    await expect(input).toBeFocused();
    await input.fill(value);
}

test("l'admin crée un véhicule, une section, une sous-section et un équipement", async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Véhicules' }).click();

    await page.getByRole('button', { name: '+ Ajouter un véhicule' }).click();
    await fillWhenFocused(page.getByRole('textbox', { name: 'Ex: VSAV01, FPT01' }), 'FPT E2E');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Section racine
    await openCollapse(page, 'FPT E2E');
    await collapse(page, 'FPT E2E').getByRole('button', { name: '+ Ajouter une section' }).click();
    await fillWhenFocused(page.getByRole('textbox', { name: 'Ex: Sac de secours, Matériel médical, etc.' }), 'Coffre arrière');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Sous-section
    await openCollapse(page, 'Coffre arrière');
    await collapse(page, 'Coffre arrière').getByRole('button', { name: '+ Section' }).click();
    await expect(page.getByText('Dans la section : Coffre arrière')).toBeVisible();
    await fillWhenFocused(page.getByRole('textbox', { name: 'Ex: Sac de secours, Matériel médical, etc.' }), 'Bac gauche');
    await page.getByRole('button', { name: 'Créer' }).click();

    // Équipement dans la sous-section
    await openCollapse(page, 'Bac gauche');
    await collapse(page, 'Bac gauche').getByRole('button', { name: '+ Équipement' }).click();
    await fillWhenFocused(page.getByRole('textbox', { name: 'Ex: Stéthoscope, Masque, etc.' }), 'Lance incendie');
    await page.getByLabel('Quantité').fill('2');
    await page.getByRole('button', { name: 'Créer' }).click();

    await expect(collapse(page, 'Bac gauche').getByText('2 Lance incendie')).toBeVisible();
    await expect(collapse(page, 'Coffre arrière').getByText('1 sous-section(s)')).toBeVisible();

    // Visible côté vérification
    await page.getByRole('link', { name: 'Véhicules' }).click();
    await page.locator('.card', { has: page.getByRole('heading', { name: 'FPT E2E' }) }).getByRole('button', { name: 'Vérifier' }).click();
    await expect(page.getByText('0/1 éléments vérifiés')).toBeVisible();
});
