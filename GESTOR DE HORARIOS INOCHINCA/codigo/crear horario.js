/* =========================================================
   GESTOR DE HORARIOS
   JAVASCRIPT PRINCIPAL
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const NUM_DIAS = 5;

const NUM_CLASES = 6;


/* =========================================================
   ELEMENTOS DEL HTML
   ========================================================= */

const nombreHorario =
    document.getElementById("nombreHorario");


const formularioClases =
    document.getElementById("formularioClases");


const cuerpoHorario =
    document.getElementById("cuerpoHorario");


const nombrePreview =
    document.getElementById("nombrePreview");


const mensaje =
    document.getElementById("mensaje");


const btnGenerar =
    document.getElementById("btnGenerar");


const btnGuardar =
    document.getElementById("btnGuardar");


const btnPDF =
    document.getElementById("btnPDF");


const btnLimpiar =
    document.getElementById("btnLimpiar");


/* =========================================================
   DATOS DEL HORARIO
   ========================================================= */

let horarioActual = null;


/* =========================================================
   CREAR LOS CAMPOS DE ENTRADA
   ========================================================= */

function crearFormulario() {

    formularioClases.innerHTML = "";


    for (
        let dia = 1;
        dia <= NUM_DIAS;
        dia++
    ) {


        for (
            let clase = 1;
            clase <= NUM_CLASES;
            clase++
        ) {


            const fila =
                document.createElement("tr");


            fila.innerHTML = `

                <td class="celda-dia">
                    Día ${dia}
                </td>

                <td class="celda-clase">
                    Clase ${clase}
                </td>

                <td>

                    <input
                        type="time"
                        class="hora-inicio"
                        data-dia="${dia}"
                        data-clase="${clase}"
                    >

                </td>

                <td>

                    <input
                        type="time"
                        class="hora-final"
                        data-dia="${dia}"
                        data-clase="${clase}"
                    >

                </td>

                <td>

                    <input
                        type="text"
                        class="asignatura"
                        data-dia="${dia}"
                        data-clase="${clase}"
                        placeholder="Asignatura"
                    >

                </td>

                <td>

                    <input
                        type="text"
                        class="docente"
                        data-dia="${dia}"
                        data-clase="${clase}"
                        placeholder="Docente"
                    >

                </td>

            `;


            formularioClases.appendChild(fila);

        }

    }

}


/* =========================================================
   OBTENER DATOS DEL FORMULARIO
   ========================================================= */

function obtenerDatos() {

    const datos = [];


    for (
        let dia = 1;
        dia <= NUM_DIAS;
        dia++
    ) {

        const clases = [];


        for (
            let clase = 1;
            clase <= NUM_CLASES;
            clase++
        ) {


            const inicio =
                document.querySelector(
                    `.hora-inicio[data-dia="${dia}"][data-clase="${clase}"]`
                );


            const final =
                document.querySelector(
                    `.hora-final[data-dia="${dia}"][data-clase="${clase}"]`
                );


            const asignatura =
                document.querySelector(
                    `.asignatura[data-dia="${dia}"][data-clase="${clase}"]`
                );


            const docente =
                document.querySelector(
                    `.docente[data-dia="${dia}"][data-clase="${clase}"]`
                );


            clases.push({

                clase: clase,

                inicio:
                    inicio.value,

                final:
                    final.value,

                asignatura:
                    asignatura.value.trim(),

                docente:
                    docente.value.trim()

            });

        }


        datos.push({

            dia: dia,

            clases: clases

        });

    }


    return datos;

}


/* =========================================================
   FORMATEAR HORA
   ========================================================= */

function formatearHora(hora) {

    if (!hora) {

        return "";

    }


    const partes =
        hora.split(":");


    let horas =
        parseInt(partes[0], 10);


    const minutos =
        partes[1];


    const periodo =
        horas >= 12
            ? "PM"
            : "AM";


    if (horas === 0) {

        horas = 12;

    }

    else if (horas > 12) {

        horas -= 12;

    }


    return `${horas}:${minutos} ${periodo}`;

}


/* =========================================================
   CREAR TEXTO DE HORA
   ========================================================= */

function textoHora(clase) {

    if (
        !clase.inicio &&
        !clase.final
    ) {

        return "Sin hora";

    }


    if (
        clase.inicio &&
        clase.final
    ) {

        return `${formatearHora(clase.inicio)} - ${formatearHora(clase.final)}`;

    }


    if (clase.inicio) {

        return formatearHora(clase.inicio);

    }


    return formatearHora(clase.final);

}


/* =========================================================
   CREAR LA VISTA PREVIA
   ========================================================= */

