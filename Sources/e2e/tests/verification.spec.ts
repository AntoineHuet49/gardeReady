import { test, expect } from '@playwright/test';
import { userState, openCollapse, sentMails } from './helpers';

test.use({ storageState: userState });

test("vérification complète d'un véhicule et envoi du rapport PDF", async ({ page }) => {
    await page.goto('/vehicules');
    await page.locator('.card', { has: page.getByRole('heading', { name: 'Camion de pompier' }) }).getByRole('button', { name: 'Vérifier' }).click();
    await expect(page.getByRole('heading', { name: 'CAMION DE POMPIER' })).toBeVisible();

    for (const section of ['Compartiment principal', 'Tiroir gauche', 'Tiroir droit']) await openCollapse(page, section);

    const valider = page.getByRole('button', { name: 'Valider' });
    await expect(valider).toBeDisabled();

    for (const ok of await page.getByRole('radio', { name: 'OK' }).all()) await ok.check();
    // Un élément KO exige un commentaire (premier élément : Extincteur, dans le tiroir gauche)
    await page.getByRole('radio', { name: 'KO' }).first().check();
    await page.getByRole('textbox', { name: 'Commentaire pour Extincteur' }).fill('Manomètre dans le rouge');
    await expect(page.getByText('2/2 éléments vérifiés')).toBeVisible();

    const before = (await sentMails()).length;
    await valider.click();
    await expect(page.getByText('Verifications envoyées')).toBeVisible();
    await expect(page).toHaveURL('/vehicules');

    // Le rapport PDF part par e-mail au responsable de la garde de l'agent (Garde 1 : admin)
    const mails = await sentMails();
    expect(mails).toHaveLength(before + 1);
    const mail = mails.at(-1)!;
    expect(mail.To[0].Email).toBe('admin@gardeready.com');
    expect(mail.Subject).toBe('Rapport de vérification - Camion de pompier');
    const attachment = mail.Attachments![0];
    expect(attachment.Filename).toMatch(/^Verif_.*\.pdf$/);
    const pdf = Buffer.from(attachment.Base64Content, 'base64').toString('latin1');
    expect(pdf.startsWith('%PDF-')).toBe(true);
    for (const text of ['Extincteur', 'Trousse de secours', 'KO', 'OK']) expect(pdf).toContain(text);
});
