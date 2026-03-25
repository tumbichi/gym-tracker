# Guía de Tests E2E con Playwright

Este documento describe cómo ejecutar y gestionar los tests End-to-End (E2E) del proyecto `gym-tracker` utilizando Playwright.

## Requisitos

Asegúrate de tener las dependencias instaladas:

```bash
pnpm install
```

## Ejecutar el Servidor de Desarrollo

Los tests E2E se ejecutan contra una instancia de la aplicación en ejecución. Antes de ejecutar los tests, asegúrate de que el servidor de desarrollo de Next.js esté activo:

```bash
pnpm dev
```

El servidor debe estar accesible en `http://localhost:3000`. La configuración de Playwright (`playwright.config.ts`) está diseñada para iniciar automáticamente este servidor si no está ya en ejecución.

## Ejecutar Tests E2E

Puedes ejecutar los tests de varias maneras:

### Modo Headless (por defecto)

Para ejecutar todos los tests E2E en modo headless (sin abrir un navegador visual), usa el siguiente comando:

```bash
pnpm test:e2e
```

### Modo UI (con interfaz de usuario)

Para ejecutar los tests y ver la interfaz de usuario de Playwright, que permite inspeccionar los tests, depurar y ver los resultados en tiempo real, usa:

```bash
pnpm test:e2e:ui
```

### Ejecutar Tests Específicos

Puedes ejecutar un archivo de test específico o un test individual.

-   **Archivo específico:**
    ```bash
    pnpm test:e2e tests/e2e/log-workout.spec.ts
    ```
-   **Test individual (usando `.only`):**
    Edita el archivo de test y añade `.only` a la descripción del test que quieres ejecutar:
    ```typescript
    test.only('should persist draft workout session after reload', async ({ page }) => {
      // ...
    });
    ```
    Luego, ejecuta `pnpm test:e2e`.

### Generar Reportes HTML

Después de cada ejecución de tests, Playwright genera un reporte HTML interactivo. Puedes abrirlo con:

```bash
pnpm playwright show-report
```

Este reporte se guarda en la carpeta `playwright-report/`.

## Estructura de los Tests

Los tests E2E siguen el patrón Page Object Model (POM) y se encuentran en la carpeta `tests/e2e/`.

-   **`tests/e2e/pages/`**: Contiene los Page Objects, que encapsulan las interacciones y selectores de una página o componente específico. Por ejemplo, `WorkoutSessionPage.ts` maneja las interacciones con la página de registro de entrenamiento.
-   **`tests/e2e/*.spec.ts`**: Contiene los archivos de tests que utilizan los Page Objects para definir los flujos de usuario.

## Consideraciones

-   **`data-test-id`**: Los selectores en los Page Objects (`tests/e2e/pages/WorkoutSessionPage.ts`) utilizan atributos `data-test-id` para mayor robustez. Es crucial que los componentes de la aplicación incluyan estos atributos para que los tests funcionen correctamente.
-   **Base URL**: Los tests asumen que la aplicación se ejecuta en `http://localhost:3000`. Si tu entorno de desarrollo usa un puerto diferente, ajusta `baseURL` en `playwright.config.ts`.
