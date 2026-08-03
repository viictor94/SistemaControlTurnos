const CACHE = CacheService.getScriptCache();

function actualizarCache() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ============================
  // EMPLEADOS
  // ============================

  const hojaEmpleados = ss.getSheetByName(HOJA_EMPLEADOS);

  const empleados = hojaEmpleados
    .getDataRange()
    .getValues();

  CACHE.put(
    "EMPLEADOS",
    JSON.stringify(empleados),
    21600 // 6 horas
  );

  // ============================
  // TURNOS
  // ============================

  const hojaTurnos = ss.getSheetByName(HOJA_TURNOS);

  const turnos = hojaTurnos
    .getDataRange()
    .getValues();

  CACHE.put(
    "TURNOS",
    JSON.stringify(turnos),
    21600 // 6 horas
  );

}