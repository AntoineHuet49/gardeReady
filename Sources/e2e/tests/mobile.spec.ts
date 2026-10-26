import { test, expect } from '@playwright/test';
import { login, ADMIN, userState, openCollapse } from './helpers';

test.describe('Mobile', () => {
    test("un admin connecté sur mobile arrive sur les véhicules, pas sur l'admin", async ({ page }) => {
        await login(page, ADMIN);
        await expect(page).toHaveURL('/vehicules');
        await expect(page.getByRole('link', { name: 'Admin' })).toBeHidden();
    });

    test.describe(() => {
        test.use({ storageState: userState });

        test("vérification d'un véhicule sur mobile", async ({ page }) => {
            await page.goto('/vehicules');
            await page.locator('.card', { has: page.getByRole('heading', { name: 'VSAV' }) }).getByRole('button', { name: 'Vérifier' }).tap();

            for (const section of ['Sac prompt secours', 'Poche bleue', 'Poche rouge', 'Extérieur']) await openCollapse(page, section);
            for (const ok of await page.getByRole('radio', { name: 'OK' }).all()) await ok.tap();
            await expect(page.getByText('4/4 éléments vérifiés')).toBeVisible();

            // Le bouton Valider reste accessible (barre collante en bas d'écran)
            const valider = page.getByRole('button', { name: 'Valider' });
            await expect(valider).toBeInViewport();
            await valider.tap();
            await expect(page.getByText('Verifications envoyées')).toBeVisible();
            await expect(page).toHaveURL('/vehicules');
        });
    });
});
