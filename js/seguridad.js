"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN
|--------------------------------------------------------------------------
*/

const STORAGE_REQUESTS = "b2b_requests";
const STORAGE_AUDIT = "b2b_audit";

const USERS = {
    empresa: {
        name: "Corporación ABC",
        role: "Empresa",
        scope: "Solo trámites propios"
    },

    analista: {
        name: "Analista de Zona Norte",
        role: "Analista",
        scope: "Zona Franca Norte"
    },

    auditor: {
        name: "Auditoría General",
        role: "Auditor",
        scope: "Todos los trámites - Solo lectura"
    }
};


/*
|--------------------------------------------------------------------------
| ESTADO
|--------------------------------------------------------------------------
*/

let activeRole = "empresa";

let requests = loadRequests();

let auditLog = loadAuditLog();


/*
|--------------------------------------------------------------------------
| DATOS INICIALES
|--------------------------------------------------------------------------
*/

function createInitialData() {

    const now = new Date();

    const request1Date = new Date(
        now.getTime() - 72 * 60 * 60 * 1000
    );

    const request2Date = new Date(
        now.getTime() - 48 * 60 * 60 * 1000
    );

    const request3Date = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
    );

    return [

        {
            id: "TRM-1001",
            companyName: "Corporación ABC",
            owner: "Corporación ABC",
            requestType: "Importación",
            zone: "Zona Franca Norte",
            description:
                "Solicitud de autorización para importar maquinaria.",
            aiDecision: "Aprobado",
            finalDecision: "Aprobado",
            status: "Resuelto",
            createdAt: request1Date.toISOString(),
            resolvedAt: new Date(
                request1Date.getTime() +
                10 * 60 * 60 * 1000
            ).toISOString()
        },

        {
            id: "TRM-1002",
            companyName: "Distribuidora XYZ",
            owner: "Distribuidora XYZ",
            requestType: "Exportación",
            zone: "Zona Franca Norte",
            description:
                "Registro de mercancía para exportación.",
            aiDecision: "Aprobado",
            finalDecision: "Rechazado",
            status: "Resuelto",
            createdAt: request2Date.toISOString(),
            resolvedAt: new Date(
                request2Date.getTime() +
                18 * 60 * 60 * 1000
            ).toISOString()
        },

        {
            id: "TRM-1003",
            companyName: "Industrias del Pacífico",
            owner: "Industrias del Pacífico",
            requestType: "Permiso especial",
            zone: "Zona Franca Sur",
            description:
                "Solicitud de permiso especial de operación.",
            aiDecision: "Revisión manual",
            finalDecision: "Pendiente",
            status: "Pendiente",
            createdAt: request3Date.toISOString(),
            resolvedAt: null
        }

    ];
}


/*
|--------------------------------------------------------------------------
| LOCAL STORAGE
|--------------------------------------------------------------------------
*/

function loadRequests() {

    const saved =
        localStorage.getItem(STORAGE_REQUESTS);

    if (saved) {

        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error(
                "Error cargando solicitudes:",
                error
            );
        }
    }

    const initialData =
        createInitialData();

    localStorage.setItem(
        STORAGE_REQUESTS,
        JSON.stringify(initialData)
    );

    return initialData;
}


function loadAuditLog() {

    const saved =
        localStorage.getItem(STORAGE_AUDIT);

    if (!saved) {
        return [];
    }

    try {

        const parsed =
            JSON.parse(saved);

        return parsed.map(
            entry => Object.freeze(entry)
        );

    } catch (error) {

        console.error(
            "Error cargando auditoría:",
            error
        );

        return [];
    }
}


function saveRequests() {

    localStorage.setItem(
        STORAGE_REQUESTS,
        JSON.stringify(requests)
    );
}


function saveAuditLog() {

    localStorage.setItem(
        STORAGE_AUDIT,
        JSON.stringify(auditLog)
    );
}


/*
|--------------------------------------------------------------------------
| AUDITORÍA INMUTABLE
|--------------------------------------------------------------------------
*/

function registerAudit(
    action,
    detail,
    aiDecisionModified
) {

    const user =
        USERS[activeRole];

    const auditEntry = Object.freeze({

        id:
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : String(Date.now()),

        timestamp:
            new Date().toISOString(),

        user:
            user.name,

        role:
            user.role,

        action:
            action,

        detail:
            detail,

        aiDecisionModified:
            Boolean(aiDecisionModified)
    });

    auditLog = [
        ...auditLog,
        auditEntry
    ];

    saveAuditLog();

    renderAuditLog();
}


/*
|--------------------------------------------------------------------------
| PERMISOS RBAC
|--------------------------------------------------------------------------
*/

