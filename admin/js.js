/*=======================================
  DASHBOARD
=========================================*/
window.addEventListener("load", function(){
    cargarDashboard();
});
const URL_API = "https://script.google.com/macros/s/AKfycbxCdDy-UJ5gG8ghlZHnhARXumSJPibwnW8ELfU9u8a45BNl33YIy-6GPvHvhZGiqXgn/exec";function cargarDashboard(){
    document
        .getElementById("overlayCarga")
        .classList
        .add("mostrar");
    const inicio = performance.now();
    fetch(URL_API+"?accion=dashboard")
    .then(r => r.json())
    .then(function(datos){
        cargarKPIs(datos);
        cargarIncidencias(datos.listaIncidencias);
        cargarUltimasMarcaciones(datos.ultimasMarcaciones);
        cargarResumen(datos.resumen);
        actualizarHora();
    })
    .catch(function(error){
        console.error(error);
    })
    .finally(function(){
        document
            .getElementById("overlayCarga")
            .classList
            .remove("mostrar");
    });
}

function cargarKPIs(datos){
    document.getElementById("kpiPresentes").innerHTML =
        datos.presentes;
    document.getElementById("kpiAlmuerzo").innerHTML =
        datos.almuerzo;
    document.getElementById("kpiAusentes").innerHTML =
        datos.ausentes;
    document.getElementById("kpiIncidencias").innerHTML =
        datos.incidencias;
}

function cargarIncidencias(lista){
    const contenedor =
        document.getElementById("listaIncidencias");
    contenedor.innerHTML = "";
    if(lista.length == 0){
        contenedor.innerHTML = `
            <div class="sin-datos">
                No se registraron incidencias hoy.
            </div>
        `;

        return;
    }
    let sucursalActual = "";
    lista.forEach(function(item){
        if(item.sucursal != sucursalActual){
            sucursalActual = item.sucursal;
            contenedor.innerHTML += `
                <div class="tituloSucursal">
                    ${item.sucursal}
                </div>
            `;
        }
        contenedor.innerHTML += `
            <div class="incidencia">
                <div class="empleado">
                    ${item.empleado}
                </div>
                <div class="tipo">
                    ${item.tipo}
                </div>
                <div class="observacion">
                    ${item.observacion}
                </div>
            </div>
        `;
    });
}

function cargarUltimasMarcaciones(lista){
    const contenedor =
        document.getElementById("listaMarcaciones");
    contenedor.innerHTML = "";
    if(lista.length == 0){
        contenedor.innerHTML = `
            <div class="sin-datos">
                No hay marcaciones para mostrar.
            </div>
        `;
        return;
    }
    lista.forEach(function(item){
        contenedor.innerHTML += `
            <div class="marcacion">
                <div class="marcacion-hora">
                    ${item.hora}
                </div>
                <div class="marcacion-empleado">
                    ${item.empleado}
                </div>
                <div class="marcacion-evento">
                    ${item.evento}
                </div>
                <div class="marcacion-sucursal">
                    Sucursal ${item.sucursal}
                </div>
            </div>
        `;
    });
}

function cargarResumen(texto){
    document
        .getElementById("textoResumen")
        .textContent = texto;
}
document
    .getElementById("btnCopiarResumen")
    .addEventListener("click", copiarResumen);

function copiarResumen(){
    const texto = document
        .getElementById("textoResumen")
        .textContent;
    navigator.clipboard
        .writeText(texto)
        .then(function(){
            mostrarNotificacion(
                "ok",
                "Resumen diario copiado."
            );
        })
        .catch(function(){
            mostrarNotificacion(
                "error",
                "No fue posible copiar el resumen."
            );
        });
}

function mostrarNotificacion(tipo, mensaje){
    const notificacion = document.getElementById("notificacion");
    const icono = document.getElementById("notificacionIcono");
    const texto = document.getElementById("notificacionTexto");
    notificacion.className = "notificacion " + tipo;
    if(tipo == "ok"){
        icono.className = "fa-solid fa-circle-check";
    }else{
        icono.className = "fa-solid fa-circle-xmark";
    }
    texto.textContent = mensaje;
    notificacion.classList.add("mostrar");
    setTimeout(function(){
        notificacion.classList.remove("mostrar");
    },3000);
}

function actualizarHora(){
    const ahora = new Date();
    document.getElementById("horaActualizacion")
        .textContent =
        ahora.toLocaleTimeString(
            "es-AR",
            {
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit",
                hour12: false
            }
        );
}
document
    .getElementById("overlayCarga")
    .classList
    .remove("mostrar");
