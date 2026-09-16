/* =========================================================
   GESTOR DE HORARIOS
   VER HORARIOS
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

const listaHorarios =
    document.getElementById("listaHorarios");


const buscarHorario =
    document.getElementById("buscarHorario");


const totalHorarios =
    document.getElementById("totalHorarios");


const previewHorario =
    document.getElementById("previewHorario");


const btnPDF =
    document.getElementById("btnPDF");


const btnVolver =
    document.getElementById("btnVolver");


/* =========================================================
   VARIABLE DEL HORARIO SELECCIONADO
   ========================================================= */

let horarios = [];

let horarioSeleccionado = null;


/* =========================================================
   CARGAR HORARIOS
   ========================================================= */

function cargarHorarios() {

    try {

        horarios =
            JSON.parse(
                localStorage.getItem("horarios")
            ) || [];

    }

    catch (error) {

        horarios = [];

        console.error(
            "Error al cargar los horarios:",
            error
        );

    }


    mostrarListaHorarios(
        horarios
    );


    actualizarTotal();


    /*
       Si existen horarios,
       seleccionamos automáticamente
       el primero.
    */

    if (
        horarios.length > 0
    ) {

        seleccionarHorario(
            horarios[0].id
        );

    }

}


/* =========================================================
   MOSTRAR LISTA
   ========================================================= */

