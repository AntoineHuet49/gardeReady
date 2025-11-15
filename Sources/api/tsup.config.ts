import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['app.ts'],
  format: ['cjs'],
  target: 'node16',
  clean: true,
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  minify: false,
  bundle: true, // Important: bundle tout ensemble pour résoudre les imports
  platform: 'node',
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
    'morgan'
  ],
  esbuildOptions(options) {
    // Résoudre les chemins personnalisés ~/ et ~~/
    options.alias = {
      '~': './src',
      '~~': '.'
    }
  }
})