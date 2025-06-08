// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = [];
let currentEmpresaSelected = '';

// Función para generar datos de ejemplo
function generateSampleData() {
    const database = {
        estudios: [],
        planes: [],
        medidas: [],
        servicentros: [],
        directivas: [], // Esto se mantiene vacío, las subcategorías lo usarán
        'empresas-rrhh': [], 
        'guardias-propios': [],
        'eventos-masivos': [],
        'directivas-generales': []
    };

    // Crear lista de empresas únicas de RRHH primero (300 empresas)
    empresasRRHHList = [];
    for (let i = 1; i <= 300; i++) {
        const empresaName = `Empresa RRHH ${String(i).padStart(3, '0')}`;
        empresasRRHHList.push({
            id: i,
            nombre: empresaName,
            directivasCount: 0 // Se calculará después al generar las directivas
        });
    }

    // Generar 5 estudios de seguridad
    const tiposEstudio = ['Análisis de Riesgos', 'Evaluación de Vulnerabilidades', 'Auditoría de Seguridad', 'Impacto Ambiental'];
    const responsables = ['Dr. Carlos López', 'Ing. María González', 'Dr. Juan Pérez', 'Lic. Ana Torres', 'Ing. Pedro Sánchez'];
    
    for (let i = 1; i <= 5; i++) {
        database.estudios.push({
            codigo: `EST-${String(i).padStart(3, '0')}`,
            tipo: tiposEstudio[Math.floor(Math.random() * tiposEstudio.length)],
            fechaInicio: `2025-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            fechaFin: `2025-${String(Math.floor(Math.random() * 6) + 7).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            objeto: `Evaluación de seguridad en área ${i}`,
            metodologia: `Metodología basada en estándares internacionales ISO 27001 y análisis cuantitativo de riesgos`,
            responsable: responsables[i - 1]
        });
    }

    // Generar 61 planes de seguridad
    const tiposPlanes = ['Emergencia', 'Contingencia', 'Evacuación', 'Recuperación'];
    const areas = ['Edificio Principal', 'Planta de Producción', 'Laboratorio', 'Almacén', 'Oficinas Administrativas'];
    
    for (let i = 1; i <= 61; i++) {
        database.planes.push({
            codigo: `PLN-${String(i).padStart(3, '0')}`,
            tipo: tiposPlanes[Math.floor(Math.random() * tiposPlanes.length)],
            vigencia: `2025-12-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            revision: `2025-${String(Math.floor(Math.random() * 6) + 6).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            objetivo: `Establecer procedimientos de seguridad para ${areas[Math.floor(Math.random() * areas.length)]}`,
            alcance: `Aplicable a todo el personal de ${areas[Math.floor(Math.random() * areas.length)]}`
        });
    }

    // Generar 90 medidas de seguridad
    const categorias = ['Preventiva', 'Correctiva', 'Detectiva', 'Compensatoria'];
    const prioridades = ['Alta', 'Media', 'Baja'];
    const estados = ['Implementada', 'En proceso', 'Pendiente', 'Suspendida'];
    const responsablesMedidas = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Torres', 'Pedro Sánchez', 'Luis Martín', 'Carmen Ruiz'];
    
    for (let i = 1; i <= 90; i++) {
        database.medidas.push({
            codigo: `MED-${String(i).padStart(3, '0')}`,
            categoria: categorias[Math.floor(Math.random() * categorias.length)],
            prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
            estado: estados[Math.floor(Math.random() * estados.length)],
            descripcion: `Medida de seguridad ${i}: Control y monitoreo de accesos, implementación de protocolos de seguridad`,
            responsable: responsablesMedidas[Math.floor(Math.random() * responsablesMedidas.length)]
        });
    }

    // Generar 90 servicentros
    const tiposServicentros = ['Gasolinera', 'Taller Mecánico', 'Lavado de Autos', 'Cambio de Aceite', 'Revisión Técnica'];
    const ubicaciones = ['Norte', 'Sur', 'Centro', 'Este', 'Oeste'];
    const responsablesServicentros = ['Carlos Mendez', 'Laura Silva', 'Roberto Díaz', 'Patricia Morales', 'Fernando Castro'];
    
    for (let i = 1; i <= 90; i++) {
        database.servicentros.push({
            codigo: `SER-${String(i).padStart(3, '0')}`,
            nombre: `Servicentro ${i}`,
            tipo: tiposServicentros[Math.floor(Math.random() * tiposServicentros.length)],
            ubicacion: `Zona ${ubicaciones[Math.floor(Math.random() * ubicaciones.length)]}`,
            direccion: `Calle ${i}, Sector ${Math.floor(Math.random() * 20) + 1}`,
            telefono: `+56-9-${Math.floor(Math.random() * 90000000) + 10000000}`,
            horario: `${Math.floor(Math.random() * 12) + 6}:00 - ${Math.floor(Math.random() * 6) + 18}:00`,
            capacidad: `${Math.floor(Math.random() * 50) + 10} vehículos`,
            responsable: responsablesServicentros[Math.floor(Math.random() * responsablesServicentros.length)],
            estado: Math.random() > 0.2 ? 'Operativo' : 'Mantenimiento'
        });
    }

    // Generar subcategorías de directivas de funcionamiento
    
    // 1. Generar 800 registros de Empresas de RRHH (distribuidos en 300 empresas)
    const tiposDirectivaRRHH = ['Contratación', 'Capacitación', 'Evaluación', 'Bienestar', 'Nómina', 'Beneficios'];
    const lugaresInstalacion = ['Oficinas Centrales', 'Sucursal Norte', 'Sucursal Sur', 'Planta Industrial', 'Centro Comercial'];
    const direcciones = ['Av. Providencia 1234', 'Calle Moneda 567', 'Av. Las Condes 890', 'Calle Huérfanos 432', 'Av. Libertador 678'];
    
    for (let i = 1; i <= 800; i++) {
        const empresaAsignada = empresasRRHHList[Math.floor(Math.random() * empresasRRHHList.length)];
        database['empresas-rrhh'].push({
            numero: `RRHH-${String(i).padStart(4, '0')}`,
            empresa: empresaAsignada.nombre,
            tipoDirectiva: tiposDirectivaRRHH[Math.floor(Math.random() * tiposDirectivaRRHH.length)],
            lugarInstalacion: lugaresInstalacion[Math.floor(Math.random() * lugaresInstalacion.length)],
            direccion: direcciones[Math.floor(Math.random() * direcciones.length)],
            fechaAprobacion: `2025-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            cantidadGuardias: `${Math.floor(Math.random() * 15) + 2} guardias`,
            area: 'Recursos Humanos',
            version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            titulo: `Directiva ${tiposDirectivaRRHH[Math.floor(Math.random() * tiposDirectivaRRHH.length)]} - ${empresaAsignada.nombre}`,
            contenido: `Procedimiento específico de recursos humanos para ${empresaAsignada.nombre}. Establece los lineamientos para la gestión del personal.`,
            responsable: `Jefe RRHH ${empresaAsignada.nombre}`,
            estado: Math.random() > 0.1 ? 'Vigente' : 'En revisión'
        });
        
        // Incrementar contador de directivas para esta empresa
        empresaAsignada.directivasCount++;
    }

    // 2. Generar 50 registros de Empresas con Guardias Propios  
    const tiposGuardias = ['Seguridad Industrial', 'Vigilancia Perimetral', 'Control de Acceso', 'Rondas Nocturnas'];
    const condominios = ['Condominio Mistral V', 'Condominio Las Torres', 'Condominio Portal del Sol', 'Condominio Vista Hermosa'];
    
    for (let i = 1; i <= 50; i++) {
        database['guardias-propios'].push({
            numero: `GUARD-${String(i).padStart(3, '0')}`,
            empresa: i <= 4 ? condominios[i-1] : `Empresa Seguridad ${String(i).padStart(2, '0')}`,
            tipoServicio: tiposGuardias[Math.floor(Math.random() * tiposGuardias.length)],
            lugarInstalacion: i <= 4 ? `${condominios[i-1]} - Torre Principal` : `Instalación ${i}`,
            direccion: direcciones[Math.floor(Math.random() * direcciones.length)],
            fechaAprobacion: `2025-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            cantidadGuardias: `${Math.floor(Math.random() * 12) + 3} guardias`,
            area: 'Seguridad Privada',
            version: `${Math.floor(Math.random() * 3) + 1}.0`,
            titulo: `Protocolo de Guardias ${tiposGuardias[Math.floor(Math.random() * tiposGuardias.length)]}`,
            contenido: `Directiva para el manejo de guardias propios en servicios de seguridad privada. Incluye protocolos de actuación.`,
            turno: Math.random() > 0.5 ? '24/7' : 'Diurno',
            responsable: `Jefe Seguridad Emp-${String(i).padStart(2, '0')}`,
            estado: 'Activo'
        });
    }

    // 3. Generar 50 registros de Eventos Masivos
    const tiposEventos = ['Conciertos', 'Eventos Deportivos', 'Ferias', 'Festivales', 'Conferencias'];
    const ubicacionesEventos = ['Estadio Nacional', 'Arena Movistar', 'Centro de Eventos', 'Parque OHiggins', 'Teatro Municipal'];
    const empresasEventos = ['Productora Musical SPA', 'Eventos & Shows Ltda', 'Mega Eventos SA', 'Show Business SPA', 'Entertainment Group Ltda'];
    const ruts = ['12.345.678-9', '87.654.321-K', '23.456.789-1', '98.765.432-7', '34.567.890-2'];
    
    for (let i = 1; i <= 50; i++) {
        const empresa = empresasEventos[Math.floor(Math.random() * empresasEventos.length)];
        const fechaEvento = `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const aprobado = Math.random() > 0.2;
        
        database['eventos-masivos'].push({
            numero: `EVENT-${String(i).padStart(3, '0')}`,
            nombreEmpresa: empresa,
            rut: ruts[Math.floor(Math.random() * ruts.length)],
            fechaEvento: fechaEvento,
            nombreEvento: `${tiposEventos[Math.floor(Math.random() * tiposEventos.length)]} ${i}`,
            direccion: direcciones[Math.floor(Math.random() * direcciones.length)],
            fechaAprobacion: `2025-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            estadoAprobacion: aprobado ? 'APROBADO' : 'RECHAZADO',
            cantidadGuardias: `${Math.floor(Math.random() * 50) + 10} guardias`,
            tipoEvento: tiposEventos[Math.floor(Math.random() * tiposEventos.length)],
            ubicacion: ubicacionesEventos[Math.floor(Math.random() * ubicacionesEventos.length)],
            area: 'Eventos y Espectáculos',
            version: '1.0',
            titulo: `Protocolo de Seguridad - ${tiposEventos[Math.floor(Math.random() * tiposEventos.length)]}`,
            contenido: `Directiva de seguridad para eventos masivos. Incluye protocolos de evacuación, control de multitudes y emergencias.`,
            capacidad: `${Math.floor(Math.random() * 50000) + 5000} personas`,
            duracion: `${Math.floor(Math.random() * 8) + 2} horas`,
            responsable: `Coordinador Eventos ${String(i).padStart(2, '0')}`,
            estado: aprobado ? 'Aprobado' : 'Rechazado'
        });
    }

    // 4. Generar 300 Directivas Generales (resto para completar 1200)
    const areasGenerales = ['Operaciones', 'Mantenimiento', 'Calidad', 'Administración', 'Logística'];
    for (let i = 1; i <= 300; i++) {
        const area = areasGenerales[Math.floor(Math.random() * areasGenerales.length)];
        database['directivas-generales'].push({
            numero: `GEN-${String(i).padStart(4, '0')}`,
            area: area,
            version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            fecha: `2025-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            titulo: `Directiva General ${i} - ${area}`,
            contenido: `Directiva general para el área de ${area}. Establece procedimientos estándar de funcionamiento organizacional.`,
            alcance: 'Toda la organización',
            responsable: `Jefe de ${area}`,
            estado: Math.random() > 0.15 ? 'Vigente' : 'En actualización'
        });
    }

    // Mantener las directivas originales como respaldo (vacío por ahora)
    database.directivas = [];

    return database;
}

// Base de datos con la cantidad exacta de registros, inicializada al cargar el script
let database = generateSampleData();

// Funciones de navegación principal
function showHome() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('home').style.display = 'block';
    updateCounts(); // Actualiza los contadores al volver a la página de inicio
}

function showSection(sectionName) {
    document.getElementById('home').style.display = 'none'; // Oculta la página de inicio
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active'); // Oculta todas las demás secciones
    });
    document.getElementById(sectionName).classList.add('active'); // Muestra la sección deseada
    
    // Muestra la pestaña de consultar por defecto en la sección activa
    showTab(sectionName, 'consultar');
}

function showTab(section, tab) {
    // Actualiza los botones de navegación de la pestaña
    const tabButtons = document.querySelectorAll(`#${section} .tab-btn`);
    tabButtons.forEach(btn => btn.classList.remove('active')); // Desactiva todos los botones

    // Activa el botón de la pestaña seleccionada
    let activeButton;
    if (tab === 'consultar') {
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Consultar'));
    } else if (tab === 'agregar') {
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Agregar'));
    } else if (tab === 'servicentros') {
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Servicentros'));
    }
    
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Muestra el contenido de la pestaña seleccionada
    const tabContents = document.querySelectorAll(`#${section} .tab-content`);
    tabContents.forEach(content => content.classList.remove('active')); // Oculta todo el contenido de las pestañas
    
    document.getElementById(`${section}-${tab}`).classList.add('active'); // Muestra el contenido de la pestaña
}

// Funciones para la navegación específica de la sección "Directivas de Funcionamiento"
function showEmpresasRRHH() {
    document.getElementById('directivas-consultar').classList.remove('active'); // Oculta la vista principal de directivas
    document.getElementById('directivas-empresas-list').classList.add('active'); // Muestra la vista de lista de empresas
    loadEmpresasList(); // Carga la lista de empresas
}

function showGuardiasMenu() {
    showRecords('guardias-propios'); // Muestra los registros de guardias propios
}

function showEventosMenu() {
    showRecords('eventos-masivos'); // Muestra los registros de eventos masivos
}

// Función para volver a la vista principal de Directivas
function backToDirectivasMain() {
    document.getElementById('directivas-empresas-list').classList.remove('active');
    document.getElementById('directivas-empresa-detail').classList.remove('active');
    document.getElementById('directivas-consultar').classList.add('active');
}

// Función para volver a la lista de empresas RRHH desde el detalle de una empresa
function backToEmpresasList() {
    document.getElementById('directivas-empresa-detail').classList.remove('active');
    document.getElementById('directivas-empresas-list').classList.add('active');
}

// Carga y muestra la lista de empresas RRHH
function loadEmpresasList() {
    const resultsContainer = document.getElementById('empresas-list-results');
    
    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>ID</th><th>Nombre de la Empresa</th><th>Directivas RRHH</th><th>Acción</th>';
    tableHTML += '</tr></thead><tbody>';

    empresasRRHHList.forEach(empresa => {
        tableHTML += `<tr>
            <td>${String(empresa.id).padStart(3, '0')}</td>
            <td>${empresa.nombre}</td>
            <td>${empresa.directivasCount} directivas</td>
            <td><button class="btn directivas" onclick="showEmpresaDirectivas('${empresa.nombre}')" style="padding: 8px 16px; font-size: 14px;">📋 Ver Directivas</button></td>
        </tr>`;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}

// Muestra las directivas de una empresa RRHH específica
function showEmpresaDirectivas(empresaNombre) {
    currentEmpresaSelected = empresaNombre; // Guarda la empresa seleccionada globalmente
    
    document.getElementById('directivas-empresas-list').classList.remove('active'); // Oculta la lista de empresas
    document.getElementById('directivas-empresa-detail').classList.add('active'); // Muestra el detalle de la empresa
    
    document.getElementById('empresa-detail-title').textContent = `📋 Directivas de ${empresaNombre}`; // Actualiza el título
    
    loadEmpresaDirectivas(empresaNombre); // Carga las directivas para esta empresa
}

// Carga las directivas de una empresa específica en la vista de detalle
function loadEmpresaDirectivas(empresaNombre) {
    const resultsContainer = document.getElementById('empresa-directivas-results');
    const directivasEmpresa = database['empresas-rrhh'].filter(directiva => directiva.empresa === empresaNombre);
    
    if (directivasEmpresa.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay directivas para esta empresa</div>';
        return;
    }

    const table = createTableForEmpresa(directivasEmpresa); // Crea la tabla específica para la empresa
    resultsContainer.innerHTML = table;
}

// Crea una tabla para mostrar los datos de una empresa específica
function createTableForEmpresa(data) {
    if (data.length === 0) {
        return '<div class="no-data">No se encontraron directivas</div>';
    }

    const headers = Object.keys(data[0]);
    let tableHTML = '<table class="data-table"><thead><tr>';
    
    headers.forEach(header => {
        if (header !== 'empresa') { // Excluye la columna "empresa" ya que es la misma para todos los registros
            tableHTML += `<th>${formatHeader(header)}</th>`;
        }
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((row, index) => {
        tableHTML += `<tr onclick="showDetailsEmpresa('${currentEmpresaSelected}', ${index})" style="cursor: pointer;">`;
        headers.forEach(header => {
            if (header !== 'empresa') {
                let value = row[header] || '-';
                if (value.length > 50) {
                    value = value.substring(0, 50) + '...';
                }
                tableHTML += `<td>${value}</td>`;
            }
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

// Muestra los detalles de una directiva de empresa RRHH en el modal
function showDetailsEmpresa(empresaNombre, index) {
    const directivasEmpresa = database['empresas-rrhh'].filter(directiva => directiva.empresa === empresaNombre);
    const item = directivasEmpresa[index];
    
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Detalles - ${item.numero} (${empresaNombre})`;
    modalTitle.className = 'modal-title directivas'; // Asigna la clase de estilo para el título del modal

    let detailsHTML = '';
    Object.keys(item).forEach(key => {
        detailsHTML += `
            <div class="detail-item directivas">
                <div class="detail-label">${formatHeader(key)}</div>
                <div class="detail-value">${item[key] || 'No especificado'}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML = detailsHTML;
    modal.style.display = 'block';
}

// Busca empresas RRHH por término de búsqueda
function searchEmpresas(searchTerm) {
    const filteredEmpresas = empresasRRHHList.filter(empresa => 
        empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const resultsContainer = document.getElementById('empresas-list-results');
    
    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>ID</th><th>Nombre de la Empresa</th><th>Directivas RRHH</th><th>Acción</th>';
    tableHTML += '</tr></thead><tbody>';

    filteredEmpresas.forEach(empresa => {
        tableHTML += `<tr>
            <td>${String(empresa.id).padStart(3, '0')}</td>
            <td>${empresa.nombre}</td>
            <td>${empresa.directivasCount} directivas</td>
            <td><button class="btn directivas" onclick="showEmpresaDirectivas('${empresa.nombre}')" style="padding: 8px 16px; font-size: 14px;">📋 Ver Directivas</button></td>
        </tr>`;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}

// Busca directivas dentro de una empresa RRHH específica
function searchDirectivasEmpresa(searchTerm) {
    const directivasEmpresa = database['empresas-rrhh'].filter(directiva => 
        directiva.empresa === currentEmpresaSelected &&
        Object.values(directiva).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    
    const resultsContainer = document.getElementById('empresa-directivas-results');
    const table = createTableForEmpresa(directivasEmpresa);
    resultsContainer.innerHTML = table;
}

// Función genérica para mostrar la vista de registros de cualquier sección
function showRecords(section) {
    document.getElementById(`${section}-consultar`).classList.remove('active'); // Oculta la vista de consulta
    document.getElementById(`${section}-records`).classList.add('active'); // Muestra la vista de registros
    loadData(section); // Carga los datos correspondientes a la sección
}

// Función para volver a la vista de consulta desde la vista de registros
function backToConsultar(section) {
    document.getElementById(`${section}-records`).classList.remove('active');
    document.getElementById(`${section}-consultar`).classList.add('active');
}

// Función para mostrar detalles de un condominio específico en Guardias Propios (ejemplo)
function showCondominioDetails(condominioName) {
    const item = database['guardias-propios'].find(item => item.empresa === condominioName);
    if (item) {
        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Detalles - ${item.numero} (${condominioName})`;
        modalTitle.className = 'modal-title guardias-propios';
        
        let detailsHTML = '';
        Object.keys(item).forEach(key => {
            detailsHTML += `
                <div class="detail-item guardias-propios">
                    <div class="detail-label">${formatHeader(key)}</div>
                    <div class="detail-value">${item[key] || 'No especificado'}</div>
                </div>
            `;
        });
        
        modalBody.innerHTML = detailsHTML;
        modal.style.display = 'block';
    } else {
        showAlert('directivas', 'Detalles del condominio no encontrados.', 'error');
    }
}


// Funciones para manejar datos (agregar, cargar, buscar, mostrar detalles)
function addRecord(section, event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    
    const formData = {};
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Normaliza el nombre de la clave para que coincida con la estructura de datos
        let key = input.id.replace(`${section.slice(0, -1)}-`, '').replace('-', '');
        if (key === 'fechainicio') key = 'fechaInicio'; // Corrección de nombre de campo
        if (key === 'fechafin') key = 'fechaFin'; // Corrección de nombre de campo
        formData[key] = input.value;
    });

    database[section].push(formData); // Añade el nuevo registro a la base de datos
    
    form.reset(); // Limpia el formulario
    
    showAlert(section, 'Registro guardado exitosamente', 'success'); // Muestra un mensaje de éxito
    
    updateCounts(); // Actualiza los contadores en la página de inicio
    
    showTab(section, 'consultar'); // Vuelve a la pestaña de consulta
}

// Carga y muestra los datos de una sección en formato de tabla
function loadData(section) {
    const resultsContainer = document.getElementById(`${section}-results`);
    const data = database[section];
    
    if (data.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
        return;
    }

    const table = createTable(section, data); // Crea la tabla con los datos
    resultsContainer.innerHTML = table;
}

// Crea una tabla HTML a partir de un array de objetos
function createTable(section, data) {
    if (data.length === 0) {
        return '<div class="no-data">No se encontraron resultados</div>';
    }

    const headers = Object.keys(data[0]); // Obtiene los encabezados de la tabla a partir de las claves del primer objeto
    let tableHTML = '<table class="data-table"><thead><tr>';
    
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`; // Formatea el encabezado para una mejor lectura
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((row, index) => {
        tableHTML += `<tr onclick="showDetails('${section}', ${index})">`; // Cada fila es clicable para mostrar detalles
        headers.forEach(header => {
            let value = row[header] || '-';
            if (typeof value === 'string' && value.length > 50) { // Trunca el texto largo para la visualización en tabla
                value = value.substring(0, 50) + '...';
            }
            tableHTML += `<td>${value}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

// Formatea los nombres de las claves para que sean más legibles en la interfaz de usuario
function formatHeader(header) {
    const headerMap = {
        codigo: 'Código',
        categoria: 'Categoría',
        prioridad: 'Prioridad',
        estado: 'Estado',
        descripcion: 'Descripción',
        responsable: 'Responsable',
        tipo: 'Tipo',
        vigencia: 'Vigencia',
        revision: 'Revisión',
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        numero: 'Número',
        area: 'Área',
        version: 'Versión',
        fecha: 'Fecha',
        titulo: 'Título',
        contenido: 'Contenido',
        fechaInicio: 'Fecha Inicio',
        fechaFin: 'Fecha Fin',
        objeto: 'Objeto',
        metodologia: 'Metodología',
        nombre: 'Nombre',
        ubicacion: 'Ubicación',
        direccion: 'Dirección',
        telefono: 'Teléfono',
        horario: 'Horario',
        capacidad: 'Capacidad',
        empresa: 'Empresa',
        tipoDirectiva: 'Tipo Directiva',
        tipoServicio: 'Tipo Servicio',
        numeroGuardias: 'Número Guardias',
        turno: 'Turno',
        tipoEvento: 'Tipo Evento',
        nombreEvento: 'Nombre Evento',
        duracion: 'Duración',
        lugarInstalacion: 'Lugar de Instalación',
        fechaAprobacion: 'Fecha de Aprobación',
        cantidadGuardias: 'Cantidad de Guardias',
        nombreEmpresa: 'Nombre Empresa',
        rut: 'RUT',
        fechaEvento: 'Fecha del Evento',
        estadoAprobacion: 'Estado Aprobación',
        id: 'ID'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
}

// Busca datos dentro de una sección por término de búsqueda
function searchData(section, searchTerm) {
    const data = database[section];
    const filteredData = data.filter(item => {
        // Busca en todos los valores de cada objeto
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    const resultsContainer = document.getElementById(`${section}-results`);
    const table = createTable(section, filteredData); // Vuelve a crear la tabla con los resultados filtrados
    resultsContainer.innerHTML = table;
}

// Muestra los detalles de un registro en el modal
function showDetails(section, index) {
    const item = database[section][index];
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Detalles - ${formatHeader('codigo')}: ${item.codigo || item.numero || item.nombre}`;
    modalTitle.className = `modal-title ${section}`; // Aplica la clase de estilo de la sección al título del modal
    
    let detailsHTML = '';
    Object.keys(item).forEach(key => {
        detailsHTML += `
            <div class="detail-item ${section}">
                <div class="detail-label">${formatHeader(key)}</div>
                <div class="detail-value">${item[key] || 'No especificado'}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML = detailsHTML;
    modal.style.display = 'block'; // Muestra el modal
}

// Cierra el modal de detalles
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Actualiza los contadores de registros en la página de inicio
function updateCounts() {
    document.getElementById('estudios-count').textContent = `${database.estudios.length} registros`;
    document.getElementById('planes-count').textContent = `${database.planes.length} registros`;
    
    const totalMedidas = database.medidas.length + database.servicentros.length;
    document.getElementById('medidas-count').textContent = `${totalMedidas} registros`;
    
    // Suma todos los registros de las subcategorías de directivas
    const totalDirectivas = database['empresas-rrhh'].length + database['guardias-propios'].length + database['eventos-masivos'].length + database['directivas-generales'].length;
    document.getElementById('directivas-count').textContent = `${totalDirectivas} registros`;
}

// Muestra un mensaje de alerta temporal en la interfaz
function showAlert(section, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`; // Asigna la clase de estilo (success o error)
    alertDiv.textContent = message;
    
    const form = document.querySelector(`#${section}-agregar form`); // Inserta la alerta antes del formulario
    form.insertBefore(alertDiv, form.firstChild);
    
    setTimeout(() => {
        alertDiv.remove(); // Elimina la alerta después de 3 segundos
    }, 3000);
}

// Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializa la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    updateCounts(); // Actualiza los contadores iniciales
    console.log('Sistema cargado con:', {
        'Estudios de Seguridad': database.estudios.length,
        'Planes de Seguridad': database.planes.length, 
        'Medidas de Seguridad': database.medidas.length,
        'Servicentros': database.servicentros.length,
        'Empresas RRHH': empresasRRHHList.length + ' empresas con ' + database['empresas-rrhh'].length + ' registros totales',
        'Guardias Propios': database['guardias-propios'].length,
        'Eventos Masivos': database['eventos-masivos'].length,
        'Directivas Generales': database['directivas-generales'].length
    });
});
