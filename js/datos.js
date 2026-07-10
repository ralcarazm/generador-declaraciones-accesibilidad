const ESTADOS_CONFORMIDAD = [
  {
    value: "plenamente-conforme",
    label: "Plenamente conforme",
    texto: "plenamente conforme"
  },
  {
    value: "parcialmente-conforme",
    label: "Parcialmente conforme",
    texto: "parcialmente conforme"
  },
  {
    value: "no-conforme",
    label: "Aún no conforme",
    texto: "aún no conforme"
  }
];

const METODOS_EVALUACION = [
  "Autoevaluación realizada por la propia entidad",
  "Evaluación realizada por una entidad externa",
  "Revisión automática y revisión manual experta",
  "Auditoría interna",
  "Auditoría externa",
  "Otro método documentado"
];

const MOTIVOS_NO_ACCESIBLE = [
  {
    value: "falta-conformidad",
    label: "Falta de conformidad con la normativa aplicable"
  },
  {
    value: "carga-desproporcionada",
    label: "Carga desproporcionada"
  },
  {
    value: "fuera-ambito",
    label: "Contenido fuera del ámbito de la legislación aplicable"
  }
];

const CRITERIOS_FRECUENTES = [
  {
    value: "9.1.1.1 - Contenido no textual",
    label: "9.1.1.1 - Contenido no textual"
  },
  {
    value: "9.1.2.1 - Solo audio y solo vídeo (grabado)",
    label: "9.1.2.1 - Solo audio y solo vídeo (grabado)"
  },
  {
    value: "9.1.2.2 - Subtítulos (grabados)",
    label: "9.1.2.2 - Subtítulos (grabados)"
  },
  {
    value: "9.1.2.3 - Audiodescripción o contenido multimedia alternativo (grabado)",
    label: "9.1.2.3 - Audiodescripción o contenido multimedia alternativo (grabado)"
  },
  {
    value: "9.1.2.4 - Subtítulos (en directo)",
    label: "9.1.2.4 - Subtítulos (en directo)"
  },
  {
    value: "9.1.2.5 - Audiodescripción (grabada)",
    label: "9.1.2.5 - Audiodescripción (grabada)"
  },
  {
    value: "9.1.3.1 - Información y relaciones",
    label: "9.1.3.1 - Información y relaciones"
  },
  {
    value: "9.1.3.2 - Secuencia significativa",
    label: "9.1.3.2 - Secuencia significativa"
  },
  {
    value: "9.1.3.3 - Características sensoriales",
    label: "9.1.3.3 - Características sensoriales"
  },
  {
    value: "9.1.3.4 - Orientación",
    label: "9.1.3.4 - Orientación"
  },
  {
    value: "9.1.3.5 - Identificación del propósito de entrada",
    label: "9.1.3.5 - Identificación del propósito de entrada"
  },
  {
    value: "9.1.4.1 - Uso del color",
    label: "9.1.4.1 - Uso del color"
  },
  {
    value: "9.1.4.2 - Control del audio",
    label: "9.1.4.2 - Control del audio"
  },
  {
    value: "9.1.4.3 - Contraste (mínimo)",
    label: "9.1.4.3 - Contraste (mínimo)"
  },
  {
    value: "9.1.4.4 - Cambio de tamaño del texto",
    label: "9.1.4.4 - Cambio de tamaño del texto"
  },
  {
    value: "9.1.4.5 - Imágenes de texto",
    label: "9.1.4.5 - Imágenes de texto"
  },
  {
    value: "9.1.4.10 - Reajuste del texto",
    label: "9.1.4.10 - Reajuste del texto"
  },
  {
    value: "9.1.4.11 - Contraste no textual",
    label: "9.1.4.11 - Contraste no textual"
  },
  {
    value: "9.1.4.12 - Espaciado del texto",
    label: "9.1.4.12 - Espaciado del texto"
  },
  {
    value: "9.1.4.13 - Contenido señalado con el puntero o que tiene el foco",
    label: "9.1.4.13 - Contenido señalado con el puntero o que tiene el foco"
  },
  {
    value: "9.2.1.1 - Teclado",
    label: "9.2.1.1 - Teclado"
  },
  {
    value: "9.2.1.2 - Sin trampas para el foco del teclado",
    label: "9.2.1.2 - Sin trampas para el foco del teclado"
  },
  {
    value: "9.2.1.4 - Atajos del teclado",
    label: "9.2.1.4 - Atajos del teclado"
  },
  {
    value: "9.2.2.1 - Tiempo ajustable",
    label: "9.2.2.1 - Tiempo ajustable"
  },
  {
    value: "9.2.2.2 - Poner en pausa, detener, ocultar",
    label: "9.2.2.2 - Poner en pausa, detener, ocultar"
  },
  {
    value: "9.2.3.1 - Umbral de tres destellos o menos",
    label: "9.2.3.1 - Umbral de tres destellos o menos"
  },
  {
    value: "9.2.4.1 - Evitar bloques",
    label: "9.2.4.1 - Evitar bloques"
  },
  {
    value: "9.2.4.2 - Titulado de páginas",
    label: "9.2.4.2 - Titulado de páginas"
  },
  {
    value: "9.2.4.3 - Orden del foco",
    label: "9.2.4.3 - Orden del foco"
  },
  {
    value: "9.2.4.4 - Propósito de los enlaces (en contexto)",
    label: "9.2.4.4 - Propósito de los enlaces (en contexto)"
  },
  {
    value: "9.2.4.5 - Múltiples vías",
    label: "9.2.4.5 - Múltiples vías"
  },
  {
    value: "9.2.4.6 - Encabezados y etiquetas",
    label: "9.2.4.6 - Encabezados y etiquetas"
  },
  {
    value: "9.2.4.7 - Foco visible",
    label: "9.2.4.7 - Foco visible"
  },
  {
    value: "9.2.5.1 - Gestos con el puntero",
    label: "9.2.5.1 - Gestos con el puntero"
  },
  {
    value: "9.2.5.2 - Cancelación del puntero",
    label: "9.2.5.2 - Cancelación del puntero"
  },
  {
    value: "9.2.5.3 - Inclusión de la etiqueta en el nombre",
    label: "9.2.5.3 - Inclusión de la etiqueta en el nombre"
  },
  {
    value: "9.2.5.4 - Activación mediante movimiento",
    label: "9.2.5.4 - Activación mediante movimiento"
  },
  {
    value: "9.3.1.1 - Idioma de la página",
    label: "9.3.1.1 - Idioma de la página"
  },
  {
    value: "9.3.1.2 - Idioma de las partes",
    label: "9.3.1.2 - Idioma de las partes"
  },
  {
    value: "9.3.2.1 - Al recibir el foco",
    label: "9.3.2.1 - Al recibir el foco"
  },
  {
    value: "9.3.2.2 - Al recibir entradas",
    label: "9.3.2.2 - Al recibir entradas"
  },
  {
    value: "9.3.2.3 - Navegación coherente",
    label: "9.3.2.3 - Navegación coherente"
  },
  {
    value: "9.3.2.4 - Identificación coherente",
    label: "9.3.2.4 - Identificación coherente"
  },
  {
    value: "9.3.3.1 - Identificación de errores",
    label: "9.3.3.1 - Identificación de errores"
  },
  {
    value: "9.3.3.2 - Etiquetas o instrucciones",
    label: "9.3.3.2 - Etiquetas o instrucciones"
  },
  {
    value: "9.3.3.3 - Sugerencias ante error",
    label: "9.3.3.3 - Sugerencias ante error"
  },
  {
    value: "9.3.3.4 - Prevención de errores (legales, financieros, de datos)",
    label: "9.3.3.4 - Prevención de errores (legales, financieros, de datos)"
  },
  {
    value: "9.4.1.1 - Procesamiento",
    label: "9.4.1.1 - Procesamiento"
  },
  {
    value: "9.4.1.2 - Nombre, función, valor",
    label: "9.4.1.2 - Nombre, función, valor"
  },
  {
    value: "9.4.1.3 - Mensajes de estado",
    label: "9.4.1.3 - Mensajes de estado"
  },
  {
    value: "otro",
    label: "Otro requisito o criterio"
  }
];
