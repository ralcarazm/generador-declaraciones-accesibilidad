# Generador de declaraciones de accesibilidad

Herramienta para redactar una declaración de accesibilidad para sitios y aplicaciones conforme a lo previsto en la <a href="http://data.europa.eu/eli/dec_impl/2018/1523/oj" target="_blank" title="abre una nueva pestaña">Decisión de Ejecución (UE) 2018/1523</a>. Introduce la información requerida y genera un texto a partir de estos datos.

## Archivos

- `index.html`: interfaz del formulario y vista previa.
- `js/datos.js`: opciones base de estados, métodos, motivos y criterios de conformidad.
- `js/app.js`: lógica de formulario, validación, generación, copia, exportación HTML y carga/descarga de datos JSON.

## Funcionalidades

- Permite documentar todos los elementos que deben incluirse de acuerdo con la legislación vigentes.
- Permite seleccionar los criterios de conformidad específicos que no se alcanzan, el motivo, indicar las páginas afectadas, alternativas existentes y medidas correctoras previstas.
- Una vez completado el formulario, genera una declaración con la estructura:
  1. Declaración de accesibilidad.
  2. Situación de cumplimiento.
  3. Contenido no accesible.
  4. Preparación de la presente declaración de accesibilidad.
  5. Observaciones y datos de contacto.
  6. Procedimiento de aplicación.
- La declaración generada se puede copiar o descargar en versión HTML.
- También es posible descargar los datos en JSON para editar la declaración en un futuro.

## Uso

Abre `index.html` en un navegador moderno, completa el formulario y pulsa sobre el botón "Generar declaración".

## Nota importante

La herramienta genera una declaración a partir de los datos introducidos y los integra en un texto tipo. No certifica la conformidad del sitio, aplicación o servicio digital. La declaración debe basarse en una revisión de accesibilidad documentada por expertos.

## Autoría y licencia

Autor: Rubén Alcaraz Martínez.

El código fuente de esta herramienta se distribuye bajo licencia GNU General Public License v3.0 o posterior (GPL-3.0-or-later).

Puedes usar, estudiar, modificar y redistribuir esta herramienta de acuerdo con los términos de dicha licencia. Cualquier versión modificada que se redistribuya debe mantenerse bajo la misma licencia o una compatible.

Más información: https://www.gnu.org/licenses/gpl-3.0.html
