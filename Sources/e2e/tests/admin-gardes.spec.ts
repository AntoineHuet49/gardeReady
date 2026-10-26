import { test, expect } from '@playwright/test';
import { adminState, sentMails } from './helpers';

test.use({ storageState: adminState });

test("l'admin crée une garde, y affecte un utilisateur et le nomme responsable", async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Gardes' }).click();

    // Création de la garde
    await page.getByRole('button', { name: '+ Ajouter une garde' }).click();
    const gardeDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Ajouter une garde' }) });
    await gardeDialog.getByRole('textbox', { name: 'Numéro de la garde' }).fill('7');
    await gardeDialog.getByRole('textbox', { name: 'Couleur (ex: Rouge, Bleu...)' }).fill('Bleu');
    await gardeDialog.getByRole('button', { name: 'Ajouter' }).click();
    await expect(gardeDialog).toBeHidden();

    const card = page.locator('.card', { has: page.getByRole('heading', { name: 'Garde 7', exact: true }) });
    await expect(card.getByText('Aucun membre dans cette garde')).toBeVisible();

    // Création d'un utilisateur directement affecté à la garde 7
    await page.getByRole('button', { name: '+ Ajouter un utilisateur' }).click();
    const userDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Ajouter un utilisateur' }) });
    await userDialog.getByRole('textbox', { name: 'E-mail' }).fill('paul.martin@sdis49.fr');
    await userDialog.getByRole('textbox', { name: 'Prénom' }).fill('Paul');
    await userDialog.getByRole('textbox', { name: 'Nom', exact: true }).fill('Martin');
    await userDialog.getByRole('combobox', { name: 'Garde' }).selectOption('Garde 7');
    await userDialog.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByText('un e-mail lui a été envoyé pour définir son mot de passe')).toBeVisible();
    const member = card.getByRole('listitem').filter({ hasText: 'Paul Martin' });
    await expect(member).toBeVisible();
    // L'invitation est partie (faux Mailjet)
    expect((await sentMails()).some((m) => m.To[0].Email === 'paul.martin@sdis49.fr')).toBe(true);

    // Nomination comme responsable
    await card.getByLabel('Responsable :').selectOption('Paul Martin');
    await expect(member.getByText('Responsable', { exact: true })).toBeVisible();

    // Persisté côté serveur
    await page.reload();
    await page.getByRole('tab', { name: 'Gardes' }).click();
    await expect(card.getByLabel('Responsable :').locator('option:checked')).toHaveText('Paul Martin');
});
