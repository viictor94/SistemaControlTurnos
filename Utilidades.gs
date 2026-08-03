/** * Obtiene todos los parámetros de la hoja Configuración */
function obtenerConfiguracion() {
  const hoja = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Configuración");
  const datos = hoja.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < datos.length; i++) {
    const parametro = String(datos[i][0]).trim();
    let valor = datos[i][1];
    if (parametro === "Logo") {
      valor = convertirLinkDrive(valor);
    }

    config[parametro] = valor;
  }
  return config;
}


/**  * Convierte automáticamente cualquier formato de Google Drive * a una URL válida para mostrar imágenes. */
function convertirLinkDrive(url) {
  if (!url) return "";
  url = String(url).trim();
  // Si ya está en formato correcto
  if (url.includes("lh3.googleusercontent.com/d/")) {
    return url;
  }
  // Extrae el ID desde cualquier formato de enlace de Drive
  const match = url.match(/[-\w]{25,}/);
  if (match) {
    return "https://lh3.googleusercontent.com/d/" + match[0];
  }
  // Si no encuentra un ID, devuelve el valor original
  return url;
}


/** validar el dni  */
function validarDNI(dni) {

  dni = String(dni).trim();

  if (/^[=+\-@]/.test(dni)) {
    return false;
  }

  return /^\d{6,9}$/.test(dni);

}