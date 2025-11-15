#!/bin/bash

# Script template pour configurer les secrets GitHub pour O2switch
# 🔒 SÉCURISÉ : Ce template ne contient pas de vraies valeurs

echo "🔐 Configuration des secrets GitHub pour O2switch"
echo ""
echo "📋 Ajoutez ces secrets dans GitHub Settings → Secrets → Actions :"
echo ""

echo "### 🌐 Connexion FTP O2switch"
echo "FTP_SERVER=votre-serveur-ftp.o2switch.net"
echo "FTP_USERNAME=votre-nom-utilisateur-ftp"
echo "FTP_PASSWORD=votre-mot-de-passe-ftp"
echo ""

echo "### 🗄️ Base de données O2switch"
echo "DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/nom_base"
echo ""

echo "### 🔑 Application"
# Générer un JWT secret aléatoire
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
echo "JWT_SECRET=$JWT_SECRET"
echo "API_URL=https://verifeu.fr/api"
echo "FRONTEND_URL=https://verifeu.fr"
echo ""

echo "### 📧 Email Mailjet"
echo "MAILJET_API_KEY=votre-clé-api-mailjet"
echo "MAILJET_SECRET_KEY=votre-clé-secrète-mailjet"
echo ""

echo "🚀 Instructions :"
echo "1. Allez sur GitHub : https://github.com/AntoineHuet49/gardeReady/settings/secrets/actions"
echo "2. Cliquez 'New repository secret' pour chaque secret"
echo "3. Copiez-collez le nom et la valeur"
echo "4. Votre domaine verifeu.fr est déjà configuré"
echo "5. Configurez votre base de données dans le panel O2switch"
echo ""
echo "✅ Une fois configuré, pushez sur main pour déclencher le déploiement !"