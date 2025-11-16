import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['app.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  minify: true, // Minifier pour réduire la taille
  bundle: true, // Important: bundle tout ensemble pour résoudre les imports
  platform: 'node',
  treeshake: true, // Éliminer le code mort
  external: [
    // Exclure les modules Node.js natifs et les dépendances npm
    'express',
    'cors',
    'dotenv',
    'sequelize',
    'pg',
    'bcrypt',
    'jsonwebtoken',
    'cookie-parser',
    'node-mailjet',
    'morgan',
    'jspdf',
    'jspdf-autotable',
    'moment'
  ],
  esbuildOptions(options) {
    // Résoudre les chemins personnalisés ~/ et ~~/
    options.alias = {
      '~': './src',
      '~~': '.'
    }
  }
})