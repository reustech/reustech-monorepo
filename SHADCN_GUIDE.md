# Guía de Integración de Shadcn/UI en el Monorepo

Para garantizar la consistencia de diseño y evitar duplicación de código, implementamos **shadcn/ui** de forma centralizada en el paquete `@sergi/ui`.

## Estrategia

1.  **Código Centralizado**: Los componentes (Button, Input, etc.) residen físicamente en `shared/ui`.
2.  **Consumo**: Las aplicaciones (`apps/*`) importan estos componentes desde `@sergi/ui`.
3.  **Estilos**: Cada aplicación compila el CSS final, pero su configuración de Tailwind debe "vigilar" la carpeta compartida.

---

## 1. Configuración del Entorno

El paquete `shared/ui` ya está preconfigurado con `components.json` para soportar el CLI de shadcn.

Si necesitas instalar dependencias manualmente:
```bash
# Desde la raíz
npm install class-variance-authority clsx tailwind-merge lucide-react -w shared/ui
```

## 2. Añadir Componentes

Tienes dos formas de hacerlo: usando el CLI (recomendado) o manualmente.

### Opción A: Usando el CLI (Recomendado)

El CLI está configurado para trabajar dentro de la carpeta `shared/ui`.

1.  Muevete al directorio del paquete UI:
    ```bash
    cd shared/ui
    ```
2.  Ejecuta el comando de shadcn estándar:
    ```bash
    npx shadcn-ui@latest add dialog
    ```
    *Esto descargará el componente en `components/` e instalará sus dependencias.*

3.  **Importante:** Exporta el nuevo componente en `index.js` para hacerlo público:
    ```javascript
    // shared/ui/index.js
    export * from "./components/dialog";
    ```

### Opción B: Método Manual

1.  Copia el código del componente (desde la web de shadcn) dentro de `shared/ui/components/`.
2.  Asegúrate de que las importaciones de `cn` sean correctas (`../../lib/utils`).
3.  Exporta el componente en `shared/ui/index.js`.

## 3. Configuración de Tailwind en las Apps (CRÍTICO)

Para que los estilos se apliquen, el Tailwind de cada aplicación debe escanear los archivos del paquete compartido.

Edita el archivo `tailwind.config.js` en **CADA aplicación** (`apps/idomenjo`, `apps/inote`, etc.):

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // 👇 AÑADIR ESTA LÍNEA OBLIGATORIAMENTE
    "../../shared/ui/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 4. Uso en las Aplicaciones

Simplemente importa el componente desde el paquete compartido:

```javascript
import { Button, Card, CardTitle } from "@sergi/ui";

export default function MiPagina() {
  return (
    <Card>
      <CardTitle>Hola Mundo</CardTitle>
      <Button variant="destructive">Acción</Button>
    </Card>
  )
}
```
