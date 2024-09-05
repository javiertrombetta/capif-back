 import js from '@eslint/js';
 import tsPlugin from '@typescript-eslint/eslint-plugin';
 import tsParser from '@typescript-eslint/parser';
 import globals from 'globals';

 export default [
   {
     files: ['**/*.ts'], // Aplica a todos los archivos .ts
     languageOptions: {
       parser: tsParser, // Parser para TypeScript
       sourceType: 'module', // Define que estás usando ESModules
       ecmaVersion: 'latest', // Para usar las características más modernas de ECMAScript
       globals: {
         ...globals.node, // Soporte para variables globales de Node.js
       },
     },
     plugins: {
       '@typescript-eslint': tsPlugin, // Plugin de TypeScript
     },
     rules: {
       'no-console': 'warn', // Advertencia al usar console.log
       semi: ['error', 'always'], // Obligatorio usar punto y coma
       quotes: ['error', 'single'], // Forzar el uso de comillas simples
       '@typescript-eslint/no-unused-vars': 'warn', // Evitar variables sin uso
       '@typescript-eslint/explicit-function-return-type': 'off', // No obligar a definir los tipos de retorno
       '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // Recomendado para usar interfaces en vez de types
     },
   },
   {
     files: ['**/*.js'], // Aplica a todos los archivos .js
     languageOptions: {
       sourceType: 'module', // Define que estás usando ESModules
       ecmaVersion: 'latest', // Para usar las características más modernas de ECMAScript
       globals: {
         ...globals.node, // Soporte para variables globales de Node.js
       },
     },
     rules: {
       'no-console': 'warn', // Advertencia al usar console.log
       semi: ['error', 'always'], // Obligatorio usar punto y coma
       quotes: ['error', 'single'], // Forzar el uso de comillas simples en JS
     },
   },
   {
     files: ['**/*.{js,ts}'], // Reglas aplicadas tanto a archivos JS como TS
     rules: {
       'no-unused-vars': 'warn', // Evitar variables sin uso
       'no-undef': 'error', // Prohibir el uso de variables no definidas
     },
   },
   {
     // Reglas recomendadas para JavaScript según ESLint
     rules: {
       ...js.configs.recommended.rules,
     },
   },
   {
     // Reglas recomendadas para TypeScript según @typescript-eslint
     plugins: {
       '@typescript-eslint': tsPlugin,
     },
     rules: {
       ...tsPlugin.configs.recommended.rules,
     },
   },
 ];