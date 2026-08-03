function obtenerUltimaMarcacion(dni) {

  const hoja = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(HOJA_MARCACIONES);

  const ultimaFila = hoja.getLastRow();

  if (ultimaFila <= 1) {
    return { existe: false };
  }

  const filasALeer = Math.min(500, ultimaFila - 1);
  const filaInicio = ultimaFila - filasALeer + 1;

  const datos = hoja
    .getRange(filaInicio, 1, filasALeer, 6)
    .getValues();

  for (let i = datos.length - 1; i >= 0; i--) {

    if (String(datos[i][4]) === String(dni)) {

      return {
        existe: true,
        fecha: datos[i][1],
        evento: datos[i][5]
      };

    }

  }

  return { existe: false };

}

function obtenerUltimaMarcacionHoy(dni) {
  const t0 = new Date().getTime();

  const hoja = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(HOJA_MARCACIONES);

 const ultimaFila = hoja.getLastRow();
  
  if (ultimaFila <= 1) {
  return {
    existe: false
  };
}

// Cantidad máxima de filas a leer
  const filasALeer = Math.min(500, ultimaFila - 1);

// Desde qué fila empezar
  const filaInicio = ultimaFila - filasALeer + 1;

// Leemos únicamente las columnas A:F
  const datos = hoja
  .getRange(filaInicio, 1, filasALeer, 6)
  .getValues();

  const hoy = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd/MM/yyyy"
  );

for (let i = datos.length - 1; i >= 0; i--) {
    const fecha = Utilities.formatDate(
      new Date(datos[i][1]),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

    if (
      String(datos[i][4]) === String(dni) &&
      fecha === hoy
    ) {

      return {
        existe: true,
        id: datos[i][0],
        fecha: datos[i][1],
        hora: datos[i][2],
        fechaHora: datos[i][3],
        fechaHoraReal: new Date(datos[i][3]),
        evento: datos[i][5]
      };

    }

  }
  return {
    existe: false
  };

}


function determinarProximoEvento(empleado, ultima) {

  const turno = obtenerTurnoEmpleado(empleado);

  if (!turno.encontrado) {
    return {
      ok: false,
      mensaje: "No se encontró el turno del empleado."
    };
  }

  const hoy = new Date().getDay();
  const usaAlmuerzo = (hoy == 6) ? false : turno.usaAlmuerzo;

  const ahora = new Date();

  const horaEntrada = new Date();
  horaEntrada.setHours(
    turno.entrada.getHours(),
    turno.entrada.getMinutes(),
    0,
    0
  );

  const horaSalida = new Date();
  horaSalida.setHours(
    turno.salidaFinal.getHours(),
    turno.salidaFinal.getMinutes(),
    0,
    0
  );

  // ==========================
  // PRIMERA MARCACIÓN
  // ==========================

  if (!ultima.existe) {

    const minutosTarde =
  (ahora.getTime() - horaEntrada.getTime()) / 60000;
    let incidencias = [];
if (minutosTarde > turno.tolerancia) {

if (minutosTarde > turno.fueraJornadaMin) {

    incidencias.push({
        tipo: "FUERA_DE_JORNADA",
        observacion: "Ingreso fuera de jornada."
    });

} else if (minutosTarde >= turno.tardanzaGrave) {

        incidencias.push({
            tipo: "TARDANZA_GRAVE",
            observacion: `Llegó ${Math.floor(minutosTarde)} minutos tarde.`
        });

    } else {

        incidencias.push({
            tipo: "TARDANZA",
            observacion: `Llegó ${Math.floor(minutosTarde)} minutos tarde.`
        });

    }

}

    return {
      ok: true,
      evento: "E1",
      incidencias: incidencias
    };

  }

  // ==========================
  // TURNO CORTADO
  // ==========================

  if (turno.turnoCortado) {

    switch (ultima.evento) {

      case "E1":

        return {
          ok: true,
          evento: "S1"
        };

      case "S1":

        return {
          ok: true,
          evento: "E2"
        };

      case "E2": {

        let incidencias = [];

        if (ahora.getTime() < horaSalida.getTime()) {

          const minutosAntes = Math.ceil(
            (horaSalida.getTime() - ahora.getTime()) / 60000
          );

          incidencias.push({
            tipo: "SALIDA",
            observacion: `Salida anticipada de ${minutosAntes} minutos.`
          });

        }

        return {
          ok: true,
          evento: "SF",
          incidencias: incidencias
        };

      }

      default:

        return {
          ok: false,
          mensaje: "La jornada ya fue finalizada."
        };

    }

  }

  // ==========================
  // TURNO CONTINUO
  // ==========================

  switch (ultima.evento) {

    case "E1": {

      let incidencias = [];

      if (ahora.getTime() < horaSalida.getTime()) {

        const minutosAntes = Math.ceil(
          (horaSalida.getTime() - ahora.getTime()) / 60000
        );

        incidencias.push({
          tipo: "SALIDA",
          observacion: `Salida anticipada de ${minutosAntes} minutos.`
        });

      }

      return {
        ok: true,
        evento: "SF",
        incidencias: incidencias
      };

    }

case "A1": {

    let incidencias = [];

    incidencias.push({
        tipo: "ALMUERZO_SIN_CERRAR",
        observacion: "Finalizó la jornada sin cerrar el almuerzo."
    });

    if (ahora.getTime() < horaSalida.getTime()) {

        const minutosAntes = Math.ceil(
            (horaSalida.getTime() - ahora.getTime()) / 60000
        );

        incidencias.push({
            tipo: "SALIDA",
            observacion: `Salida anticipada de ${minutosAntes} minutos.`
        });

    }

    return {
        ok: true,
        evento: "SF",
        incidencias: incidencias
    };

}

    case "A2": {

      let incidencias = [];

      if (ahora.getTime() < horaSalida.getTime()) {

        const minutosAntes = Math.ceil(
          (horaSalida.getTime() - ahora.getTime()) / 60000
        );

        incidencias.push({
          tipo: "SALIDA",
          observacion: `Salida anticipada de ${minutosAntes} minutos.`
        });

      }

      return {
        ok: true,
        evento: "SF",
        incidencias: incidencias
      };

    }

    default:

      return {
        ok: false,
        mensaje: "La jornada ya fue finalizada."
      };

  }

}