function getVisibleRequests() {

    if (activeRole === "empresa") {

        return requests.filter(
            request =>
                request.owner ===
                USERS.empresa.name
        );
    }

    if (activeRole === "analista") {

        return requests.filter(
            request =>
                request.zone ===
                "Zona Franca Norte"
        );
    }

    if (activeRole === "auditor") {

        return [...requests];
    }

    return [];
}


function canCreate() {

    return activeRole === "empresa";
}


function canEdit(request) {

    return (
        activeRole === "empresa" &&
        request.owner === USERS.empresa.name
    );
}


function canResolve(request) {

    return (
        activeRole === "analista" &&
        request.zone === "Zona Franca Norte"
    );
}


/*
|--------------------------------------------------------------------------
| ELEMENTOS DEL FORMULARIO
|--------------------------------------------------------------------------
*/

const requestForm =
    document.getElementById("requestForm");

const requestId =
    document.getElementById("requestId");

const companyName =
    document.getElementById("companyName");

const requestType =
    document.getElementById("requestType");

const zone =
    document.getElementById("zone");

const description =
    document.getElementById("description");

const aiDecision =
    document.getElementById("aiDecision");

const finalDecision =
    document.getElementById("finalDecision");

const saveRequestButton =
    document.getElementById(
        "saveRequestButton"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


/*
|--------------------------------------------------------------------------
| CREAR / EDITAR
|--------------------------------------------------------------------------
*/

requestForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        if (!canCreate()) {

            alert(
                "El usuario actual no tiene permisos para crear o editar."
            );

            return;
        }

        const id =
            requestId.value;

        const company =
            companyName.value.trim();

        const type =
            requestType.value;

        const selectedZone =
            zone.value;

        const text =
            description.value.trim();

        const suggestedDecision =
            aiDecision.value;


        if (
            !company ||
            !type ||
            !selectedZone ||
            !text
        ) {

            alert(
                "Complete todos los campos obligatorios."
            );

            return;
        }


        /*
        |--------------------------------------------------------------
        | EDICIÓN
        |--------------------------------------------------------------
        */

        if (id) {

            const existingRequest =
                requests.find(
                    request =>
                        request.id === id
                );


            if (!existingRequest) {

                alert(
                    "La solicitud no existe."
                );

                return;
            }


            if (!canEdit(existingRequest)) {

                alert(
                    "No tiene permiso para editar esta solicitud."
                );

                return;
            }


            const oldAiDecision =
                existingRequest.aiDecision;


            const aiWasModified =
                oldAiDecision !==
                suggestedDecision;


            existingRequest.companyName =
                company;

            existingRequest.requestType =
                type;

            existingRequest.zone =
                selectedZone;

            existingRequest.description =
                text;

            existingRequest.aiDecision =
                suggestedDecision;


            saveRequests();


            registerAudit(
                "EDICIÓN",
                "Se editó la solicitud " + id,
                aiWasModified
            );


            resetForm();

            renderAll();

            return;
        }


        /*
        |--------------------------------------------------------------
        | CREACIÓN
        |--------------------------------------------------------------
        */

        const newRequest = {

            id:
                generateRequestId(),

            companyName:
                company,

            owner:
                USERS.empresa.name,

            requestType:
                type,

            zone:
                selectedZone,

            description:
                text,

            aiDecision:
                suggestedDecision,

            finalDecision:
                "Pendiente",

            status:
                "Pendiente",

            createdAt:
                new Date().toISOString(),

            resolvedAt:
                null
        };


        requests.push(newRequest);

        saveRequests();


        registerAudit(
            "CREACIÓN",
            "Se creó la solicitud " +
            newRequest.id,
            false
        );


        resetForm();

        renderAll();
    }
);


/*
|--------------------------------------------------------------------------
| GENERAR ID
|--------------------------------------------------------------------------
*/

function generateRequestId() {

    let number = 1001;

    while (
        requests.some(
            request =>
                request.id ===
                "TRM-" + number
        )
    ) {

        number++;
    }

    return "TRM-" + number;
}


/*
|--------------------------------------------------------------------------
| EDITAR SOLICITUD
|--------------------------------------------------------------------------
*/

