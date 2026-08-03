/**
 * Obtiene la configuración del turno del empleado
 * según el día actual.
 */
function obtenerTurnoEmpleado(empleado) {
  const hoja = SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName(HOJA_TURNOS);

if (!hoja) {
  throw new Error("No se encontró la hoja '" + HOJA_TURNOS + "'");
}
  const datos = hoja.getDataRange().getValues();
  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
  ];

  const hoy = dias[new Date().getDay()];

  for (let i = 1; i < datos.length; i++) {

    if (
      datos[i][0] == empleado.turno &&
      String(datos[i][1]).toLowerCase() == hoy
    ) {

      return {

        encontrado: true,

        turno: datos[i][0],

        dia: datos[i][1],

        entrada: datos[i][2],

        salida1: datos[i][3],

        entrada2: datos[i][4],

        salidaFinal: datos[i][5],

        usaAlmuerzo: String(datos[i][6]).toLowerCase() == "si",

        tolerancia: Number(datos[i][7]),

        almuerzoMin: Number(datos[i][8]),

        tardanzaGrave: Number(datos[i][9]),

        fueraJornadaMin: Number(datos[i][10]),

        turnoCortado: String(datos[i][4]).trim() !== ""

      };

    }

  }

  return {
    encontrado: false
  };

}