function mostrarListaHorarios(
    lista
) {

    listaHorarios.innerHTML = "";


    if (
        lista.length === 0
    ) {

        listaHorarios.innerHTML = `

            <div class="sin-resultados">

                <div style="font-size: 40px;">
                    📅
                </div>

                <p>
                    No hay horarios guardados.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(
        horario => {

            const item =
                document.createElement("div");


            item.className =
                "item-horario";


            item.dataset.id =
                horario.id;


            item.innerHTML = `

                <div class="icono-horario">
                    📅
                </div>


                <div class="info-horario">

                    <h3>
                        ${escaparHTML(
                            horario.nombre ||
                            "Horario sin nombre"
                        )}
                    </h3>

                    <p>
                        ${escaparHTML(
                            horario.fecha ||
                            "Sin fecha"
                        )}
                    </p>

                </div>


                <div class="botones-item">


                    <button
                        type="button"
                        class="boton-item boton-ver"
                        title="Ver horario"
                        data-accion="ver"
                        data-id="${horario.id}"
                    >
                        👁️
                    </button>


                    <button
                        type="button"
                        class="boton-item boton-descargar"
                        title="Descargar PDF"
                        data-accion="pdf"
                        data-id="${horario.id}"
                    >
                        ↓
                    </button>


                    <button
                        type="button"
                        class="boton-item boton-eliminar"
                        title="Eliminar horario"
                        data-accion="eliminar"
                        data-id="${horario.id}"
                    >
                        🗑️
                    </button>


                </div>

            `;


            listaHorarios.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   ACTUALIZAR TOTAL
   ========================================================= */

function actualizarTotal() {

    totalHorarios.textContent =
        `Total de horarios: ${horarios.length}`;

}


/* =========================================================
   SELECCIONAR HORARIO
   ========================================================= */

function seleccionarHorario(
    id
) {

    const horario =
        horarios.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!horario) {

        return;

    }


    horarioSeleccionado =
        horario;


    /*
       Quitar selección anterior.
    */

    const items =
        document.querySelectorAll(
            ".item-horario"
        );


    items.forEach(
        item => {

            item.classList.remove(
                "seleccionado"
            );

        }
    );


    /*
       Marcar el seleccionado.
    */

    const seleccionado =
        document.querySelector(
            `.item-horario[data-id="${id}"]`
        );


    if (seleccionado) {

        seleccionado.classList.add(
            "seleccionado"
        );

    }


    /*
       Mostrar el horario.
    */

    generarVistaPrevia(
        horario
    );

}


/* =========================================================
   GENERAR VISTA PREVIA
   ========================================================= */

function generarVistaPrevia(
    horario
) {

    previewHorario.innerHTML = "";


    /* =====================================================
       INFORMACIÓN DEL HORARIO
       ===================================================== */

    const informacion =
        document.createElement("div");


    informacion.className =
        "informacion-preview";


    informacion.innerHTML = `

        <h3>
            ${escaparHTML(
                horario.nombre ||
                "Horario"
            )}
        </h3>

        <p>
            Creado el
            ${escaparHTML(
                horario.fecha ||
                "Sin fecha"
            )}
        </p>

    `;


    previewHorario.appendChild(
        informacion
    );


    /* =====================================================
       DÍAS
       ===================================================== */

    for (
        let dia = 0;
        dia < NUM_DIAS;
        dia++
    ) {


        const bloque =
            document.createElement("div");


        bloque.className =
            "bloque-dia";


        /* =================================================
           ENCABEZADO DEL DÍA
           ================================================= */

        const encabezado =
            document.createElement("div");


        encabezado.className =
            "encabezado-dia";


        encabezado.textContent =
            `DÍA ${dia + 1}`;


        bloque.appendChild(
            encabezado
        );


        /* =================================================
           TABLA
           ================================================= */

        const tabla =
            document.createElement("table");


        tabla.className =
            "tabla-dia";


        tabla.innerHTML = `

            <thead>

                <tr>

                    <th>
                        Hora
                    </th>

                    <th>
                        Clase
                    </th>

                    <th>
                        Asignatura
                    </th>

                    <th>
                        Docente
                    </th>

                </tr>

            </thead>

            <tbody></tbody>

        `;


        const cuerpo =
            tabla.querySelector(
                "tbody"
            );


        /* =================================================
           CLASES
           ================================================= */

        let clasesDia = [];


        if (
            horario.dias &&
            horario.dias[dia] &&
            Array.isArray(
                horario.dias[dia].clases
            )
        ) {

            clasesDia =
                horario.dias[dia].clases;

        }


        for (
            let clase = 0;
            clase < NUM_CLASES;
            clase++
        ) {


            const datos =
                clasesDia[clase] || {

                    clase:
                        clase + 1,

                    inicio:
                        "",

                    final:
                        "",

                    asignatura:
                        "",

                    docente:
                        ""

                };


            const fila =
                document.createElement("tr");


            /* =================================================
               HORA
               ================================================= */

            const celdaHora =
                document.createElement("td");


            celdaHora.className =
                "celda-hora";


            celdaHora.textContent =
                textoHora(
                    datos
                );


            /* =================================================
               CLASE
               ================================================= */

            const celdaClase =
                document.createElement("td");


            celdaClase.textContent =
                `Clase ${
                    datos.clase ||
                    clase + 1
                }`;


            /* =================================================
               ASIGNATURA
               ================================================= */

            const celdaAsignatura =
                document.createElement("td");


            celdaAsignatura.className =
                "celda-asignatura";


            celdaAsignatura.textContent =
                datos.asignatura ||
                "—";


            /* =================================================
               DOCENTE
               ================================================= */

            const celdaDocente =
                document.createElement("td");


            celdaDocente.className =
                "celda-docente";


            celdaDocente.textContent =
                datos.docente ||
                "—";


            /* =================================================
               AGREGAR
               ================================================= */

            fila.appendChild(
                celdaHora
            );


            fila.appendChild(
                celdaClase
            );


            fila.appendChild(
                celdaAsignatura
            );


            fila.appendChild(
                celdaDocente
            );


            cuerpo.appendChild(
                fila
            );

        }


        bloque.appendChild(
            tabla
        );


        previewHorario.appendChild(
            bloque
        );

    }

}


/* =========================================================
   FORMATEAR HORA
   ========================================================= */

function formatearHora(
    hora
) {

    if (!hora) {

        return "";

    }


    const partes =
        hora.split(":");


    let horas =
        parseInt(
            partes[0],
            10
        );


    const minutos =
        partes[1] ||
        "00";


    const periodo =
        horas >= 12
            ? "PM"
            : "AM";


    if (
        horas === 0
    ) {

        horas = 12;

    }

    else if (
        horas > 12
    ) {

        horas -= 12;

    }


    return `${horas}:${minutos} ${periodo}`;

}


/* =========================================================
   TEXTO DE HORA
   ========================================================= */

function textoHora(
    clase
) {

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

        return `${formatearHora(
            clase.inicio
        )} - ${formatearHora(
            clase.final
        )}`;

    }


    if (
        clase.inicio
    ) {

        return formatearHora(
            clase.inicio
        );

    }


    return formatearHora(
        clase.final
    );

}


/* =========================================================
   ELIMINAR HORARIO
   ========================================================= */

function eliminarHorario(
    id
) {

    const horario =
        horarios.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!horario) {

        return;

    }


    const confirmar =
        confirm(
            `¿Seguro que quieres eliminar el horario "${horario.nombre}"?`
        );


    if (!confirmar) {

        return;

    }


    horarios =
        horarios.filter(
            item =>
                Number(item.id) !== Number(id)
        );


    localStorage.setItem(
        "horarios",
        JSON.stringify(horarios)
    );


    horarioSeleccionado =
        null;


    mostrarListaHorarios(
        horarios
    );


    actualizarTotal();


    if (
        horarios.length > 0
    ) {

        seleccionarHorario(
            horarios[0].id
        );

    }

    else {

        mostrarSinSeleccion();

    }

}


/* =========================================================
   MOSTRAR SIN SELECCIÓN
   ========================================================= */

function mostrarSinSeleccion() {

    previewHorario.innerHTML = `

        <div class="sin-seleccion">

            <div class="sin-seleccion-icono">
                📅
            </div>

            <h3>
                Selecciona un horario
            </h3>

            <p>
                Selecciona uno de los horarios
                de la lista para visualizarlo.
            </p>

        </div>

    `;

}


/* =========================================================
   DESCARGAR PDF
   ========================================================= */

function descargarPDF(
    horario
) {

    if (!horario) {

        alert(
            "Primero selecciona un horario."
        );

        return;

    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "No se pudo cargar el generador de PDF. Revisa tu conexión a Internet."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({

            orientation:
                "landscape",

            unit:
                "mm",

            format:
                "a4"

        });


    /* =====================================================
       TÍTULO
       ===================================================== */

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(
        22
    );


    pdf.setTextColor(
        127,
        43,
        29
    );


    pdf.text(
        "GESTOR DE HORARIOS",
        148,
        16,
        {
            align:
                "center"
        }
    );


    /* =====================================================
       NOMBRE
       ===================================================== */

    pdf.setFontSize(
        15
    );


    pdf.setTextColor(
        90,
        45,
        35
    );


    pdf.text(
        horario.nombre ||
        "HORARIO",
        148,
        24,
        {
            align:
                "center"
        }
    );


    let posicionY =
        31;


    /* =====================================================
       CREAR CADA DÍA
       ===================================================== */

    for (
        let dia = 0;
        dia < NUM_DIAS;
        dia++
    ) {


        /*
           Si no cabe otro día en la página,
           creamos una nueva.
        */

        if (
            posicionY > 175
        ) {

            pdf.addPage();

            posicionY =
                15;

        }


        /* =================================================
           ENCABEZADO DEL DÍA
           ================================================= */

        pdf.setFillColor(
            169,
            43,
            23
        );


        pdf.roundedRect(
            14,
            posicionY,
            269,
            8,
            2,
            2,
            "F"
        );


        pdf.setTextColor(
            255,
            255,
            255
        );


        pdf.setFontSize(
            11
        );


        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.text(
            `DÍA ${dia + 1}`,
            20,
            posicionY + 5.5
        );


        posicionY +=
            8;


        /* =================================================
           DATOS
           ================================================= */

        const filas =
            [];


        let clasesDia = [];


        if (
            horario.dias &&
            horario.dias[dia] &&
            Array.isArray(
                horario.dias[dia].clases
            )
        ) {

            clasesDia =
                horario.dias[dia].clases;

        }


        for (
            let clase = 0;
            clase < NUM_CLASES;
            clase++
        ) {


            const datos =
                clasesDia[clase] || {};


            let materia =
                datos.asignatura ||
                "—";


            let docente =
                datos.docente ||
                "—";


            filas.push([

                textoHora(
                    datos
                ),

                `Clase ${
                    datos.clase ||
                    clase + 1
                }`,

                materia,

                docente

            ]);

        }


        /* =================================================
           TABLA PDF
           ================================================= */

        pdf.autoTable({

            head: [[

                "Hora",
                "Clase",
                "Asignatura",
                "Docente"

            ]],

            body:
                filas,

            startY:
                posicionY,

            theme:
                "grid",

            margin: {

                left:
                    14,

                right:
                    14

            },

            styles: {

                font:
                    "helvetica",

                fontSize:
                    8.5,

                textColor:
                    [
                        70,
                        40,
                        32
                    ],

                halign:
                    "center",

                valign:
                    "middle",

                cellPadding:
                    3,

                lineColor:
                    [
                        220,
                        190,
                        180
                    ],

                lineWidth:
                    0.25

            },

            headStyles: {

                fillColor:
                    [
                        247,
                        227,
                        222
                    ],

                textColor:
                    [
                        40,
                        25,
                        20
                    ],

                fontStyle:
                    "bold"

            },

            columnStyles: {

                0: {

                    cellWidth:
                        55,

                    fillColor:
                        [
                            242,
                            223,
                            217
                        ]

                },

                1: {

                    cellWidth:
                        35

                },

                2: {

                    cellWidth:
                        90

                },

                3: {

                    cellWidth:
                        89

                }

            }

        });


        posicionY =
            pdf.lastAutoTable.finalY +
            7;

    }


    /* =====================================================
       PIE DE PÁGINA
       ===================================================== */

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


        pdf.setFont(
            "helvetica",
            "normal"
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
            "Gestor de Horarios - Institución Educativa Inocencio Chincá",
            148,
            202,
            {
                align:
                    "center"
            }
        );

    }


    /* =====================================================
       NOMBRE DEL ARCHIVO
       ===================================================== */

    let nombreArchivo =
        (horario.nombre ||
        "horario")
            .replace(
                /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
                "_"
            );


    if (
        !nombreArchivo
    ) {

        nombreArchivo =
            "horario";

    }


    pdf.save(
        `${nombreArchivo}.pdf`
    );

}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escaparHTML(
    texto
) {

    return String(
        texto || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   BUSCADOR
   ========================================================= */

buscarHorario.addEventListener(
    "input",
    function () {

        const texto =
            this.value
                .trim()
                .toLowerCase();


        const filtrados =
            horarios.filter(
                horario => {

                    const nombre =
                        String(
                            horario.nombre ||
                            ""
                        )
                            .toLowerCase();


                    return nombre.includes(
                        texto
                    );

                }
            );


        mostrarListaHorarios(
            filtrados
        );


        /*
           Si el horario seleccionado
           no aparece en el filtro,
           no hacemos nada con la vista.
        */

    }
);


/* =========================================================
   EVENTOS DE LOS BOTONES DE LA LISTA
   ========================================================= */

listaHorarios.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                "[data-accion]"
            );


        if (!boton) {

            return;

        }


        const accion =
            boton.dataset.accion;


        const id =
            Number(
                boton.dataset.id
            );


        if (
            accion === "ver"
        ) {

            seleccionarHorario(
                id
            );

        }


        else if (
            accion === "pdf"
        ) {

            const horario =
                horarios.find(
                    item =>
                        Number(item.id) === id
                );


            descargarPDF(
                horario
            );

        }


        else if (
            accion === "eliminar"
        ) {

            eliminarHorario(
                id
            );

        }

    }
);


/* =========================================================
   BOTÓN PDF PRINCIPAL
   ========================================================= */

btnPDF.addEventListener(
    "click",
    function () {

        if (
            !horarioSeleccionado
        ) {

            alert(
                "Primero selecciona un horario."
            );

            return;

        }


        descargarPDF(
            horarioSeleccionado
        );

    }
);


/* =========================================================
   VOLVER AL MENÚ
   ========================================================= */

btnVolver.addEventListener(
    "click",
    function () {

        window.location.href =
            "menu.html";

    }
);


/* =========================================================
   INICIAR
   ========================================================= */

cargarHorarios();
