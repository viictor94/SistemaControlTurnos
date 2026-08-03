/*****************************************************
 * SISTEMA DE CONTROL HORARIO - PANTHER
 * Versión 1.1
 *****************************************************/
  const HOJA_EMPLEADOS = "Empleados";
  const HOJA_MARCACIONES = "Marcaciones";
  const HOJA_INCIDENCIAS = "Incidencias";
  const HOJA_TURNOS = "Turnos";
  
  const CACHE_EMPLEADOS = "EMPLEADOS_CACHE";
  const CACHE_MINUTOS = 180;

  const EVENTO_ENTRADA = "ENTRADA";
const EVENTO_SALIDA = "SALIDA";


/** * Carga la WebApp */
function doGet() {

  const html = HtmlService.createTemplateFromFile("index");

  html.config = obtenerConfiguracion();

  return html
    .evaluate()
    .setTitle("Sistema de Control Horario")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}

/** * Incluye archivos HTML */
function include(nombre) {
  return HtmlService
    .createHtmlOutputFromFile(nombre)
    .getContent();
}