function generarHorario() {

    const nombre =
        nombreHorario.value.trim();


    if (!nombre) {

        mostrarMensaje(
            "Escribe un nombre para el horario.",
            "error"
        );

        nombreHorario.focus();

        return;

    }


    horarioActual = {

        nombre: nombre,

        dias: obtenerDatos(),

        fecha:
            new Date().toLocaleString()

    };


    nombrePreview.textContent =
        nombre;


    cuerpoHorario.innerHTML = "";


    /*
       Cada fila representa una clase.
       Las columnas representan:
       Hora + Día 1 + Día 2 + Día 3 + Día 4 + Día 5
    */


    for (
        let claseNumero = 1;
        claseNumero <= NUM_CLASES;
        claseNumero++
    ) {


        const fila =
            document.createElement("tr");


        /* ---------------------------------------------
           COLUMNA DE HORAS
           --------------------------------------------- */

        const celdaHora =
            document.createElement("td");


        celdaHora.className =
            "hora";


        const claseDia1 =
            horarioActual.dias[0]
                .clases[claseNumero - 1];


        celdaHora.textContent =
            textoHora(claseDia1);


        fila.appendChild(celdaHora);


        /* ---------------------------------------------
           DÍAS
           --------------------------------------------- */

        for (
            let dia = 0;
            dia < NUM_DIAS;
            dia++
        ) {


            const celda =
                document.createElement("td");


            const datosClase =
                horarioActual
                    .dias[dia]
                    .clases[claseNumero - 1];


            if (
                datosClase.asignatura ||
                datosClase.docente
            ) {


                celda.classList.add(
                    `color-${(claseNumero % 6) + 1}`
                );


                let contenido = "";


                if (
                    datosClase.asignatura
                ) {

                    contenido += `
                        <span class="materia">
                            ${escaparHTML(
                                datosClase.asignatura
                            )}
                        </span>
                    `;

                }


                if (
                    datosClase.docente
                ) {

                    contenido += `
                        <span class="docente">
                            ${escaparHTML(
                                datosClase.docente
                            )}
                        </span>
                    `;

                }


                celda.innerHTML =
                    contenido;


            } else {


                celda.innerHTML = `
                    <span class="celda-vacia">
                        —
                    </span>
                `;

            }


            fila.appendChild(celda);

        }


        cuerpoHorario.appendChild(fila);

    }


    mostrarMensaje(
        "Horario generado correctamente.",
        "exito"
    );


    /*
       Hacemos que la vista previa
       aparezca automáticamente.
    */

    document
        .getElementById("vistaPrevia")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =========================================================
   ESCAPAR HTML
   Evita problemas si se escribe
   contenido especial en los campos.
   ========================================================= */

function escaparHTML(texto) {

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GUARDAR HORARIO
   ========================================================= */

function guardarHorario() {

    if (!horarioActual) {

        generarHorario();

    }


    if (!horarioActual) {

        return;

    }


    let horarios =
        JSON.parse(
            localStorage.getItem("horarios")
        ) || [];


    /*
       Le damos un identificador único.
    */

    const horarioGuardar = {

        id:
            Date.now(),

        nombre:
            horarioActual.nombre,

        dias:
            horarioActual.dias,

        fecha:
            new Date().toLocaleString()

    };


    horarios.push(
        horarioGuardar
    );


    localStorage.setItem(
        "horarios",
        JSON.stringify(horarios)
    );


    mostrarMensaje(
        "Horario guardado correctamente.",
        "exito"
    );

}


/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarFormulario() {

    const confirmar =
        confirm(
            "¿Seguro que quieres limpiar todos los datos?"
        );


    if (!confirmar) {

        return;

    }


    nombreHorario.value = "";


    const inputs =
        formularioClases.querySelectorAll(
            "input"
        );


    inputs.forEach(input => {

        input.value = "";

    });


    cuerpoHorario.innerHTML = "";


    nombrePreview.textContent =
        "Sin nombre";


    horarioActual = null;


    mostrarMensaje(
        "Formulario limpiado.",
        "exito"
    );

}


/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(
    texto,
    tipo
) {

    mensaje.textContent =
        texto;


    mensaje.className =
        `mensaje ${tipo}`;


    setTimeout(() => {

        mensaje.textContent = "";

        mensaje.className =
            "mensaje";

    }, 4000);

}


/* =========================================================
   DESCARGAR PDF
   ========================================================= */

function descargarPDF() {

    /*
       Si todavía no existe una vista previa,
       primero generamos el horario.
    */

    if (!horarioActual) {

        generarHorario();

    }


    if (!horarioActual) {

        return;

    }


    /*
       Comprobamos que las librerías
       estén cargadas.
    */

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        mostrarMensaje(
            "No se pudo cargar el generador de PDF. Revisa tu conexión a Internet.",
            "error"
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });


    /*
       -----------------------------------------------
       TÍTULO
       -----------------------------------------------
    */

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(22);


    pdf.setTextColor(
        127,
        43,
        29
    );


    pdf.text(
        "GESTOR DE HORARIOS",
        148,
        17,
        {
            align: "center"
        }
    );


    /*
       -----------------------------------------------
       NOMBRE
       -----------------------------------------------
    */

    pdf.setFontSize(14);


    pdf.setTextColor(
        100,
        55,
        45
    );


    pdf.text(
        horarioActual.nombre,
        148,
        25,
        {
            align: "center"
        }
    );


    /*
       -----------------------------------------------
       ENCABEZADOS
       -----------------------------------------------
    */

    const encabezados = [

        [
            "Horas",
            "Día 1",
            "Día 2",
            "Día 3",
            "Día 4",
            "Día 5"
        ]

    ];


    /*
       -----------------------------------------------
       CREAR FILAS DEL PDF
       -----------------------------------------------
    */

    const filas = [];


    for (
        let clase = 0;
        clase < NUM_CLASES;
        clase++
    ) {


        const fila = [];


        /*
           Hora
        */

        const referencia =
            horarioActual
                .dias[0]
                .clases[clase];


        fila.push(
            textoHora(referencia)
        );


        /*
           Días
        */

        for (
            let dia = 0;
            dia < NUM_DIAS;
            dia++
        ) {


            const datos =
                horarioActual
                    .dias[dia]
                    .clases[clase];


            let texto = "";


            if (
                datos.asignatura
            ) {

                texto +=
                    datos.asignatura;

            }


            if (
                datos.docente
            ) {

                texto +=
                    "\n" +
                    datos.docente;

            }


            if (!texto) {

                texto = "—";

            }


            fila.push(
                texto
            );

        }


        filas.push(
            fila
        );

    }


    /*
       -----------------------------------------------
       CREAR TABLA
       -----------------------------------------------
    */

    pdf.autoTable({

        head:
            encabezados,

        body:
            filas,

        startY:
            32,

        theme:
            "grid",


        styles: {

            font:
                "helvetica",

            fontSize:
                10,

            textColor:
                [
                    110,
                    55,
                    45
                ],

            halign:
                "center",

            valign:
                "middle",

            cellPadding:
                5,

            lineColor:
                [
                    215,
                    180,
                    170
                ],

            lineWidth:
                0.3

        },


        headStyles: {

            fillColor:
                [
                    167,
                    68,
                    44
                ],

            textColor:
                [
                    255,
                    255,
                    255
                ],

            fontStyle:
                "bold",

            halign:
                "center",

            valign:
                "middle"

        },


        columnStyles: {

            0: {

                fillColor:
                    [
                        242,
                        223,
                        217
                    ],

                fontStyle:
                    "bold",

                cellWidth:
                    32

            },

            1: {

                cellWidth:
                    44

            },

            2: {

                cellWidth:
                    44

            },

            3: {

                cellWidth:
                    44

            },

            4: {

                cellWidth:
                    44

            },

            5: {

                cellWidth:
                    44

            }

        },


        /*
           Colores alternados
           para las materias.
        */

        didParseCell:
            function(data) {

                if (
                    data.section === "body" &&
                    data.column.index > 0
                ) {

                    const colores = [

                        [
                            248,
                            223,
                            216
                        ],

                        [
                            245,
                            229,
                            210
                        ],

                        [
                            234,
                            223,
                            210
                        ],

                        [
                            241,
                            215,
                            210
                        ],

                        [
                            247,
                            232,
                            223
                        ],

                        [
                            234,
                            215,
                            209
                        ]

                    ];


                    const indice =
                        data.row.index % 6;


                    data.cell.styles.fillColor =
                        colores[indice];

                }

            }

    });


    /*
       -----------------------------------------------
       PIE DE PÁGINA
       -----------------------------------------------
    */

    const paginas =
        pdf.internal.getNumberOfPages();


    for (
        let pagina = 1;
        pagina <= paginas;
        pagina++
    ) {

        pdf.setPage(
            pagina
        );


        pdf.setFontSize(
            8
        );


        pdf.setTextColor(
            140,
            100,
            90
        );


        pdf.text(
            "Gestor de Horarios",
            148,
            202,
            {
                align: "center"
            }
        );

    }


    /*
       -----------------------------------------------
       DESCARGAR
       -----------------------------------------------
    */

    let nombreArchivo =
        horarioActual.nombre
            .replace(
                /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
                "_"
            );


    if (!nombreArchivo) {

        nombreArchivo =
            "horario";

    }


    pdf.save(
        `${nombreArchivo}.pdf`
    );


    mostrarMensaje(
        "PDF descargado correctamente.",
        "exito"
    );

}


/* =========================================================
   BOTONES
   ========================================================= */

btnGenerar.addEventListener(
    "click",
    generarHorario
);


btnGuardar.addEventListener(
    "click",
    guardarHorario
);


btnPDF.addEventListener(
    "click",
    descargarPDF
);


btnLimpiar.addEventListener(
    "click",
    limpiarFormulario
);


/* =========================================================
   INICIAR
   ========================================================= */

crearFormulario();