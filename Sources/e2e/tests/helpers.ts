import { Page } from '@playwright/test';

// Comptes du jeu de données Sources/database/initdb/init.sql
export const ADMIN = { email: 'admin@gardeready.com', password: 'AdminReady2024!' };
export const USER = { email: 'user@sdis49.fr', password: 'User123!' };

export async function login(page: Page, { email, password }: { email: string; password: string }) {
    await page.goto('/');
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Connexion', exact: true }).click();
}

export const adminState = '.auth/admin.json';
export const userState = '.auth/user.json';

// Bloc repliable (Collapse) : région nommée par le titre, visible une fois le bloc ouvert.
export const collapse = (page: Page, title: string) => page.getByRole('region', { name: title, exact: true });

export async function openCollapse(page: Page, title: string) {
    const header = page.getByRole('button', { name: title, exact: true });
    if ((await header.getAttribute('aria-expanded')) !== 'true') await header.click();
}

// Messages reçus par le faux Mailjet (voir global-setup.ts)
export type MailjetMessage = {
    To: { Email: string }[];
    Subject: string;
    Attachments?: { Filename: string; Base64Content: string }[];
};
export async function sentMails(): Promise<MailjetMessage[]> {
    return (await fetch('http://localhost:3101/messages')).json();
}
