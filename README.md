# Guía del Monorepo ReusTech

Este monorepo utiliza **npm workspaces** para gestionar múltiples aplicaciones y paquetes compartidos en un solo repositorio.

## Estructura

- **apps/**: Aplicaciones individuales (`idomenjo`, `inote`, `ireustech`, `itrade`, `iweb`).
- **shared/**: Paquetes reutilizables (`@sergi/ui`, `@sergi/utils`, `@sergi/database`).

## Comandos Esenciales

Siempre ejecuta los comandos **desde la raíz** del proyecto.

### 1. Inicialización

Para instalar todas las dependencias y vincular los paquetes locales:

```bash
npm install
```

### 2. Instalar nuevas dependencias

Para añadir una librería a un proyecto específico (ej. instalar `axios` en `idomenjo`):

```bash
npm install axios -w apps/idomenjo
```
*Para dev dependencies usa `-D` (ej. `npm i -D eslint -w apps/idomenjo`)*

### 3. Ejecutar aplicaciones

Tienes scripts directos en el `package.json` raíz:

```bash
npm run dev:idomenjo
npm run dev:inote
npm run dev:ireustech
npm run dev:itrade
npm run dev:iweb
```

También puedes ejecutar cualquier script definido en una app específica:

```bash
npm run build -w apps/idomenjo
```

## Uso de Paquetes Compartidos

Las aplicaciones pueden importar código de `shared/` directamente como si fueran librerías de npm:

```javascript
import { Button } from '@sergi/ui';
import { formatDate } from '@sergi/utils';
import { connectDB } from '@sergi/database';
```

## Notas Importantes

*   **No ejecutes `npm install` dentro de las carpetas `apps/`**. Hazlo siempre desde la raíz.
*   Si modificas un `package.json` manualmente, ejecuta `npm install` en la raíz para actualizar los enlaces.