document
    .getElementById("btnActualizarDashboard")
    .addEventListener(
        "click",
        cargarDashboard
    );
document
    .getElementById("menuEmpleados")
    .addEventListener(
        "click",
        mostrarEmpleados
    );

function mostrarEmpleados(e){
    e.preventDefault();
    document
        .getElementById("dashboard")
        .style.display = "none";
    document
        .getElementById("empleados")
        .style.display = "block";
    document
        .getElementById("menuDashboard")
        .classList.remove("activo");
    document
        .getElementById("menuEmpleados")
        .classList.add("activo");
    if(listaEmpleados.length == 0){
        cargarEmpleados();
  }
}

document
    .getElementById("menuDashboard")
    .addEventListener(
        "click",
        mostrarDashboard
    );

function mostrarDashboard(e){
    if(e){
        e.preventDefault();
    }
    document
        .getElementById("dashboard")
        .style.display = "block";
    document
        .getElementById("empleados")
        .style.display = "none";
    document
        .getElementById("menuDashboard")
        .classList.add("activo");
    document
        .getElementById("menuEmpleados")
        .classList.remove("activo");
  }

let empleadoSeleccionado = null;
let listaEmpleados = [];
function cargarEmpleados(){
    const boton = document.getElementById(
        "btnActualizarEmpleados"
    );
    if(boton){
        boton.disabled = true;
        boton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Actualizando...
        `;
    }
    fetch(URL_API + "?accion=empleados")
        .then(function(r){
            if(!r.ok){
                throw new Error(
                    "Error HTTP: " + r.status
                );
            }
            return r.json();
        })
        .then(function(empleados){
            listaEmpleados = empleados;
            renderizarEmpleados(
               listaEmpleados
            );
            mostrarNotificacion(
                "ok",
                "Empleados actualizados."
            );
        })
        .catch(function(error){
           console.error(error);
            mostrarNotificacion(
                "error",
                "No se pudieron actualizar los empleados."
            );
        })
        .finally(function(){
            if(boton){
               boton.disabled = false;
                boton.innerHTML = `
                    <i class="fa-solid fa-rotate-right"></i>
                    Actualizar
                `;
            }
        });
}

function renderizarEmpleados(lista){
    const tabla =
        document.getElementById("tablaEmpleados");
    tabla.innerHTML = "";
    lista.forEach(function(e){
        tabla.innerHTML += `
            <tr>
                <td>${e.legajo}</td>
                <td>${e.dni}</td>
                <td>${e.apellido}</td>
                <td>${e.nombre}</td>
                <td>${e.sucursal}</td>
                <td>${e.turno}</td>
                <td>${e.estado}</td>
                <td>
                    <button
                    class="btnEditarEmpleado"
                    onclick="editarEmpleado('${e.dni}')"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

document
    .getElementById("buscarEmpleado")
    .addEventListener(
        "input",
        filtrarEmpleados
    );
function filtrarEmpleados(){
    const texto = this.value
        .trim()
        .toLowerCase();
    if(texto == ""){
        renderizarEmpleados(listaEmpleados);
        return;
    }
    const resultado = listaEmpleados.filter(function(e){
        return (
            String(e.legajo).includes(texto) ||
            e.dni.includes(texto) ||
            e.apellido.toLowerCase().includes(texto) ||
            e.nombre.toLowerCase().includes(texto)
        );
    });
    renderizarEmpleados(resultado);
}

let modoEmpleado = "editar";
let guardandoEmpleado = false;
function editarEmpleado(dni){
    empleadoSeleccionado = listaEmpleados.find(function(e){
        return e.dni == dni;
    });
    if(!empleadoSeleccionado){
        return;
    }
    modoEmpleado = "editar";
    abrirModalEmpleado();
}

function nuevoEmpleado(){
    modoEmpleado = "nuevo";
    empleadoSeleccionado = {
        legajo:"",
        dni:"",
        apellido:"",
        nombre:"",
        sucursal:"",
        turno:"",
        estado:"ACTIVO"
    };
    abrirModalEmpleado();
    // Obtener el próximo legajo desde el backend
    fetch(URL_API + "?accion=siguienteLegajo")
        .then(function(r){
            if(!r.ok){
                throw new Error(
                    "Error HTTP: " + r.status
                );
            }
            return r.json();
        })
        .then(function(respuesta){
            if(!respuesta.ok){
                console.error(
                    "No se pudo obtener el siguiente legajo:",
                    respuesta.mensaje
                );
                return;
            }
            empleadoSeleccionado.legajo =
                respuesta.legajo;
            document
                .getElementById("txtLegajo")
                .value = respuesta.legajo;
        })
        .catch(function(error){
            console.error(
                "Error obteniendo siguiente legajo:",
                error
            );
            document
                .getElementById("txtLegajo")
                .value = "Error";
        });
}

function abrirModalEmpleado(){
    const txtLegajo =
        document.getElementById("txtLegajo");
    const txtDni =
        document.getElementById("txtDni");
    txtLegajo.value =
        empleadoSeleccionado.legajo;
    txtDni.value =
        empleadoSeleccionado.dni;
    document.getElementById("txtApellido").value =
        empleadoSeleccionado.apellido;
    document.getElementById("txtNombre").value =
        empleadoSeleccionado.nombre;
    document.getElementById("txtEstado").value =
        empleadoSeleccionado.estado;
    // El legajo siempre es automático
    txtLegajo.readOnly = true;
    // El DNI solo puede modificarse al crear
    txtDni.readOnly =
         modoEmpleado != "nuevo";
    document.getElementById("tituloModalEmpleado")
        .textContent =
        modoEmpleado == "nuevo"
        ? "Nuevo empleado"
        : "Editar empleado";
    // Cargar sucursales
    cargarCombo(
        "sucursales",
        "txtSucursal",
        empleadoSeleccionado.sucursal
    );
    // Cargar turnos
    cargarCombo(
        "turnos",
        "txtTurno",
        empleadoSeleccionado.turno
    );
    if(empleadoSeleccionado.turno){
    cargarHorarioTurno(
        empleadoSeleccionado.turno
    );
    }else{
    document
        .getElementById("horarioTurno")
        .innerHTML = "";
}
    document.getElementById("modalEmpleado")
        .style.display = "flex";
}

function cargarCombo(accion, idSelect, valorSeleccionado){
    const combo =
        document.getElementById(idSelect);
    if(!combo){
        console.error(
            "No existe el elemento: " + idSelect
        );
        return;
    }
    combo.innerHTML = `
        <option value="">
            -- Seleccione una opción --
        </option>
    `;
    fetch(
        URL_API +
        "?accion=" +
        encodeURIComponent(accion)
    )
    .then(function(r){
        if(!r.ok){
            throw new Error(
                "Error HTTP: " + r.status
            );
        }
        return r.json();
    })
    .then(function(lista){
        console.log(
            "Datos recibidos para " + accion + ":",
            lista
        );

        if(!Array.isArray(lista)){
            console.error(
                "La respuesta no es una lista:",
                lista
            );
            return;
        }

        lista.forEach(function(item){
            let valor;
            let texto;
            if(typeof item === "string"){
                valor = item;
                texto = item;
            }else if(item && typeof item === "object"){
                  valor =
                      item.id != null
                      ? item.id
                      : item.nombre;            
                  if(accion == "sucursales"){
                        texto =
                        item.id +
                         " - " +
                        item.nombre;
                   }else{
                        texto =
                         item.nombre != null
                         ? item.nombre
                         : item.id;
                }
              }
            if(
                valor !== undefined &&
                valor !== null
            ){
                combo.innerHTML += `
                    <option value="${valor}">
                        ${texto}
                    </option>
                `;
            }
        });
        if(
            valorSeleccionado !== undefined &&
            valorSeleccionado !== null &&
            valorSeleccionado !== ""
        ){
            combo.value =
                String(valorSeleccionado);
        }
    })
    .catch(function(error){
        console.error(
            "Error cargando " + accion + ":",
            error
        );
    });
}

function cargarHorarioTurno(turno){
    const contenedor =
        document.getElementById("horarioTurno");
    if(!turno){
        contenedor.innerHTML = "";
        return;
    }
    contenedor.innerHTML = `
        <span>Consultando horario...</span>
    `;
    fetch(
        URL_API +
        "?accion=detalleTurno&turno=" +
        encodeURIComponent(turno)
    )
    .then(function(r){
        if(!r.ok){
            throw new Error(
                "Error HTTP: " + r.status
            );
        }
        return r.json();
    })
    .then(function(datos){
        if(!datos.ok){
            contenedor.innerHTML = `
                <span>No se encontró el horario.</span>
            `;
            return;
       }
        let html = "";
        if(datos.semana){
            const semana =
                obtenerTextoHorario(datos.semana);
            html += `
                <div>
                    <strong>Lunes a viernes:</strong>
                    ${semana}
                </div>
            `;
        }
        if(datos.sabado){
            const sabado =
                obtenerTextoHorario(datos.sabado);
            html += `
                <div>
                    <strong>Sábado:</strong>
                    ${sabado}
                </div>
            `;
        }
        contenedor.innerHTML = html;
    })
    .catch(function(error){
        console.error(
            "Error cargando horario:",
            error
        );
        contenedor.innerHTML = `
            <span>No se pudo cargar el horario.</span>
        `;
    });
}

function obtenerTextoHorario(horario){
    if(
        horario.entrada2 &&
        horario.salida1
    ){
        return (
            horario.entrada +
            " - " +
            horario.salida1 +
            " / " +
            horario.entrada2 +
            " - " +
            horario.salidaFinal
        );
    }
    return (
        horario.entrada +
        " - " +
        horario.salidaFinal
    );
}

function cerrarModalEmpleado(){
    document.getElementById("modalEmpleado")
        .style.display = "none";
}

function validarFormularioEmpleado(){
    if(
       document.getElementById("txtApellido")
        .value.trim() == ""
    ){
        return false;
    }
    if(
        document.getElementById("txtNombre")
        .value.trim() == ""
    ){
        return false;
    }
    return true;
}

function guardarEmpleado(){
    // Evitar doble envío
    if(guardandoEmpleado){
        return;
    }
    if(!validarFormularioEmpleado()){
        alert("Complete los datos obligatorios.");
        return;
    }
    guardandoEmpleado = true;
    const boton = document.getElementById("btnGuardarEmpleado");
    boton.disabled = true;
    boton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Guardando...
    `;
    document
        .getElementById("overlayCarga")
        .classList
        .add("mostrar");
    const accion =
        modoEmpleado == "nuevo"
        ? "guardarEmpleado"
        : "actualizarEmpleado";
    const url =
        URL_API +
        "?accion=" + accion +
        "&legajo=" +
        encodeURIComponent(
            document.getElementById("txtLegajo").value
        ) +
        "&dni=" +
        encodeURIComponent(
            document.getElementById("txtDni").value
        ) +
        "&apellido=" +
        encodeURIComponent(
            document.getElementById("txtApellido").value
        ) +
        "&nombre=" +
        encodeURIComponent(
            document.getElementById("txtNombre").value
        ) +
        "&sucursal=" +
        encodeURIComponent(
            document.getElementById("txtSucursal").value
        ) +
        "&turno=" +
        encodeURIComponent(
            document.getElementById("txtTurno").value
        ) +
        "&estado=" +
        encodeURIComponent(
            document.getElementById("txtEstado").value
        );
    fetch(url)
        .then(function(r){
            return r.json();
        })
        .then(function(respuesta){
            if(!respuesta.ok){
                mostrarNotificacion(
                    "error",
                    respuesta.mensaje || "No se pudo guardar el empleado."
                );
                return;
            }
            mostrarNotificacion(
                "ok",
                modoEmpleado == "nuevo"
                ? "Empleado creado correctamente."
                : "Empleado actualizado correctamente."
            );
            cerrarModalEmpleado();
            listaEmpleados = [];
            cargarEmpleados();
        })
        .catch(function(error){
            console.error(error);
            mostrarNotificacion(
                "error",
                "Error de conexión. No se pudo guardar."
            );
        })
        .finally(function(){
            guardandoEmpleado = false;
            boton.disabled = false;

            boton.innerHTML = `
                Guardar
            `;
            document
                .getElementById("overlayCarga")
                .classList
                .remove("mostrar");
            document.getElementById("textoOverlay").textContent =
            modoEmpleado == "nuevo"
            ? "Guardando empleado..."
            : "Actualizando empleado...";
        });
}

function limpiarFormularioEmpleado(){
    document.getElementById("txtLegajo").value = "";
    document.getElementById("txtDni").value = "";
    document.getElementById("txtApellido").value = "";
    document.getElementById("txtNombre").value = "";
    document.getElementById("txtSucursal").value = "";
    document.getElementById("txtTurno").value = "";
    document.getElementById("txtEstado").value = "ACTIVO";
}

document
    .getElementById("txtTurno")
    .addEventListener(
        "change",
        function(){
            cargarHorarioTurno(
                this.value
            );
        }
    );

document
    .getElementById("btnNuevoEmpleado")
    .addEventListener(
        "click",
        nuevoEmpleado
    );
document
    .getElementById("btnActualizarEmpleados")
    .addEventListener(
        "click",
        cargarEmpleados
    );
document
    .getElementById("btnGuardarEmpleado")
    .addEventListener(
        "click",
        guardarEmpleado
    );
document
    .getElementById("btnCerrarModal")
    .addEventListener(
        "click",
        cerrarModalEmpleado
    );
document
    .getElementById("btnCancelarEmpleado")
    .addEventListener(
        "click",
        cerrarModalEmpleado
    );
