import { test as setup, expect } from '@playwright/test';
import { login, ADMIN, USER } from './helpers';

// Connexion une fois par rôle, session réutilisée via storageState
for (const [name, account] of [['admin', ADMIN], ['user', USER]] as const) {
    setup(`connexion ${name}`, async ({ page }) => {
        await login(page, account);
        await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();
        await page.context().storageState({ path: `.auth/${name}.json` });
    });
}