function registrarMarcacion(dni, justificacion) {
  if (!validarDNI(dni)) {

  return {
    ok: false,
    mensaje: "Ingrese un DNI válido."
  };

}
  justificacion = justificacion || "";
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const t0 = new Date().getTime();
    const empleado = buscarEmpleado(dni);
    const ultimaGeneral = obtenerUltimaMarcacion(empleado.dni);

    if (!empleado.encontrado) {
      return {
        ok: false,
        mensaje: "Empleado inexistente."
      };
    }

    if (String(empleado.estado).toUpperCase() !== "ACTIVO") {
      return {
        ok: false,
        mensaje: "El empleado se encuentra inactivo."
      };
    }

    if (
    ultimaGeneral.existe &&
    ultimaGeneral.evento !== "SF"
) {

    const fechaUltima = Utilities.formatDate(
        new Date(ultimaGeneral.fecha),
        Session.getScriptTimeZone(),
        "dd/MM/yyyy"
    );

    const fechaHoy = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "dd/MM/yyyy"
    );

    if (fechaUltima !== fechaHoy) {

        registrarIncidencia(
            empleado.dni,
            "JORNADA_INCOMPLETA",
            "No registró la salida del día " + fechaUltima
        );
        if (ultimaGeneral.evento === "A1") {

    registrarIncidencia(
        empleado.dni,
        "ALMUERZO_SIN_CERRAR",
        "No cerró el almuerzo del día " + fechaUltima
    );

}

    }

}

    // =========================================
    // EVITA DOBLE MARCACIÓN
    // =========================================

    const ultima = obtenerUltimaMarcacionHoy(empleado.dni);

    if (ultima.existe) {

      const ahora = new Date();

      const segundos =
        (ahora.getTime() - ultima.fechaHoraReal.getTime()) / 1000;

      if (segundos < 10) {
        return {
          ok: false,
          mensaje: "Ya se registró una marcación hace unos segundos."
        };
      }

    }

    const proximo = determinarProximoEvento(empleado, ultima);

    if (!proximo.ok) {
      return proximo;
    }

    if (proximo.incidencias) {

    const fuera = proximo.incidencias.find(
        i => i.tipo == "FUERA_DE_JORNADA"
    );

    if (fuera && justificacion == "") {

        return {
            ok:false,
            requiereJustificacion:true
        };

    }

}

    const hoja = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(HOJA_MARCACIONES);

    const ahora = new Date();

    const fecha = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

    const hora = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "HH:mm:ss"
    );

    const fechaHora = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm:ss"
    );

    const id = Utilities.getUuid();

    hoja.appendRow([
      id,
      fecha,
      hora,
      fechaHora,
      empleado.dni,
      proximo.evento,
      "OK",
      "",
      ""
    ]);

    if (proximo.incidencias && proximo.incidencias.length > 0) {

      proximo.incidencias.forEach(function (incidencia) {

    let observacion = incidencia.observacion;

    if (
        incidencia.tipo == "FUERA_DE_JORNADA" &&
        justificacion != ""
    ) {

        observacion +=
            " Justificación: " + justificacion;

    }

    registrarIncidencia(
        empleado.dni,
        incidencia.tipo,
        observacion
    );

});

    }
    return {
      ok: true,
      empleado: empleado.nombre,
      evento: proximo.evento
    };

  } finally {

    lock.releaseLock();

  }

}


