import { configDotenv } from 'dotenv';

// Doit être importé en tout premier dans app.ts (avant tout autre import local) : les imports
// ES sont hissés et exécutés dans leur ordre d'écriture avant le reste du fichier, donc tout
// module qui lit process.env au chargement (routes.ts, AzureAuth.ts, Database.ts...) a besoin
// que ce fichier ait déjà tourné.
configDotenv({ path: '.env', override: true });
configDotenv({ path: '.env.local', override: true });
