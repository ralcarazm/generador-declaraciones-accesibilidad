(function () {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const form = $("#formDeclaracion");
  const vistaPrevia = $("#vistaPrevia");
  const estadoAplicacion = $("#estadoAplicacion");
  const mensajeError = $("#mensajeError");
  const mensajeExito = $("#mensajeExito");
  const listaIncumplimientos = $("#listaIncumplimientos");
  const sinIncumplimientos = $("#sinIncumplimientos");
  const btnAgregarIncumplimiento = $("#btnAgregarIncumplimiento");
  const btnCopiarTexto = $("#btnCopiarTexto");
  const btnDescargarHtml = $("#btnDescargarHtml");
  const btnDescargarJson = $("#btnDescargarJson");
  const btnLimpiar = $("#btnLimpiar");
  const archivoJson = $("#archivoJson");

  let contadorIncumplimientos = 0;
  let ultimaDeclaracionHtml = "";
  let ultimoDocumentoHtml = "";

  document.addEventListener("DOMContentLoaded", inicializar);

  function inicializar() {
    poblarMetodosEvaluacion();
    poblarEstadosConformidad();
    establecerFechasPorDefecto();
    registrarEventos();
    actualizarVisibilidadOpciones();
    actualizarEstadoListaIncumplimientos();
  }

  function registrarEventos() {
    form.addEventListener("submit", manejarEnvioFormulario);
    form.addEventListener("input", limpiarMensajes);
    form.addEventListener("change", manejarCambiosFormulario);
    form.addEventListener("invalid", manejarCampoInvalido, true);

    btnAgregarIncumplimiento.addEventListener("click", () => agregarIncumplimiento());
    btnCopiarTexto.addEventListener("click", copiarTextoGenerado);
    btnDescargarHtml.addEventListener("click", () => descargarArchivo("declaracion-accesibilidad.html", ultimoDocumentoHtml, "text/html"));
    btnDescargarJson.addEventListener("click", descargarDatosJson);
    btnLimpiar.addEventListener("click", limpiarFormulario);
    archivoJson.addEventListener("change", cargarDatosJson);

    listaIncumplimientos.addEventListener("click", manejarClickListaIncumplimientos);
    listaIncumplimientos.addEventListener("change", manejarCambioListaIncumplimientos);
  }

  function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    limpiarMensajes();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      mostrarError("Revisa los campos obligatorios o con formato incorrecto.");
      enfocarPrimerCampoInvalido();
      return;
    }

    const datos = obtenerDatosFormulario();
    const errores = validarDatos(datos);

    if (errores.length > 0) {
      mostrarError(errores.join(" "));
      return;
    }

    ultimaDeclaracionHtml = generarDeclaracionHtml(datos);
    ultimoDocumentoHtml = generarDocumentoHtml(datos, ultimaDeclaracionHtml);

    vistaPrevia.innerHTML = ultimaDeclaracionHtml;
    habilitarExportaciones(true);
    mostrarExito("Declaración generada. Revisa la vista previa antes de publicarla.");
    anunciar("Declaración generada y disponible en la vista previa.");
    $("#titulo-vista-previa").focus?.();
  }

  function manejarCambiosFormulario(evento) {
    const objetivo = evento.target;

    if (objetivo.id === "incluirCarga" || objetivo.id === "incluirFueraAmbito") {
      actualizarVisibilidadOpciones();
    }

    if (objetivo.hasAttribute("aria-invalid")) {
      objetivo.removeAttribute("aria-invalid");
    }
  }

  function manejarCampoInvalido(evento) {
    evento.target.setAttribute("aria-invalid", "true");
  }

  function manejarClickListaIncumplimientos(evento) {
    const botonEliminar = evento.target.closest("[data-accion='eliminar-incumplimiento']");
    if (!botonEliminar) {
      return;
    }

    const tarjeta = botonEliminar.closest(".incumplimiento");
    const leyenda = $("legend", tarjeta)?.textContent.trim() || "incumplimiento";
    tarjeta.remove();
    actualizarEstadoListaIncumplimientos();
    anunciar(`Se ha eliminado ${leyenda}.`);
    btnAgregarIncumplimiento.focus();
  }

  function manejarCambioListaIncumplimientos(evento) {
    const selectorCriterio = evento.target.closest("[data-campo='criterio']");
    if (!selectorCriterio) {
      return;
    }

    const tarjeta = selectorCriterio.closest(".incumplimiento");
    const campoOtro = $("[data-campo='criterio-otro']", tarjeta);
    const contenedorOtro = $("[data-bloque='criterio-otro']", tarjeta);
    const usarOtro = selectorCriterio.value === "otro";

    contenedorOtro.hidden = !usarOtro;
    campoOtro.required = usarOtro;

    if (!usarOtro) {
      campoOtro.value = "";
      campoOtro.removeAttribute("aria-invalid");
    }
  }

  function poblarMetodosEvaluacion() {
    const select = $("#metodoEvaluacion");
    select.innerHTML = '<option value="">Selecciona un método</option>';
    METODOS_EVALUACION.forEach((metodo) => {
      const option = document.createElement("option");
      option.value = metodo;
      option.textContent = metodo;
      select.append(option);
    });
  }

  function poblarEstadosConformidad() {
    const contenedor = $("#grupoEstadoConformidad");
    contenedor.innerHTML = "";

    ESTADOS_CONFORMIDAD.forEach((estado, indice) => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      const id = `estado-${estado.value}`;
      col.innerHTML = `
        <div class="form-check border rounded p-3 h-100">
          <input class="form-check-input" type="radio" name="estadoConformidad" id="${id}" value="${escapeHtml(estado.value)}" ${indice === 1 ? "checked" : ""} required>
          <label class="form-check-label" for="${id}">${escapeHtml(estado.label)}</label>
        </div>
      `;
      contenedor.append(col);
    });
  }

  function establecerFechasPorDefecto() {
    const hoy = new Date();
    const hoyIso = hoy.toISOString().slice(0, 10);
    const proximaRevision = new Date(hoy);
    proximaRevision.setFullYear(proximaRevision.getFullYear() + 1);

    $("#fechaPreparacion").value = hoyIso;
    $("#fechaRevision").value = hoyIso;
    $("#fechaProximaRevision").value = proximaRevision.toISOString().slice(0, 10);
  }

  function actualizarVisibilidadOpciones() {
    const incluirCarga = $("#incluirCarga").checked;
    const incluirFueraAmbito = $("#incluirFueraAmbito").checked;

    $("#bloqueCarga").hidden = !incluirCarga;
    $("#textoCarga").required = incluirCarga;

    $("#bloqueFueraAmbito").hidden = !incluirFueraAmbito;
    $("#textoFueraAmbito").required = incluirFueraAmbito;
  }

  function agregarIncumplimiento(datos = {}) {
    contadorIncumplimientos += 1;
    const indice = contadorIncumplimientos;
    const idBase = `incumplimiento-${indice}`;
    const tarjeta = document.createElement("div");
    tarjeta.className = "card mb-3 incumplimiento";
    tarjeta.dataset.indice = String(indice);

    tarjeta.innerHTML = `
      <fieldset class="card-body">
        <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
          <legend class="h4 mb-0">Incumplimiento ${indice}</legend>
          <button type="button" class="btn btn-outline-danger btn-sm" data-accion="eliminar-incumplimiento">
            Eliminar incumplimiento ${indice}
          </button>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <label for="${idBase}-criterio" class="form-label">Requisito o criterio afectado <span aria-hidden="true">*</span></label>
            <select class="form-select" id="${idBase}-criterio" data-campo="criterio" required aria-describedby="${idBase}-criterio-ayuda"></select>
            <div id="${idBase}-criterio-ayuda" class="form-text">Selecciona un criterio frecuente o “Otro requisito o criterio”.</div>
            <div class="invalid-feedback">Selecciona el requisito o criterio afectado.</div>
          </div>

          <div class="col-md-6" data-bloque="criterio-otro" hidden>
            <label for="${idBase}-criterio-otro" class="form-label">Indica el requisito o criterio <span aria-hidden="true">*</span></label>
            <input type="text" class="form-control" id="${idBase}-criterio-otro" data-campo="criterio-otro">
            <div class="invalid-feedback">Indica el requisito o criterio afectado.</div>
          </div>

          <div class="col-md-6">
            <label for="${idBase}-motivo" class="form-label">Motivo <span aria-hidden="true">*</span></label>
            <select class="form-select" id="${idBase}-motivo" data-campo="motivo" required></select>
            <div class="invalid-feedback">Selecciona el motivo.</div>
          </div>

          <div class="col-12">
            <label for="${idBase}-descripcion" class="form-label">Descripción del problema <span aria-hidden="true">*</span></label>
            <textarea class="form-control" id="${idBase}-descripcion" data-campo="descripcion" rows="3" required></textarea>
            <div class="invalid-feedback">Describe el problema de accesibilidad.</div>
          </div>

          <div class="col-12">
            <label for="${idBase}-paginas" class="form-label">Páginas, secciones, plantillas o documentos afectados</label>
            <textarea class="form-control" id="${idBase}-paginas" data-campo="paginas" rows="2"></textarea>
          </div>

          <div class="col-12">
            <label for="${idBase}-alternativa" class="form-label">Alternativa accesible disponible</label>
            <textarea class="form-control" id="${idBase}-alternativa" data-campo="alternativa" rows="2"></textarea>
          </div>

          <div class="col-12">
            <label for="${idBase}-correccion" class="form-label">Medida correctora prevista o comentario</label>
            <textarea class="form-control" id="${idBase}-correccion" data-campo="correccion" rows="2"></textarea>
          </div>
        </div>
      </fieldset>
    `;

    listaIncumplimientos.append(tarjeta);
    poblarSelectCriterios($("[data-campo='criterio']", tarjeta));
    poblarSelectMotivos($("[data-campo='motivo']", tarjeta));
    establecerDatosIncumplimiento(tarjeta, datos);
    actualizarEstadoListaIncumplimientos();

    if (!datos.noEnfocar) {
      anunciar(`Se ha añadido el incumplimiento ${indice}.`);
      $("[data-campo='criterio']", tarjeta).focus();
    }

    return tarjeta;
  }

  function poblarSelectCriterios(select) {
    select.innerHTML = '<option value="">Selecciona un criterio</option>';
    CRITERIOS_FRECUENTES.forEach((criterio) => {
      const option = document.createElement("option");
      option.value = criterio.value;
      option.textContent = criterio.label;
      select.append(option);
    });
  }

  function poblarSelectMotivos(select) {
    select.innerHTML = '<option value="">Selecciona un motivo</option>';
    MOTIVOS_NO_ACCESIBLE.forEach((motivo) => {
      const option = document.createElement("option");
      option.value = motivo.value;
      option.textContent = motivo.label;
      select.append(option);
    });
  }

  function establecerDatosIncumplimiento(tarjeta, datos) {
    const criterioSelect = $("[data-campo='criterio']", tarjeta);
    const criterioOtro = $("[data-campo='criterio-otro']", tarjeta);
    const bloqueOtro = $("[data-bloque='criterio-otro']", tarjeta);
    const valoresCriterios = CRITERIOS_FRECUENTES.map((item) => item.value);

    if (datos.criterio && valoresCriterios.includes(datos.criterio)) {
      criterioSelect.value = datos.criterio;
      bloqueOtro.hidden = true;
      criterioOtro.required = false;
    } else if (datos.criterio) {
      criterioSelect.value = "otro";
      criterioOtro.value = datos.criterio;
      bloqueOtro.hidden = false;
      criterioOtro.required = true;
    }

    setValueIfExists($(`[data-campo='motivo']`, tarjeta), datos.motivo);
    setValueIfExists($(`[data-campo='descripcion']`, tarjeta), datos.descripcion);
    setValueIfExists($(`[data-campo='paginas']`, tarjeta), datos.paginas);
    setValueIfExists($(`[data-campo='alternativa']`, tarjeta), datos.alternativa);
    setValueIfExists($(`[data-campo='correccion']`, tarjeta), datos.correccion);
  }

  function setValueIfExists(elemento, valor) {
    if (elemento && typeof valor === "string") {
      elemento.value = valor;
    }
  }

  function actualizarEstadoListaIncumplimientos() {
    const hayIncumplimientos = $$(".incumplimiento", listaIncumplimientos).length > 0;
    sinIncumplimientos.hidden = hayIncumplimientos;
  }

  function obtenerDatosFormulario() {
    const estadoSeleccionado = $(`input[name="estadoConformidad"]:checked`);

    return {
      entidad: valor("#entidad"),
      responsable: valor("#responsable"),
      nombreSitio: valor("#nombreSitio"),
      urlSitio: valor("#urlSitio"),
      tipoServicio: valor("#tipoServicio"),
      fechaPreparacion: valor("#fechaPreparacion"),
      fechaRevision: valor("#fechaRevision"),
      fechaProximaRevision: valor("#fechaProximaRevision"),
      normaAplicada: valor("#normaAplicada"),
      metodoEvaluacion: valor("#metodoEvaluacion"),
      observacionesMetodo: valor("#observacionesMetodo"),
      estadoConformidad: estadoSeleccionado ? estadoSeleccionado.value : "",
      incluirCarga: $("#incluirCarga").checked,
      textoCarga: valor("#textoCarga"),
      incluirFueraAmbito: $("#incluirFueraAmbito").checked,
      textoFueraAmbito: valor("#textoFueraAmbito"),
      emailContacto: valor("#emailContacto"),
      telefonoContacto: valor("#telefonoContacto"),
      formularioContacto: valor("#formularioContacto"),
      procedimientoReclamacion: valor("#procedimientoReclamacion"),
      direccionContacto: valor("#direccionContacto"),
      incumplimientos: obtenerIncumplimientos()
    };
  }

  function obtenerIncumplimientos() {
    return $$(".incumplimiento", listaIncumplimientos).map((tarjeta) => {
      const criterioSelect = $("[data-campo='criterio']", tarjeta);
      const criterioOtro = $("[data-campo='criterio-otro']", tarjeta);
      const criterio = criterioSelect.value === "otro" ? criterioOtro.value.trim() : criterioSelect.value.trim();

      return {
        criterio,
        motivo: valorDesdeElemento($("[data-campo='motivo']", tarjeta)),
        descripcion: valorDesdeElemento($("[data-campo='descripcion']", tarjeta)),
        paginas: valorDesdeElemento($("[data-campo='paginas']", tarjeta)),
        alternativa: valorDesdeElemento($("[data-campo='alternativa']", tarjeta)),
        correccion: valorDesdeElemento($("[data-campo='correccion']", tarjeta))
      };
    });
  }

  function valor(selector) {
    return ($(selector)?.value || "").trim();
  }

  function valorDesdeElemento(elemento) {
    return (elemento?.value || "").trim();
  }

  function validarDatos(datos) {
    const errores = [];

    if ((datos.estadoConformidad === "parcialmente-conforme" || datos.estadoConformidad === "no-conforme") && datos.incumplimientos.length === 0) {
      errores.push("Has indicado que el servicio no es plenamente conforme. Añade al menos un contenido no accesible.");
      btnAgregarIncumplimiento.focus();
    }

    if (datos.estadoConformidad === "plenamente-conforme" && datos.incumplimientos.length > 0) {
      errores.push("Has indicado plena conformidad, pero también has añadido incumplimientos. Revisa el estado de conformidad o elimina los incumplimientos.");
    }

    return errores;
  }

  function generarDeclaracionHtml(datos) {
    const fechaPreparacion = formatearFecha(datos.fechaPreparacion);
    const fechaRevision = formatearFecha(datos.fechaRevision);

    const partes = [];

    partes.push(`
      <article aria-labelledby="declaracion-titulo">
        <h1 id="declaracion-titulo">Declaración de accesibilidad</h1>

        <p>
          ${escapeHtml(datos.entidad)} se ha comprometido a hacer accesible ${nombreServicioHtml(datos)},
          de conformidad con ${escapeHtml(datos.normaAplicada)}.
        </p>
        <p>
          La presente declaración de accesibilidad se aplica a ${alcanceServicioHtml(datos)}.
        </p>

        <h2>Situación de cumplimiento</h2>
        ${generarSituacionCumplimientoHtml(datos)}
    `);

    partes.push(generarBloqueContenidoNoAccesibleHtml(datos));

    partes.push(`
        <h2>Preparación de la presente declaración de accesibilidad</h2>
        <p>
          La presente declaración fue preparada el ${escapeHtml(fechaPreparacion)}.
        </p>
        <p>
          El método empleado para preparar la declaración ha sido: ${escapeHtml(datos.metodoEvaluacion)}.
        </p>
        ${datos.observacionesMetodo ? `<p>${nl2br(escapeHtml(datos.observacionesMetodo))}</p>` : ""}
        <p>
          Última revisión de la declaración: ${fechaRevision ? escapeHtml(fechaRevision) : "no indicada"}.
        </p>

        <h2>Observaciones y datos de contacto</h2>
        <p>
          Los interesados pueden informar sobre cualquier posible incumplimiento de los requisitos de accesibilidad,
          comunicar dificultades de acceso, formular consultas o solicitar información y contenidos excluidos del ámbito de aplicación
          de la normativa mediante los siguientes canales:
        </p>
        ${datos.responsable ? `<p><strong>Entidad, unidad o persona responsable:</strong> ${escapeHtml(datos.responsable)}</p>` : ""}
        ${generarListaContacto(datos)}

        <h2>Procedimiento de aplicación</h2>
        ${datos.procedimientoReclamacion
          ? `<p>Si la respuesta a una comunicación o solicitud es insatisfactoria, puede recurrirse al siguiente procedimiento de aplicación: ${enlaceSeguro(datos.procedimientoReclamacion, datos.procedimientoReclamacion)}.</p>`
          : `<p>No se ha indicado una URL específica para el procedimiento de aplicación. Este apartado debe completarse antes de publicar la declaración.</p>`}
      </article>
    `);

    return partes.join("\n");
  }

  function generarBloqueContenidoNoAccesibleHtml(datos) {
    if (datos.estadoConformidad === "plenamente-conforme") {
      return "";
    }

    const incumplimientosConformidad = datos.incumplimientos.filter((item) => item.motivo === "falta-conformidad" || !item.motivo);
    const incumplimientosCarga = datos.incumplimientos.filter((item) => item.motivo === "carga-desproporcionada");
    const incumplimientosFueraAmbito = datos.incumplimientos.filter((item) => item.motivo === "fuera-ambito");

    const partes = [`
      <h2>Contenido no accesible</h2>
      <p>El contenido que se recoge a continuación no es accesible por los motivos indicados.</p>
    `];

    if (incumplimientosConformidad.length > 0) {
      partes.push(`
        <h3>Falta de conformidad con ${escapeHtml(datos.normaAplicada || "la normativa aplicable")}</h3>
        <p>Los siguientes contenidos, secciones o funcionalidades presentan aspectos que aún no son conformes:</p>
        ${generarListaIncumplimientosHtml(incumplimientosConformidad)}
      `);
    }

    if (datos.incluirCarga || incumplimientosCarga.length > 0) {
      partes.push(`
        <h3>Carga desproporcionada</h3>
        ${datos.textoCarga ? `<p>${nl2br(escapeHtml(datos.textoCarga))}</p>` : ""}
        ${incumplimientosCarga.length > 0 ? generarListaIncumplimientosHtml(incumplimientosCarga) : ""}
      `);
    }

    if (datos.incluirFueraAmbito || incumplimientosFueraAmbito.length > 0) {
      partes.push(`
        <h3>El contenido no entra dentro del ámbito de la legislación aplicable</h3>
        ${datos.textoFueraAmbito ? `<p>${nl2br(escapeHtml(datos.textoFueraAmbito))}</p>` : ""}
        ${incumplimientosFueraAmbito.length > 0 ? generarListaIncumplimientosHtml(incumplimientosFueraAmbito) : ""}
      `);
    }

    const alternativas = datos.incumplimientos.filter((item) => item.alternativa);
    if (alternativas.length > 0) {
      const items = alternativas.map((item) => `<li><strong>${escapeHtml(item.criterio)}:</strong> ${nl2br(escapeHtml(item.alternativa))}</li>`).join("\n");
      partes.push(`
        <h3>Alternativas accesibles</h3>
        <ul>${items}</ul>
      `);
    }

    if (partes.length === 1) {
      partes.push(`<p>No se han añadido contenidos no accesibles. Este apartado debe completarse antes de publicar la declaración.</p>`);
    }

    return partes.join("\n");
  }

  function generarListaIncumplimientosHtml(items) {
    const elementos = items.map((item, indice) => `
      <li>
        <p><strong>${escapeHtml(item.criterio || `Aspecto no conforme ${indice + 1}`)}</strong></p>
        <p>${nl2br(escapeHtml(item.descripcion))}</p>
        ${item.paginas ? `<p><strong>Contenido, sección o funcionalidad afectada:</strong> ${nl2br(escapeHtml(item.paginas))}</p>` : ""}
        ${item.correccion ? `<p><strong>Medida correctora prevista o comentario:</strong> ${nl2br(escapeHtml(item.correccion))}</p>` : ""}
      </li>
    `).join("\n");

    return `<ol>${elementos}</ol>`;
  }

  function generarListaContacto(datos) {
    const items = [];

    if (datos.emailContacto) {
      items.push(`<li>Correo electrónico: <a href="mailto:${encodeURIComponent(datos.emailContacto)}">${escapeHtml(datos.emailContacto)}</a></li>`);
    }

    if (datos.telefonoContacto) {
      items.push(`<li>Teléfono: ${escapeHtml(datos.telefonoContacto)}</li>`);
    }

    if (datos.formularioContacto) {
      items.push(`<li>Formulario de contacto: ${enlaceSeguro(datos.formularioContacto, datos.formularioContacto)}</li>`);
    }

    if (datos.direccionContacto) {
      items.push(`<li>Otros canales: ${nl2br(escapeHtml(datos.direccionContacto))}</li>`);
    }

    if (items.length === 0) {
      return `<p>No se han indicado canales de contacto. Este apartado debe completarse antes de publicar la declaración.</p>`;
    }

    return `<ul>${items.join("\n")}</ul>`;
  }

  function generarDocumentoHtml(datos, contenido) {
    const titulo = `Declaración de accesibilidad - ${datos.nombreSitio || datos.entidad}`;

    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(titulo)}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <a class="visually-hidden-focusable position-absolute top-0 start-0 m-3 p-3 bg-light border rounded" href="#contenido-principal">Saltar al contenido principal</a>
    <main id="contenido-principal" class="container my-4" tabindex="-1">
      ${contenido}
    </main>
  </body>
