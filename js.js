function actualizarHora(){

    const ahora = new Date();

    document.getElementById("hora").innerHTML =
        ahora.toLocaleTimeString("es-AR",{
            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit",
            hour12:false
        });

    document.getElementById("fecha").innerHTML =
        ahora.toLocaleDateString("es-AR",{
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        });

}

/*=========================================
  OVERLAY DE CARGA
=========================================*/

function mostrarCarga(){

    document
        .getElementById("overlayCarga")
        .classList.add("mostrar");

    document.getElementById("btnMarcar").disabled = true;
    document.getElementById("btnAlmuerzo").disabled = true;
    document.getElementById("dni").disabled = true;

}

function ocultarCarga(){

    document
        .getElementById("overlayCarga")
        .classList.remove("mostrar");

    document.getElementById("btnMarcar").disabled = false;
    document.getElementById("btnAlmuerzo").disabled = false;
    document.getElementById("dni").disabled = false;

}

/*=========================================
  INICIALIZACIÓN
=========================================*/

actualizarHora();

setInterval(actualizarHora,1000);

const dni = document.getElementById("dni");
let dniPendiente = "";

const DEVICE_KEY = "PTH_DEVICE_ID";

function obtenerIdDispositivo() {

    let id = localStorage.getItem(DEVICE_KEY);

    if (!id) {

        id =
            "PTH-" +
            crypto.randomUUID()
                .replace(/-/g, "")
                .substring(0, 12)
                .toUpperCase();

        localStorage.setItem(DEVICE_KEY, id);

    }

    return id;

}

// Genera (o recupera) el ID apenas inicia la aplicación
obtenerIdDispositivo();

window.onload = function(){

    dni.focus();

    mostrarMensaje(
        "ok",
        "Sistema listo para registrar marcaciones."
    );

};
/*=========================================
  EVENTOS
=========================================*/

dni.addEventListener("keypress",function(e){

    if(dni.disabled){
        return;
    }

    if(e.key==="Enter"){
        validarEmpleado();
    }

});

document.addEventListener("keydown",function(e){

    if(e.key==="F2"){

        e.preventDefault();

        if(!dni.disabled){
            registrarAlmuerzo();
        }

    }

});

document
    .getElementById("btnMarcar")
    .addEventListener("click",validarEmpleado);

document
    .getElementById("btnAlmuerzo")
    .addEventListener("click",registrarAlmuerzo);
document
    .getElementById("btnCancelarJustificacion")
    .addEventListener("click", cancelarJustificacion);
document
    .getElementById("btnCerrarDispositivo")
    .addEventListener("click", cerrarModalDispositivo);

document
    .getElementById("cerrarModalDispositivo")
    .addEventListener("click", cerrarModalDispositivo);

    /*=========================================
  MENSAJES
=========================================*/

function mostrarMensaje(tipo,texto){

    const caja = document.getElementById("notificacion");
    const icono = document.getElementById("iconoMensaje");
    const mensaje = document.getElementById("textoMensaje");

    caja.className = "";

    switch(tipo){

        case "ok":

            caja.classList.add("exito");
            icono.innerHTML = "✅";
            break;

        case "error":

            caja.classList.add("error");
            icono.innerHTML = "⛔";
            break;

        case "alerta":

            caja.classList.add("alerta");
            icono.innerHTML = "⚠️";
            break;

        default:

            caja.classList.add("info");
            icono.innerHTML = "ℹ️";

    }

    mensaje.innerHTML = texto;

    caja.classList.add("mostrar");
    document
    .getElementById("overlayNotificacion")
    .classList.add("mostrar");

setTimeout(function(){

    caja.classList.remove("mostrar");

    document
        .getElementById("overlayNotificacion")
        .classList.remove("mostrar");

},2000);

}

/*=========================================
  VALIDAR EMPLEADO
=========================================*/

function validarEmpleado(){

    const dniIngresado = dni.value.trim();

    if(dniIngresado==""){

        mostrarMensaje(
            "alerta",
            "Ingrese un DNI."
        );

        return;

    }

    mostrarCarga();

    fetch(
    "https://script.google.com/macros/s/AKfycbxCdDy-UJ5gG8ghlZHnhARXumSJPibwnW8ELfU9u8a45BNl33YIy-6GPvHvhZGiqXgn/exec"
    + "?accion=registrarMarcacion"
    + "&dni=" + encodeURIComponent(dniIngresado)
    + "&dispositivo=" + encodeURIComponent(obtenerIdDispositivo())
)

.then(response => response.json())

.then(respuestaMarcacion)

.catch(function(error){

    ocultarCarga();

    mostrarMensaje(
        "error",
        "Error de comunicación con el servidor."
    );

    console.error(error);

});
}
/*=========================================
  ALMUERZO
=========================================*/

