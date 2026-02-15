# Ionic Todo – Prueba Técnica Mobile

Aplicación híbrida desarrollada con Ionic + Angular + Cordova, que permite la gestión de tareas (To-Dos) y categorías, implementando validaciones, feature flags y optimizaciones de rendimiento.

---

## Stack Tecnológico
- Angular (Standalone Components)
- Ionic Framework
- Cordova
- TypeScript
- Zod (validación de dominio)
- RxJS
- Local Storage (Storage abstraction)
- SASS
- Firebase Remote Config (feature flag preparado)

---

## Requisitos Previos

1. Node

```bash
node -v
# v20.x
```

2. Ionic CLI

```bash
npm install -g @ionic/cli
```

3. Cordova

```bash
npm install -g cordova
```

4. Xcode (para iOS)

Instalar desde App Store.

---

## Instalación del Proyecto

```bash
git clone https://github.com/robalexlimas/ionic-todo.git
cd ionic-todo
npm install
```

---

## Ejecutar en Navegador (Angular + Ionic)

```bash
ionic serve
```

La aplicación estará disponible en:

```bash
http://localhost:8100
```

---

## Arquitectura

El proyecto sigue una arquitectura modular basada en:

```
src/
 ├── app/
 │    ├── core/
 │    ├── features/
 │    │     ├── todos/
 │    │     └── categories/
 │    ├── shared/
 │    │     ├── models/
 │    │     ├── validators/
 │    │     └── utils/
 │    └── tabs/
```

Principios aplicados:
- Separación por features
- Repositories desacoplados del almacenamiento
- Validación en capa de dominio (Zod)
- ChangeDetectionStrategy.OnPush
- trackBy en listas
- Feature Flags desacoplados
- Debounce en persistencia

---

## Funcionalidades Implementadas

1. To-Dos
- Crear tarea
- Editar tarea
- Eliminar tarea
- Marcar como completada
- Asignar categoría
- Filtro por categoría
- Validación contra duplicados

2. Categorías
- Crear categoría
- Editar categoría
- Eliminar categoría
- Validación contra duplicados
- Limpieza automática de tareas al eliminar categoría

---

## Validaciones (Zod)

Se implementaron schemas con Zod para garantizar reglas de negocio:
- Longitud mínima de título
- No permitir duplicados por categoría
- Validación de categoría opcional

Ejemplo:

```js
todoCreateSchema.safeParse({...})
```

---

## Feature Flags


Se implementó ``ff_categories`` para habilitar/deshabilitar:
- Selector de categoría
- Filtro por categoría
- Tab de categorías

La aplicación incluye:
- Servicio RemoteConfig
- Fallback a mock flags
- Diseño preparado para Firebase Remote Config

---

## Optimizaciones de Performance
1.	Debounce en escritura a storage (350ms)
2.	Uso de trackBy
3.	ChangeDetectionStrategy.OnPush
4.	Eliminación de renders innecesarios
5.	Snapshot cacheado en repositorios

---

# Build iOS (Dispositivo Real)

1. Agregar plataforma

```bash
npx cordova platform add ios
```

2. Build Web

```bash
npm run build
npx cordova prepare ios
```

3. Abrir en Xcode

```bash
open platforms/ios/App.xcworkspace
```

4. Configurar Signing

En Xcode:
- Target → App
- Signing & Capabilities
- Automatically manage signing ✅
- Team → Personal Team
- Bundle Identifier único


4. Ejecutar en iPhone
- Conectar iPhone
- Seleccionarlo como destino
- Run ▶️

---

## Generar IPA (Release)

Desde Xcode:
1.	Product → Archive
2.	Organizer → Distribute App
3.	Development
4.	Export

O vía CLI:
```bash
npx cordova build ios --release --device -- --buildFlag="-allowProvisioningUpdates"
```

---

# Android

Agregar plataforma:

```bash
npx cordova platform add android
```

Build:

```bash
npm run build
npx cordova build android --release
```

APK generado en:

```
platforms/android/app/build/outputs/apk/release/
```

---

## Configuración Firebase

El proyecto está preparado para Remote Config.

Environments incluyen placeholder:

firebaseConfig: {}

Para usar Remote Config real:
1.	Crear proyecto Firebase
2.	Agregar Web App
3.	Copiar configuración
4.	Reemplazar en ```environment.ts```

---

## Testing Manual

Probar:
- Crear tarea sin categoría
- Crear tarea con categoría
- Duplicar tarea (debe mostrar error)
- Eliminar categoría (tareas quedan sin categoría)
- Activar/desactivar feature flag

---

📌 Preguntas Técnicas

¿Cómo mejorarías la aplicación?
- Agregar estado global (NgRx)
- Tests unitarios
- Persistencia remota

¿Cómo manejarías múltiples features flags?
- Servicio centralizado
- Observables combinados
- Guards por ruta
