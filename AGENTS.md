# AGENTS.md --- Reglas permanentes del proyecto

## Contexto

Frontend web de un sistema de videovigilancia inteligente. La aplicación
web se desarrolla primero; la aplicación móvil React Native + Expo se
abordará después y consumirá la misma API.

## Stack obligatorio

-   React
-   TypeScript
-   Vite, si ya forma parte del repositorio
-   Tailwind CSS, respetando la versión instalada
-   TailAdmin como plantilla y biblioteca visual principal

## Reglas de implementación

1.  Antes de cambiar código, inspecciona los archivos, las dependencias
    y la estructura reales del proyecto.
2.  Reutiliza primero componentes, layouts, utilidades, iconos, tokens y
    patrones que ya existan en TailAdmin.
3.  Antes de crear un componente visual nuevo, busca si TailAdmin ya
    tiene uno adecuado.
4.  No reemplaces TailAdmin por otra biblioteca visual.
5.  No incorpores Bootstrap, Material UI, Chakra ni otra biblioteca que
    duplique la función de TailAdmin.
6.  Respeta la versión y configuración instalada de Tailwind CSS. No
    migres versiones ni sobrescribas tokens/presets sin necesidad
    técnica demostrada.
7.  No agregues ni elimines dependencias sin justificarlo.
8.  No inventes scripts, archivos, componentes, endpoints ni resultados
    de pruebas.
9.  Mantén cada cambio acotado a la especificación solicitada.
10. Distingue siempre datos simulados de datos reales.
11. No implementes backend, cámaras reales, persistencia, autenticación
    ni YOLO antes de que una especificación lo solicite.
12. No guardes credenciales ni secretos en el frontend.
13. Usa componentes tipados, nombres consistentes y código mantenible;
    evita duplicación innecesaria.
14. Sigue las convenciones del repositorio existente cuando no
    contradigan estos requisitos.
15. Ejecuta las comprobaciones pertinentes y comunica solo resultados
    realmente verificados.

## Flujo obligatorio por tarea

1.  Leer esta guía y la especificación indicada.
2.  Inspeccionar el código y los componentes de TailAdmin relevantes.
3.  Identificar los archivos que se modificarán.
4.  Implementar únicamente la tarea solicitada.
5.  Ejecutar lint, typecheck, tests o build solo si existen los scripts
    correspondientes.
6.  Informar cambios, archivos afectados, verificaciones ejecutadas,
    resultados y pendientes.

## Documentación

Las especificaciones están en `docs/especificaciones/`. Implementa una
especificación por vez. No avances automáticamente a la siguiente.