function editRequest(id) {

    const request =
        requests.find(
            item => item.id === id
        );


    if (!request) {
        return;
    }


    if (!canEdit(request)) {

        alert(
            "No puede editar esta solicitud."
        );

        return;
    }


    requestId.value =
        request.id;

    companyName.value =
        request.companyName;

    requestType.value =
        request.requestType;

    zone.value =
        request.zone;

    description.value =
        request.description;

    aiDecision.value =
        request.aiDecision;

    finalDecision.value =
        request.finalDecision;


    saveRequestButton.textContent =
        "Actualizar solicitud";

    cancelEditButton.hidden =
        false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/*
|--------------------------------------------------------------------------
| REINICIAR FORMULARIO
|--------------------------------------------------------------------------
*/

function resetForm() {

    requestForm.reset();

    requestId.value = "";

    if (activeRole === "empresa") {

        companyName.value =
            USERS.empresa.name;
    }

    saveRequestButton.textContent =
        "Guardar solicitud";

    cancelEditButton.hidden =
        true;

    finalDecision.value =
        "Pendiente";
}


cancelEditButton.addEventListener(
    "click",
    resetForm
);


/*
|--------------------------------------------------------------------------
| RESOLVER SOLICITUD
|--------------------------------------------------------------------------
*/

function resolveRequest(id) {

    const request =
        requests.find(
            item => item.id === id
        );


    if (!request) {
        return;
    }


    if (!canResolve(request)) {

        alert(
            "Solo puede resolver solicitudes de Zona Franca Norte."
        );

        return;
    }


    if (request.status === "Resuelto") {

        alert(
            "La solicitud ya fue resuelta."
        );

        return;
    }


    const newDecision =
        prompt(
            "Decisión final:\n\n" +
            "1 - Aprobado\n" +
            "2 - Rechazado\n" +
            "3 - Revisión manual",
            "1"
        );


    if (newDecision === null) {
        return;
    }


    const decisionMap = {

        "1": "Aprobado",

        "2": "Rechazado",

        "3": "Revisión manual"
    };


    if (!decisionMap[newDecision]) {

        alert(
            "Decisión inválida."
        );

        return;
    }


    const finalResult =
        decisionMap[newDecision];


    const aiWasModified =
        request.aiDecision !==
        finalResult;


    request.finalDecision =
        finalResult;

    request.status =
        "Resuelto";

    request.resolvedAt =
        new Date().toISOString();


    saveRequests();


    registerAudit(
        "RESOLUCIÓN",
        "Se resolvió la solicitud " +
        request.id +
        " con decisión: " +
        finalResult,
        aiWasModified
    );


    renderAll();
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

function calculateDashboard() {

    const total =
        requests.length;


    const resolvedRequests =
        requests.filter(
            request =>
                request.status === "Resuelto"
        );


    const approvedRequests =
        requests.filter(
            request =>
                request.finalDecision ===
                "Aprobado"
        );


    let approvalRate = 0;


    if (resolvedRequests.length > 0) {

        approvalRate =
            (
                approvedRequests.length /
                resolvedRequests.length
            ) * 100;
    }


    const responseTimes =
        resolvedRequests
            .filter(
                request =>
                    request.createdAt &&
                    request.resolvedAt
            )
            .map(
                request => {

                    const created =
                        new Date(
                            request.createdAt
                        ).getTime();

                    const resolved =
                        new Date(
                            request.resolvedAt
                        ).getTime();

                    return resolved - created;
                }
            );


    let averageHours = 0;


    if (responseTimes.length > 0) {

        const totalMilliseconds =
            responseTimes.reduce(
                (total, current) =>
                    total + current,
                0
            );


        const averageMilliseconds =
            totalMilliseconds /
            responseTimes.length;


        averageHours =
            averageMilliseconds /
            (1000 * 60 * 60);
    }


    document.getElementById(
        "totalRequests"
    ).textContent =
        total;


    document.getElementById(
        "approvalRate"
    ).textContent =
        approvalRate.toFixed(1) + "%";


    document.getElementById(
        "averageResponseTime"
    ).textContent =
        averageHours.toFixed(1) +
        " horas";
}


/*
|--------------------------------------------------------------------------
| TABLA DE SOLICITUDES
|--------------------------------------------------------------------------
*/

function renderRequests() {

    const tableBody =
        document.getElementById(
            "requestsTableBody"
        );


    tableBody.innerHTML = "";


    const visibleRequests =
        getVisibleRequests();


    if (visibleRequests.length === 0) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 11;

        cell.textContent =
            "No existen solicitudes disponibles.";

        row.appendChild(cell);

        tableBody.appendChild(row);

        return;
    }


    visibleRequests.forEach(
        request => {

            const row =
                document.createElement("tr");


            addCell(row, request.id);

            addCell(
                row,
                request.companyName
            );

            addCell(
                row,
                request.requestType
            );

            addCell(
                row,
                request.zone
            );

            addCell(
                row,
                request.description
            );

            addCell(
                row,
                request.aiDecision
            );

            addCell(
                row,
                request.finalDecision
            );

            addCell(
                row,
                request.status
            );

            addCell(
                row,
                formatDate(
                    request.createdAt
                )
            );

            addCell(
                row,
                request.resolvedAt
                    ? formatDate(
                        request.resolvedAt
                    )
                    : "Pendiente"
            );


            const actionCell =
                document.createElement("td");


            /*
            |----------------------------------------------------------
            | EMPRESA
            |----------------------------------------------------------
            */

            if (canEdit(request)) {

                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.type =
                    "button";

                editButton.textContent =
                    "Editar";

                editButton.addEventListener(
                    "click",
                    () =>
                        editRequest(
                            request.id
                        )
                );

                actionCell.appendChild(
                    editButton
                );
            }


            /*
            |----------------------------------------------------------
            | ANALISTA
            |----------------------------------------------------------
            */

            if (canResolve(request)) {

                const resolveButton =
                    document.createElement(
                        "button"
                    );

                resolveButton.type =
                    "button";

                resolveButton.textContent =
                    "Resolver";

                resolveButton.addEventListener(
                    "click",
                    () =>
                        resolveRequest(
                            request.id
                        )
                );

                actionCell.appendChild(
                    resolveButton
                );
            }


            /*
            |----------------------------------------------------------
            | AUDITOR
            |----------------------------------------------------------
            */

            if (activeRole === "auditor") {

                const label =
                    document.createElement(
                        "span"
                    );

                label.textContent =
                    " Solo lectura";

                actionCell.appendChild(
                    label
                );
            }


            row.appendChild(actionCell);

            tableBody.appendChild(row);
        }
    );
}


function addCell(row, value) {

    const cell =
        document.createElement("td");

    cell.textContent =
        value;

    row.appendChild(cell);
}


/*
|--------------------------------------------------------------------------
| AUDITORÍA
|--------------------------------------------------------------------------
*/

function renderAuditLog() {

    const tableBody =
        document.getElementById(
            "auditTableBody"
        );


    tableBody.innerHTML = "";


    if (auditLog.length === 0) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "No existen registros de auditoría.";

        row.appendChild(cell);

        tableBody.appendChild(row);

        return;
    }


    [...auditLog]
        .reverse()
        .forEach(
            entry => {

                const row =
                    document.createElement(
                        "tr"
                    );


                addCell(
                    row,
                    formatDate(
                        entry.timestamp
                    )
                );

                addCell(
                    row,
                    entry.user
                );

                addCell(
                    row,
                    entry.role
                );

                addCell(
                    row,
                    entry.action
                );

                addCell(
                    row,
                    entry.detail
                );

                addCell(
                    row,
                    entry.aiDecisionModified
                        ? "SÍ"
                        : "NO"
                );


                tableBody.appendChild(row);
            }
        );
}


