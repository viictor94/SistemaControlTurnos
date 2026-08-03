/** * buscar empleados  */
function buscarEmpleado(dni) {
  if (!validarDNI(dni)) {

  return {
    encontrado: false
  };

}
  const empleados = obtenerEmpleados();
  const empleado = empleados[String(dni)];
  if (!empleado) {
    return {
      encontrado: false
    };
  }

  return {
    encontrado: true,
    ...empleado
  };
}

function obtenerEmpleados() {
  const cache = CacheService.getScriptCache();
  const datosCache = cache.get(CACHE_EMPLEADOS);
  if (datosCache) {
    return JSON.parse(datosCache);
  }
  const hoja = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(HOJA_EMPLEADOS);
  const datos = hoja.getDataRange().getValues();
  const empleados = {};
  for (let i = 1; i < datos.length; i++) {
    const empleado = {
      legajo: datos[i][0],
      dni: String(datos[i][1]),
      apellido: datos[i][2],
      nombre: datos[i][3],
      sucursal: datos[i][4],
      turno: datos[i][5],
      estado: datos[i][6]
    };

    empleados[empleado.dni] = empleado;
  }
  cache.put(
    CACHE_EMPLEADOS,
    JSON.stringify(empleados),
    CACHE_MINUTOS * 60
  );
  return empleados;
}

function limpiarCacheEmpleados() {
  CacheService
    .getScriptCache()
    .remove(CACHE_EMPLEADOS);
}