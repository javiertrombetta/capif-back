# Guía de Contribución

Gracias por considerar contribuir a este proyecto. A continuación se describen las reglas y las convenciones que debes seguir al enviar cambios.

## Mensajes de Commit

Para garantizar consistencia en el historial de Git y en la generación automática de changelogs, es importante seguir un formato estándar para los mensajes de commit. El formato que usamos es el siguiente:

```bash
<tipo>(<opcional-scope>): <descripción corta>
```

### Tipos de commit:

- **feat:** Añadir una nueva funcionalidad. Ejemplo: `feat: agregar funcionalidad de búsqueda`
- **fix:** Corregir un bug o error. Ejemplo: `fix: solucionar error en la validación de entrada`
- **docs:** Cambios o mejoras en la documentación. Ejemplo: `docs: actualizar el README con nuevos ejemplos`
- **style:** Cambios en el estilo del código (espaciado, formato, etc.) que no afectan la funcionalidad. Ejemplo: `style: formatear código según ESLint`
- **refactor:** Cambios en el código que no corrigen un error ni añaden una funcionalidad. Ejemplo: `refactor: mejorar la estructura del componente`
- **test:** Añadir o corregir tests. Ejemplo: `test: agregar tests para la función login`
- **chore:** Actualización de herramientas, dependencias, o tareas de mantenimiento. Ejemplo: `chore: actualizar dependencias`

### Reglas adicionales:

- El commit debe ser breve y descriptivo (máximo 50 caracteres).
- Si el commit introduce un cambio significativo, asegúrate de incluir la palabra clave `(MAJOR)` o `(MINOR)` en el cuerpo del commit, para reflejar el cambio en el versionado semántico.
- Usa `git rebase` para organizar los commits antes de enviar un Pull Request.

### Ejemplos:

- feat(auth): agregar autenticación de dos factores
- fix: corregir error en la función de logout
- docs: mejorar la sección de instalación en README



---

Si tienes preguntas sobre cómo contribuir, por favor abre un issue o consulta con el equipo del proyecto.
