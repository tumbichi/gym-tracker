# Checklist de Implementación: Pipeline CI/CD en GitHub Actions

Este documento detalla las tareas necesarias para implementar el pipeline de Integración Continua y Despliegue Continuo (CI/CD) utilizando GitHub Actions, según el diseño técnico (`RFC`) proporcionado.

**Archivo a crear/modificar:** `.github/workflows/ci.yml`

## 🚀 Tareas Generales del Workflow

- [ ] Crear el archivo `.github/workflows/ci.yml`.
- [ ] Configurar los `triggers` para `push` a la rama `main` y `pull_request` a la rama `main`.
- [ ] Implementar la estrategia de `concurrency` para cancelar ejecuciones en progreso para el mismo PR/rama.

## 🧹 Job 1: `lint`

- [ ] Definir el job `lint` en `.github/workflows/ci.yml`.
- [ ] Configurar el job para que se ejecute en paralelo.
- [ ] Añadir un paso para configurar `pnpm` y su caché.
    - [ ] Usar `actions/setup-node@v4` con `pnpm` como `package-manager`.
    - [ ] Configurar `cache: 'pnpm'`.
- [ ] Añadir un paso para instalar dependencias con `pnpm install --frozen-lockfile`.
- [ ] Añadir un paso para ejecutar `pnpm lint`.
- [ ] Añadir un paso para ejecutar `pnpm prettier:check`.
- [ ] **Optimización:** Configurar `lint` y `prettier:check` para que solo se ejecuten sobre archivos modificados en el PR/push. (Esto puede requerir un script adicional o una acción de GitHub).

## 📦 Job 2: `build`

- [ ] Definir el job `build` en `.github/workflows/ci.yml`.
- [ ] Configurar el job para que se ejecute en paralelo.
- [ ] Añadir un paso para configurar `pnpm` y su caché.
    - [ ] Usar `actions/setup-node@v4` con `pnpm` como `package-manager`.
    - [ ] Configurar `cache: 'pnpm'`.
- [ ] Añadir un paso para instalar dependencias con `pnpm install --frozen-lockfile`.
- [ ] Añadir un paso para ejecutar `pnpm build`.
- [ ] Añadir un paso para subir el directorio `.next` como un artefacto (`actions/upload-artifact@v4`).
    - [ ] `name: next-build-artifact`
    - [ ] `path: .next`

## 🧪 Job 3: `e2e-tests`

- [ ] Definir el job `e2e-tests` en `.github/workflows/ci.yml`.
- [ ] Configurar la dependencia del job `build` (`needs: build`).
- [ ] Añadir un paso para configurar `pnpm` y su caché.
    - [ ] Usar `actions/setup-node@v4` con `pnpm` como `package-manager`.
    - [ ] Configurar `cache: 'pnpm'`.
- [ ] Añadir un paso para instalar dependencias con `pnpm install --frozen-lockfile`.
- [ ] Añadir un paso para descargar el artefacto del `build` (`actions/download-artifact@v4`).
    - [ ] `name: next-build-artifact`
    - [ ] `path: .next`
- [ ] Añadir un paso para ejecutar `pnpm test:e2e`.

## 🚀 Job 4: `deploy`

- [ ] Definir el job `deploy` en `.github/workflows/ci.yml`.
- [ ] Configurar la condición para que solo se ejecute en `push` a `main`.
- [ ] Configurar las dependencias de los jobs `lint` y `e2e-tests` (`needs: [lint, e2e-tests]`).
- [ ] Añadir un paso para configurar `pnpm` y su caché.
    - [ ] Usar `actions/setup-node@v4` con `pnpm` como `package-manager`.
    - [ ] Configurar `cache: 'pnpm'`.
- [ ] Añadir un paso para instalar dependencias con `pnpm install --frozen-lockfile`.
- [ ] Añadir un paso para ejecutar las migraciones de base de datos con `pnpx prisma migrate deploy`.
- [ ] Añadir un paso para desplegar a Vercel utilizando la Vercel CLI.
    - [ ] `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}`
    - [ ] `vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}`
    - [ ] `vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}`

## 🔒 Configuración de Secrets de GitHub

- [ ] Configurar los siguientes secrets en el repositorio de GitHub (Settings -> Secrets and variables -> Actions):
    - `VERCEL_ORG_ID`
    - `VERCEL_PROJECT_ID`
    - `VERCEL_TOKEN`