</html>`;
  }

  function generarSituacionCumplimientoHtml(datos) {
    return `<p>${escapeHtml(generarSituacionCumplimientoTexto(datos))}</p>`;
  }

  function generarSituacionCumplimientoTexto(datos) {
    const sujeto = sujetoServicio(datos.tipoServicio);
    const norma = datos.normaAplicada || "la normativa aplicable";

    if (datos.estadoConformidad === "plenamente-conforme") {
      return `${sujeto} es plenamente conforme con la norma ${norma}.`;
    }

    if (datos.estadoConformidad === "no-conforme") {
      return `${sujeto} aún no es conforme con la norma ${norma}. A continuación, se indican las excepciones o los aspectos no conformes.`;
    }

    return `${sujeto} es parcialmente conforme con la norma ${norma} debido a las excepciones o a la falta de conformidad de los aspectos que se indican a continuación.`;
  }

  function sujetoServicio(tipoServicio) {
    const tipo = tipoServicio || "sitio web";
    if (tipo === "aplicación móvil") return "Esta aplicación para dispositivos móviles";
    if (tipo === "sede electrónica") return "Esta sede electrónica";
    if (tipo === "intranet o extranet") return "Esta intranet o extranet";
    if (tipo === "otro servicio digital") return "Este servicio digital";
    return "Este sitio web";
  }

  function nombreServicioHtml(datos) {
    const base = escapeHtml(textoConArticulo(datos.tipoServicio));
    const nombre = datos.nombreSitio ? ` <strong>${escapeHtml(datos.nombreSitio)}</strong>` : "";
    const url = datos.urlSitio ? `, disponible en ${enlaceSeguro(datos.urlSitio, datos.urlSitio)}` : "";
    return `${base}${nombre}${url}`;
  }

  function nombreServicioTexto(datos) {
    const base = textoConArticulo(datos.tipoServicio);
    const nombre = datos.nombreSitio ? ` ${datos.nombreSitio}` : "";
    const url = datos.urlSitio ? `, disponible en ${datos.urlSitio}` : "";
    return `${base}${nombre}${url}`;
  }

  function alcanceServicioHtml(datos) {
    const base = escapeHtml(textoConArticulo(datos.tipoServicio));
    const nombre = datos.nombreSitio ? ` <strong>${escapeHtml(datos.nombreSitio)}</strong>` : "";
    const url = datos.urlSitio ? ` (${enlaceSeguro(datos.urlSitio, datos.urlSitio)})` : "";
    return `${base}${nombre}${url}`;
  }

  function alcanceServicioTexto(datos) {
    const base = textoConArticulo(datos.tipoServicio);
    const nombre = datos.nombreSitio ? ` ${datos.nombreSitio}` : "";
    const url = datos.urlSitio ? ` (${datos.urlSitio})` : "";
    return `${base}${nombre}${url}`;
  }

  function obtenerTextoEstado(valorEstado) {
    const estado = ESTADOS_CONFORMIDAD.find((item) => item.value === valorEstado);
    return estado ? estado.texto : "parcialmente conforme";
  }

  function etiquetaMotivo(valorMotivo) {
    const motivo = MOTIVOS_NO_ACCESIBLE.find((item) => item.value === valorMotivo);
    return motivo ? motivo.label : valorMotivo;
  }

  function textoConArticulo(tipoServicio) {
    const tipo = tipoServicio || "sitio web";
    if (tipo === "aplicación móvil") return "la aplicación móvil";
    if (tipo === "sede electrónica") return "la sede electrónica";
    if (tipo === "intranet o extranet") return "la intranet o extranet";
    if (tipo === "otro servicio digital") return "el servicio digital";
    return "el sitio web";
  }

  function formatearFecha(fechaIso) {
    if (!fechaIso) {
      return "";
    }

    const partes = fechaIso.split("-");
    if (partes.length !== 3) {
      return fechaIso;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "";
  }

  function enlaceSeguro(url, texto) {
    const urlNormalizada = normalizarUrl(url);
    if (!urlNormalizada) {
      return escapeHtml(texto || "");
    }
    return `<a href="${escapeHtml(urlNormalizada)}">${escapeHtml(texto || urlNormalizada)}</a>`;
  }

  function normalizarUrl(url) {
    const valorUrl = (url || "").trim();
    if (!valorUrl) {
      return "";
    }

    try {
      const parsedUrl = new URL(valorUrl, window.location.href);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        return parsedUrl.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function nl2br(texto) {
    return texto.replace(/\n/g, "<br>");
  }

  function escapeHtml(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function copiarTextoGenerado() {
    const texto = vistaPrevia.innerText.trim();

    if (!texto) {
      mostrarError("No hay texto generado para copiar.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => mostrarExito("Texto copiado al portapapeles."))
        .catch(() => copiarTextoConFallback(texto));
      return;
    }

    copiarTextoConFallback(texto);
  }

  function copiarTextoConFallback(texto) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.className = "visually-hidden";
    document.body.append(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      mostrarExito("Texto copiado al portapapeles.");
    } catch (error) {
      mostrarError("No se ha podido copiar el texto automáticamente.");
    } finally {
      textarea.remove();
    }
  }

  function descargarDatosJson() {
    const datos = obtenerDatosFormulario();
    const contenido = JSON.stringify(datos, null, 2);
    descargarArchivo("datos-declaracion-accesibilidad.json", contenido, "application/json");
    mostrarExito("Archivo JSON generado.");
  }

  function cargarDatosJson(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) {
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      try {
        const datos = JSON.parse(String(lector.result));
        restaurarFormulario(datos);
        mostrarExito("Datos cargados correctamente.");
        anunciar("Datos JSON cargados en el formulario.");
      } catch (error) {
        mostrarError("No se ha podido cargar el archivo JSON. Revisa que el archivo tenga un formato válido.");
      } finally {
        archivoJson.value = "";
      }
    };
    lector.readAsText(archivo);
  }

  function restaurarFormulario(datos) {
    limpiarFormulario({ conservarMensajes: true });

    setValueIfExists($("#entidad"), datos.entidad);
    setValueIfExists($("#responsable"), datos.responsable);
    setValueIfExists($("#nombreSitio"), datos.nombreSitio);
    setValueIfExists($("#urlSitio"), datos.urlSitio);
    setValueIfExists($("#tipoServicio"), datos.tipoServicio);
    setValueIfExists($("#fechaPreparacion"), datos.fechaPreparacion);
    setValueIfExists($("#fechaRevision"), datos.fechaRevision);
    setValueIfExists($("#fechaProximaRevision"), datos.fechaProximaRevision);
    setValueIfExists($("#normaAplicada"), datos.normaAplicada);
    setValueIfExists($("#metodoEvaluacion"), datos.metodoEvaluacion);
    setValueIfExists($("#observacionesMetodo"), datos.observacionesMetodo);
    setValueIfExists($("#textoCarga"), datos.textoCarga);
    setValueIfExists($("#textoFueraAmbito"), datos.textoFueraAmbito);
    setValueIfExists($("#emailContacto"), datos.emailContacto);
    setValueIfExists($("#telefonoContacto"), datos.telefonoContacto);
    setValueIfExists($("#formularioContacto"), datos.formularioContacto);
    setValueIfExists($("#procedimientoReclamacion"), datos.procedimientoReclamacion);
    setValueIfExists($("#direccionContacto"), datos.direccionContacto);

    const estado = $(`input[name="estadoConformidad"][value="${cssEscape(datos.estadoConformidad || "parcialmente-conforme")}"]`);
    if (estado) estado.checked = true;

    $("#incluirCarga").checked = Boolean(datos.incluirCarga);
    $("#incluirFueraAmbito").checked = Boolean(datos.incluirFueraAmbito);
    actualizarVisibilidadOpciones();

    if (Array.isArray(datos.incumplimientos)) {
      datos.incumplimientos.forEach((item) => agregarIncumplimiento({ ...item, noEnfocar: true }));
    }

    actualizarEstadoListaIncumplimientos();
    $("#entidad").focus();
  }

  function cssEscape(valor) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(valor);
    }
    return String(valor).replace(/"/g, "\\\"");
  }

  function descargarArchivo(nombreArchivo, contenido, tipoMime) {
    if (!contenido) {
      mostrarError("No hay contenido disponible para descargar.");
      return;
    }

    const blob = new Blob([contenido], { type: `${tipoMime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  function limpiarFormulario(opciones = {}) {
    form.reset();
    listaIncumplimientos.innerHTML = "";
    contadorIncumplimientos = 0;
    establecerFechasPorDefecto();
    actualizarVisibilidadOpciones();
    actualizarEstadoListaIncumplimientos();
    form.classList.remove("was-validated");
    $$('[aria-invalid="true"]', form).forEach((campo) => campo.removeAttribute("aria-invalid"));

    vistaPrevia.innerHTML = '<p class="text-secondary mb-0">La declaración aparecerá aquí cuando completes el formulario y pulses “Generar declaración”.</p>';
    ultimaDeclaracionHtml = "";
    ultimoDocumentoHtml = "";
    habilitarExportaciones(false);

    if (!opciones.conservarMensajes) {
      mostrarExito("Formulario limpiado.");
      anunciar("Formulario limpiado.");
    }
  }

  function habilitarExportaciones(habilitar) {
    btnCopiarTexto.disabled = !habilitar;
    btnDescargarHtml.disabled = !habilitar;
  }

  function enfocarPrimerCampoInvalido() {
    const campo = $(":invalid", form);
    if (campo) {
      campo.focus();
    }
  }

  function limpiarMensajes() {
    mensajeError.hidden = true;
    mensajeError.textContent = "";
    mensajeExito.hidden = true;
    mensajeExito.textContent = "";
  }

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.hidden = false;
    mensajeExito.hidden = true;
    anunciar(mensaje);
    mensajeError.scrollIntoView({ block: "nearest" });
  }

  function mostrarExito(mensaje) {
    mensajeExito.textContent = mensaje;
    mensajeExito.hidden = false;
    mensajeError.hidden = true;
    anunciar(mensaje);
  }

  function anunciar(mensaje) {
    estadoAplicacion.textContent = "";
    window.setTimeout(() => {
      estadoAplicacion.textContent = mensaje;
    }, 50);
  }
}());
