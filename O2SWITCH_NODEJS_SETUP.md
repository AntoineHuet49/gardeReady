# Configuration O2switch pour Node.js

## ⚠️ Problème actuel
L'API Node.js affiche "Index of" car elle n'est pas exécutée, juste affichée par Apache.

## 🔧 Solutions possibles

### Option 1: Node.js natif O2switch
1. Vérifiez si O2switch supporte Node.js dans votre plan
2. Dans le panel O2switch :
   - Applications Node.js
   - Créer une nouvelle application
   - Répertoire : `/public_html/api/`
   - Point d'entrée : `app.js`
   - Port : `3000`

### Option 2: Configuration manuelle
1. **SSH vers votre serveur** :
   ```bash
   ssh votre-utilisateur@cerisier.o2switch.net
   ```

2. **Démarrer l'API** :
   ```bash
   cd /public_html/api
   npm install --production
   nohup node app.js > api.log 2>&1 &
   ```

3. **Vérifier le processus** :
   ```bash
   ps aux | grep node
   ```

### Option 3: Configuration Apache Proxy
Si Node.js tourne sur un port (ex: 3000), configurer Apache pour proxy :

```apache
# Dans /public_html/.htaccess
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/$1 [P,L]
```

### Option 4: Hébergement alternatif
Si O2switch ne supporte pas Node.js convenablement :
- Déployer seulement le client sur O2switch
- Héberger l'API sur Railway, Render, ou Vercel
- Modifier les URLs dans le client

## 🔍 Diagnostic
1. Vérifiez dans le panel O2switch si Node.js est disponible
2. Consultez la documentation O2switch pour les applications Node.js
3. Contactez le support O2switch si nécessaire

## 📞 Contact O2switch
- Support technique pour vérifier la compatibilité Node.js
- Configuration des applications web dynamiques