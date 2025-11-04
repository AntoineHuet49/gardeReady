#!/usr/bin/env node

// Script pour générer un hash de mot de passe bcrypt
// Usage: node generate-password-hash.js "VotreMotDePasse"

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
    console.log('Usage: node generate-password-hash.js "VotreMotDePasse"');
    process.exit(1);
}

const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Erreur lors de la génération du hash:', err);
        process.exit(1);
    }
    
    console.log('Mot de passe:', password);
    console.log('Hash bcrypt:', hash);
    console.log('\nVous pouvez utiliser ce hash dans votre script SQL:');
    console.log(`INSERT INTO users (email, password, firstname, lastname, role) VALUES`);
    console.log(`('admin@gardeready.com', '${hash}', 'Admin', 'GardeReady', 'admin');`);
});