function registrarAlmuerzo(dni) {
  if (!validarDNI(dni)) {

  return {
    ok: false,
    mensaje: "Ingrese un DNI válido."
  };

}

  const lock = LockService.getScriptLock();

  try {

    lock.waitLock(5000);

  } catch (e) {

    return {
      ok: false,
      mensaje: "Sistema ocupado, intente nuevamente."
    };

  }

  try {

    const empleado = buscarEmpleado(dni);

    if (!empleado.encontrado) {
      return {
        ok: false,
        mensaje: "Empleado inexistente."
      };
    }

    const proximo = determinarEventoAlmuerzo(empleado);

    if (!proximo.ok) {
      return proximo;
    }

    let incidencias = [];

    if (proximo.evento == "A2") {

      const turno = obtenerTurnoEmpleado(empleado);
      const ultima = obtenerUltimaMarcacionHoy(empleado.dni);

      const inicioAlmuerzo = new Date(ultima.fechaHora);
      const ahora = new Date();

      const minutosAlmuerzo =
        (ahora.getTime() - inicioAlmuerzo.getTime()) / 60000;

      if (minutosAlmuerzo > turno.almuerzoMin) {

        const exceso = Math.floor(
          minutosAlmuerzo - turno.almuerzoMin
        );

        incidencias.push({
          tipo: "ALMUERZO_EXCEDIDO",
          observacion: `Excedió el almuerzo en ${exceso} minutos.`
        });

      }

    }

    const hoja = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(HOJA_MARCACIONES);

    const ahora = new Date();

    const fecha = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy"
    );

    const hora = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "HH:mm:ss"
    );

    const fechaHora = Utilities.formatDate(
      ahora,
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm:ss"
    );

    const id = Utilities.getUuid();

    hoja.appendRow([
      id,
      fecha,
      hora,
      fechaHora,
      empleado.dni,
      proximo.evento,
      "OK",
      "",
      ""
    ]);

    if (incidencias.length > 0) {

      incidencias.forEach(function (incidencia) {

        registrarIncidencia(
          empleado.dni,
          incidencia.tipo,
          incidencia.observacion
        );

      });

    }

    return {
      ok: true,
      evento: proximo.evento,
      empleado: empleado.nombre
    };

  } finally {

    lock.releaseLock();

  }

}


function determinarEventoAlmuerzo(empleado) {

  const turno = obtenerTurnoEmpleado(empleado);

  if (!turno.encontrado) {
    return {
      ok: false,
      mensaje: "No se encontró el turno del empleado."
    };
  }

  // Los sábados no hay almuerzo
  if (new Date().getDay() == 6) {
    return {
      ok: false,
      mensaje: "Los sábados no se registra almuerzo."
    };
  }

  if (!turno.usaAlmuerzo) {
    return {
      ok: false,
      mensaje: "Este turno no utiliza almuerzo."
    };
  }

  const ultima = obtenerUltimaMarcacionHoy(empleado.dni);

  if (!ultima.existe) {
    return {
      ok: false,
      mensaje: "Primero debe registrar la entrada."
    };
  }

  switch (ultima.evento) {

    case "E1":

      return {
        ok: true,
        evento: "A1"
      };

    case "A1":

      return {
        ok: true,
        evento: "A2"
      };

    default:

      return {
        ok: false,
        mensaje: "No corresponde registrar almuerzo en este momento."
      };

  }

}

function registrarIncidencia(dni, tipo, observacion) {

  const hoja = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(HOJA_INCIDENCIAS);

  const fecha = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm:ss"
  );

  hoja.appendRow([
    fecha,
    dni,
    tipo,
    "Pendiente",
    observacion
  ]);

}

