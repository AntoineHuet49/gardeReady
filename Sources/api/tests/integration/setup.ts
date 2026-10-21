import { afterAll } from 'vitest';
import { dbContext } from '~~/Utils/Database';

// Chaque fichier de test ouvre son propre pool Sequelize (modules isolés) : on le ferme en fin de fichier
afterAll(() => dbContext.close());
