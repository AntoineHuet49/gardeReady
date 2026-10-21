import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '~~/Repositories/UsersRepository';
import { GardesRepository } from '~~/Repositories/GardeRepository';
import { UsersServices } from '~~/Services/UsersServices';

vi.mock('~~/Repositories/UsersRepository', () => ({
    UsersRepository: {
        getAllUsers: vi.fn(),
        getAllUsersExcludingSuperAdmin: vi.fn(),
        checkEmailExists: vi.fn(),
        createUser: vi.fn(),
        updateUserRole: vi.fn(),
        getOneUserById: vi.fn(),
        updateUser: vi.fn(),
        updateUserGarde: vi.fn(),
        deleteUser: vi.fn(),
    },
}));
vi.mock('~~/Repositories/GardeRepository', () => ({
    GardesRepository: { getOneById: vi.fn(), UpdateResponsable: vi.fn() },
}));

const users = vi.mocked(UsersRepository);
const gardes = vi.mocked(GardesRepository);
const agent = { id: 3, email: 'a@sdis49.fr', firstname: 'A', lastname: 'B', role: 'user', garde_id: 1, azure_oid: null };
const superAdmin = { ...agent, id: 9, role: 'superAdmin' };
const dto = { email: 'a@sdis49.fr', firstname: 'A', lastname: 'B' };

beforeEach(() => vi.clearAllMocks());

describe('getAllUsers', () => {
    it('un superAdmin voit tous les comptes', async () => {
        await UsersServices.getAllUsers('superAdmin');
        expect(users.getAllUsers).toHaveBeenCalled();
        expect(users.getAllUsersExcludingSuperAdmin).not.toHaveBeenCalled();
    });

    it('un admin ne voit pas les superAdmin', async () => {
        await UsersServices.getAllUsers('admin');
        expect(users.getAllUsersExcludingSuperAdmin).toHaveBeenCalled();
        expect(users.getAllUsers).not.toHaveBeenCalled();
    });
});

describe('createUser', () => {
    it('crée le compte si l’email est libre', async () => {
        users.checkEmailExists.mockResolvedValue(false);
        users.createUser.mockResolvedValue(agent);
        const result = await UsersServices.createUser({ ...dto, role: 'user' });
        expect(result).toMatchObject({ success: true, data: agent });
    });

    it('refuse un email déjà utilisé', async () => {
        users.checkEmailExists.mockResolvedValue(true);
        const result = await UsersServices.createUser({ ...dto, role: 'user' });
        expect(result).toMatchObject({ success: false, message: 'Cet email est déjà utilisé' });
        expect(users.createUser).not.toHaveBeenCalled();
    });

    it('transforme une erreur du repository en échec', async () => {
        users.checkEmailExists.mockRejectedValue(new Error('db'));
        expect((await UsersServices.createUser({ ...dto, role: 'user' })).success).toBe(false);
    });
});

describe('updateUserRole', () => {
    it('refuse un rôle inconnu', async () => {
        expect(await UsersServices.updateUserRole(3, 'chef', 'admin')).toMatchObject({ success: false, message: 'Rôle invalide' });
    });

    it('seul un superAdmin peut promouvoir superAdmin', async () => {
        expect((await UsersServices.updateUserRole(3, 'superAdmin', 'admin')).success).toBe(false);
        users.updateUserRole.mockResolvedValue({ ...agent, role: 'superAdmin' });
        expect((await UsersServices.updateUserRole(3, 'superAdmin', 'superAdmin')).success).toBe(true);
    });

    it('échoue si l’utilisateur n’existe pas', async () => {
        users.updateUserRole.mockResolvedValue(null);
        expect(await UsersServices.updateUserRole(99, 'admin', 'admin')).toMatchObject({ success: false, message: 'Utilisateur non trouvé' });
    });
});

describe('updateUser', () => {
    it('met à jour un compte', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        users.checkEmailExists.mockResolvedValue(false);
        users.updateUser.mockResolvedValue({ ...agent, firstname: 'Z' });
        const result = await UsersServices.updateUser(3, dto, 'admin');
        expect(result.success).toBe(true);
        expect(users.checkEmailExists).toHaveBeenCalledWith(dto.email, 3);
    });

    it('un admin ne peut pas modifier un superAdmin', async () => {
        users.getOneUserById.mockResolvedValue(superAdmin);
        expect((await UsersServices.updateUser(9, dto, 'admin')).success).toBe(false);
        expect(users.updateUser).not.toHaveBeenCalled();
    });

    it('refuse un email pris par un autre compte', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        users.checkEmailExists.mockResolvedValue(true);
        expect((await UsersServices.updateUser(3, dto, 'admin')).message).toBe('Cet email est déjà utilisé');
    });
});

describe('updateUserGarde', () => {
    it('change de garde et retire le rôle de responsable de l’ancienne garde', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        gardes.getOneById.mockImplementation(async (id: number) => ({ id, numero: id, color: 'x', responsable: id === 1 ? 3 : null }));
        users.updateUserGarde.mockResolvedValue({ ...agent, garde_id: 2 });

        const result = await UsersServices.updateUserGarde(3, 2, 'admin');

        expect(result.success).toBe(true);
        expect(gardes.UpdateResponsable).toHaveBeenCalledWith(1, null);
    });

    it('ne touche pas au responsable si l’agent ne l’était pas', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        gardes.getOneById.mockResolvedValue({ id: 1, numero: 1, color: 'x', responsable: 42 });
        users.updateUserGarde.mockResolvedValue({ ...agent, garde_id: null });
        await UsersServices.updateUserGarde(3, null, 'admin');
        expect(gardes.UpdateResponsable).not.toHaveBeenCalled();
    });

    it('échoue si la garde cible n’existe pas', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        gardes.getOneById.mockResolvedValue(undefined);
        expect(await UsersServices.updateUserGarde(3, 99, 'admin')).toMatchObject({ success: false, message: 'Garde non trouvée' });
    });

    it('un admin ne peut pas déplacer un superAdmin', async () => {
        users.getOneUserById.mockResolvedValue(superAdmin);
        expect((await UsersServices.updateUserGarde(9, 1, 'admin')).success).toBe(false);
    });
});

describe('deleteUser', () => {
    it('interdit de supprimer son propre compte', async () => {
        const result = await UsersServices.deleteUser(3, 3, 'admin');
        expect(result.success).toBe(false);
        expect(users.deleteUser).not.toHaveBeenCalled();
    });

    it('un admin ne peut pas supprimer un superAdmin', async () => {
        users.getOneUserById.mockResolvedValue(superAdmin);
        expect((await UsersServices.deleteUser(9, 1, 'admin')).success).toBe(false);
    });

    it('supprime un compte existant', async () => {
        users.getOneUserById.mockResolvedValue(agent);
        users.deleteUser.mockResolvedValue(true);
        expect((await UsersServices.deleteUser(3, 1, 'admin')).success).toBe(true);
    });

    it('échoue pour un compte inconnu', async () => {
        users.getOneUserById.mockResolvedValue(undefined);
        expect((await UsersServices.deleteUser(99, 1, 'admin')).message).toBe('Utilisateur non trouvé');
    });
});