/*
|--------------------------------------------------------------------------
| INFORMACIÓN DEL USUARIO
|--------------------------------------------------------------------------
*/

function renderUserInformation() {

    const user =
        USERS[activeRole];


    document.getElementById(
        "activeUser"
    ).textContent =
        user.name;


    document.getElementById(
        "activeRole"
    ).textContent =
        user.role;


    document.getElementById(
        "accessScope"
    ).textContent =
        user.scope;


    const message =
        document.getElementById(
            "permissionMessage"
        );


    if (activeRole === "empresa") {

        message.textContent =
            "Puede crear y editar únicamente sus propios trámites.";

    } else if (activeRole === "analista") {

        message.textContent =
            "Puede consultar y resolver solicitudes de Zona Franca Norte.";

    } else {

        message.textContent =
            "Modo auditor: todos los trámites son visibles y solo lectura.";
    }


    configureFormPermissions();
}


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DEL FORMULARIO SEGÚN ROL
|--------------------------------------------------------------------------
*/

function configureFormPermissions() {

    const fields = [

        companyName,

        requestType,

        zone,

        description,

        aiDecision,

        finalDecision

    ];


    if (activeRole === "empresa") {

        fields.forEach(
            field => {
                field.disabled = false;
            }
        );

        saveRequestButton.disabled =
            false;

    } else {

        fields.forEach(
            field => {
                field.disabled = true;
            }
        );

        saveRequestButton.disabled =
            true;
    }
}


/*
|--------------------------------------------------------------------------
| FECHAS
|--------------------------------------------------------------------------
*/

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "es-CR",
        {
            dateStyle: "short",
            timeStyle: "medium"
        }
    );
}


/*
|--------------------------------------------------------------------------
| CAMBIO DE ROL
|--------------------------------------------------------------------------
*/

document.getElementById(
    "roleSelector"
).addEventListener(
    "change",
    function(event) {

        activeRole =
            event.target.value;

        resetForm();

        renderAll();
    }
);


/*
|--------------------------------------------------------------------------
| RENDER GENERAL
|--------------------------------------------------------------------------
*/

function renderAll() {

    renderUserInformation();

    renderRequests();

    renderAuditLog();

    calculateDashboard();
}


/*
|--------------------------------------------------------------------------
| INICIALIZACIÓN
|--------------------------------------------------------------------------
*/

renderAll();