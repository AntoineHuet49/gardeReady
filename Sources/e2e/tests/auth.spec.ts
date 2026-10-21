import { test, expect } from '@playwright/test';
import { login, ADMIN } from './helpers';

test.describe('Authentification', () => {
    test('un mauvais mot de passe est refusé', async ({ page }) => {
        await login(page, { email: ADMIN.email, password: 'mauvais-mot-de-passe' });
        await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
        await expect(page).toHaveURL('/');
        await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeHidden();
    });

    test("connexion admin puis déconnexion", async ({ page }) => {
        await login(page, ADMIN);
        // Sur desktop, un admin arrive sur le tableau de bord
        await expect(page).toHaveURL('/admin');
        await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

        await page.getByRole('button', { name: 'Déconnexion' }).click();
        await expect(page.getByRole('button', { name: 'Commencer' })).toBeVisible();

        // Session terminée : les pages privées renvoient vers l'accueil
        await page.goto('/vehicules');
        await expect(page).toHaveURL('/');
    });
});
