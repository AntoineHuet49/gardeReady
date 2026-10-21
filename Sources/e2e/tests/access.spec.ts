import { test, expect } from '@playwright/test';
import { userState } from './helpers';

test.use({ storageState: userState });

test("un utilisateur simple n'accède pas à l'administration", async ({ page }) => {
    await page.goto('/vehicules');
    await expect(page.getByRole('heading', { name: 'Véhicules' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Admin' })).toHaveCount(0);

    // Accès direct à l'URL : redirection vers les véhicules
    await page.goto('/admin');
    await expect(page).toHaveURL('/vehicules');
    await expect(page.getByRole('tab', { name: 'Gardes' })).toHaveCount(0);

    // L'API refuse aussi les routes admin
    expect((await page.request.get('/api/users')).status()).toBe(403);
    expect((await page.request.post('/api/vehicules', { data: { name: 'Interdit' } })).status()).toBe(403);
});