function registrarAlmuerzo(){

    const dniIngresado = dni.value.trim();

    if(dniIngresado==""){

        mostrarMensaje(
            "alerta",
            "Ingrese un DNI."
        );

        return;

    }

    mostrarCarga();

fetch(
    "https://script.google.com/macros/s/AKfycbxCdDy-UJ5gG8ghlZHnhARXumSJPibwnW8ELfU9u8a45BNl33YIy-6GPvHvhZGiqXgn/exec"
    + "?accion=registrarAlmuerzo"
    + "&dni=" + encodeURIComponent(dniIngresado)
    + "&dispositivo=" + encodeURIComponent(obtenerIdDispositivo())
)

.then(response => response.json())

.then(respuestaMarcacion)

.catch(function(error){

    ocultarCarga();

    mostrarMensaje(
        "error",
        "Error de comunicación con el servidor."
    );

    console.error(error);

});

}

function abrirModalJustificacion(dni){

    dniPendiente = dni;

    document.getElementById("txtJustificacion").value = "";
    document.getElementById("contadorJustificacion").innerHTML ="0 / 150";

    document
        .getElementById("modalJustificacion")
        .classList.add("mostrar");

    document
        .getElementById("txtJustificacion")
        .focus();
    const txt = document.getElementById("txtJustificacion");
    txt.oninput = function(){

    document.getElementById("contadorJustificacion").innerHTML =
        this.value.length + " / 150";

};

txt.onkeydown = function(e){

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        guardarJustificacion();

    }

};    

}


function cerrarModalJustificacion(){

    document
        .getElementById("modalJustificacion")
        .classList.remove("mostrar");

}

function abrirModalDispositivo(id){

    document.getElementById("codigoDispositivo").innerHTML = id;

    document
        .getElementById("modalDispositivo")
        .classList.add("mostrar");

}

function cerrarModalDispositivo(){

    document
        .getElementById("modalDispositivo")
        .classList.remove("mostrar");

    document.getElementById("dni").select();
    document.getElementById("dni").focus();

}

function cancelarJustificacion(){

    cerrarModalJustificacion();

    document.getElementById("dni").select();
    document.getElementById("dni").focus();

}

function guardarJustificacion(){

    const motivo =
        document
            .getElementById("txtJustificacion")
            .value
            .trim();

    if(motivo==""){

        mostrarMensaje(
            "alerta",
            "Debe ingresar una justificación."
        );

        return;

    }

    cerrarModalJustificacion();

    mostrarCarga();

fetch(
    "https://script.google.com/macros/s/AKfycbxCdDy-UJ5gG8ghlZHnhARXumSJPibwnW8ELfU9u8a45BNl33YIy-6GPvHvhZGiqXgn/exec"
    + "?accion=registrarMarcacion"
    + "&dni=" + encodeURIComponent(dniPendiente)
    + "&motivo=" + encodeURIComponent(motivo)
    + "&dispositivo=" + encodeURIComponent(obtenerIdDispositivo())
)

.then(response => response.json())

.then(respuestaMarcacion)

.catch(function(error){

    ocultarCarga();

    mostrarMensaje(
        "error",
        "No se pudo registrar la marcación."
    );

    console.error(error);

});

}

/*=========================================
  RESPUESTA DEL SERVIDOR
=========================================*/

function respuestaMarcacion(respuesta){
    ocultarCarga();
if (respuesta.requiereJustificacion) {

    abrirModalJustificacion(
        document.getElementById("dni").value.trim()
    );

    return;

}

    if (respuesta.equipoNoAutorizado) {

    abrirModalDispositivo(respuesta.dispositivo);

    return;

}
    
    if(!respuesta.ok){

        document.getElementById("dni").select();

        mostrarMensaje(
            "error",
            respuesta.mensaje
        );

        return;

    }

    let texto = "";

    switch(respuesta.evento){

        case "E1":
    texto =
        "¡Bienvenido!<br><br>" +
        "<span style='font-size:30px;font-weight:bold;'>" +
        respuesta.empleado +
        "</span><br><br>" +
        "Que tengas Buena jornada.";

    break;

        case "S1":
            texto = "Salida registrada.";
            break;

        case "E2":
            texto = "Ingreso registrado.";
            break;

       case "SF":
    texto =
        "<div style='font-size:18px;'>¡Hasta mañana!</div>" +
        "<div style='font-size:32px;font-weight:700;margin:8px 0;color:#3e863c;'>" +
        respuesta.empleado +
        "</div>" +
        "<div style='font-size:18px;'>Que tengas buen Descanso.</div>";

    break;

        case "A1":
    texto =
        "<div style='font-size:18px;'>¡Almuerzo Registrado!</div>" +
        "<div style='font-size:32px;font-weight:700;margin:8px 0;color:#3e863c;'>" +
        respuesta.empleado +
        "</div>" +
        "<div style='font-size:18px;'>Disfrutá tu Descanso.</div>";

    break;

        case "A2":
            texto = "Final de almuerzo registrado.";
            break;

        default:
            texto = "Marcación registrada correctamente.";

    }

    mostrarMensaje("ok", texto);

    document.getElementById("dni").value = "";
    document.getElementById("dni").focus();

}
