// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = [];
let currentDirectivasSubSectionType = ''; // Nueva variable para rastrear la subsección activa de directivas

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
    // Define a list of common RUT suffixes for realism (last digit or 'K')
    const rutSuffixes = ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-K'];

    for (let i = 1; i <= 300; i++) {
        const empresaName = `Empresa RRHH ${String(i).padStart(3, '0')}`;
        // Generate a realistic-looking RUT
        const baseRut = Math.floor(Math.random() * 90000000) + 10000000;
        const rut = `${baseRut.toString().slice(0, 2)}.${baseRut.toString().slice(2, 5)}.${baseRut.toString().slice(5, 8)}${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`;

        empresasRRHHList.push({
            id: i,
            nombre: empresaName,
            rut: rut, // Added RUT here
            directivasCount: 0
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
            rut: empresaAsignada.rut, // Agrega el RUT a los registros de directivas de RRHH
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
            lugarInstalacion: lugaresInstalacion[Math.floor(Math.random() * lugaresInstalacion.length)], // Usar lugares de instalación generales
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
            rut: ruts[Math.floor(Math.random() * ruts.length)], // Agrega el RUT a los registros de eventos masivos
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

// Nueva función genérica para mostrar las subsecciones de directivas
function showDirectivasSubSection(subSectionType) {
    currentDirectivasSubSectionType = subSectionType; // Guarda la subsección actual
    
    // Oculta la vista principal de directivas y cualquier otra lista
    document.getElementById('directivas-consultar').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-generales-list').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').classList.remove('active'); // Oculta la vista de detalles específicos de empresa

    // Muestra la lista correspondiente
    document.getElementById(`directivas-${subSectionType}-list`).classList.add('active');

    // Actualiza el título de la lista
    const titleElement = document.getElementById(`${subSectionType}-list-title`);
    if (titleElement) {
        let titleText = '';
        switch (subSectionType) {
            case 'empresas-rrhh':
                titleText = '👥 Lista de Empresas de Recursos Humanos';
                renderEmpresasRRHHList(); // Llama a la función específica para RRHH
                break;
            case 'guardias-propios':
                titleText = '🛡️ Lista de Guardias Propios';
                loadData(subSectionType);
                break;
            case 'eventos-masivos':
                titleText = '🎉 Lista de Eventos Masivos';
                loadData(subSectionType);
                break;
            case 'directivas-generales':
                titleText = '📄 Lista de Directivas Generales';
                loadData(subSectionType);
                break;
        }
        titleElement.textContent = titleText;
    }
}

// Función específica para renderizar la lista de Empresas RRHH (solo Nombre y RUT)
function renderEmpresasRRHHList() {
    const resultsContainer = document.getElementById('empresas-rrhh-results');
    
    if (empresasRRHHList.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay empresas de RRHH disponibles</div>';
        return;
    }

    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>Nombre Empresa</th><th>RUT</th></tr></thead><tbody>';

    empresasRRHHList.forEach(empresa => {
        tableHTML += `
            <tr onclick="showEmpresaDirectivasDetails('${empresa.nombre}')">
                <td>${empresa.nombre}</td>
                <td>${empresa.rut}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}


// Función para mostrar los detalles de directivas de una empresa RRHH específica
function showEmpresaDirectivasDetails(empresaNombre) {
    currentEmpresaSelected = empresaNombre;
    
    // Oculta la lista de empresas RRHH
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    // Muestra la nueva sección de detalles específicos
    document.getElementById('directivas-empresa-specific-details').classList.add('active');
    
    // Actualiza el título de la sección de detalles
    document.getElementById('empresa-specific-details-title').textContent = `Directivas de Funcionamiento e Instalaciones de ${empresaNombre}`;
    
    // Carga los datos de directivas de esta empresa específica
    loadCompanySpecificDirectivas(empresaNombre);
}

// Carga y muestra los detalles de directivas para una empresa específica
function loadCompanySpecificDirectivas(empresaNombre) {
    const resultsContainer = document.getElementById('empresa-specific-details-results');
    const directivasEmpresa = database['empresas-rrhh'].filter(directiva => directiva.empresa === empresaNombre);

    if (directivasEmpresa.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay directivas de instalaciones para esta empresa.</div>';
        return;
    }

    let cardsHTML = '';
    directivasEmpresa.forEach(directiva => {
        cardsHTML += `
            <div class="directiva-detail-card">
                <div class="detail-label">Número de Directiva:</div>
                <div class="detail-value">${directiva.numero || 'N/A'}</div>

                <div class="detail-label">Tipo de Directiva:</div>
                <div class="detail-value">${directiva.tipoDirectiva || 'N/A'}</div>

                <div class="detail-label">Lugar de Instalación:</div>
                <div class="detail-value">${directiva.lugarInstalacion || 'N/A'}</div>

                <div class="detail-label">Dirección:</div>
                <div class="detail-value">${directiva.direccion || 'N/A'}</div>

                <div class="detail-label">Fecha de Aprobación:</div>
                <div class="detail-value">${directiva.fechaAprobacion || 'N/A'}</div>

                <div class="detail-label">Cantidad de Guardias:</div>
                <div class="detail-value">${directiva.cantidadGuardias || 'N/A'}</div>
            </div>
        `;
    });
    resultsContainer.innerHTML = cardsHTML;
}

// Función para buscar en los detalles de directivas de una empresa específica
function searchCompanySpecificDirectivas(searchTerm) {
    const filteredDirectivas = database['empresas-rrhh'].filter(directiva => 
        directiva.empresa === currentEmpresaSelected &&
        (directiva.lugarInstalacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.fechaAprobacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.cantidadGuardias.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const resultsContainer = document.getElementById('empresa-specific-details-results');
    if (filteredDirectivas.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No se encontraron directivas con ese criterio.</div>';
        return;
    }

    let cardsHTML = '';
    filteredDirectivas.forEach(directiva => {
        cardsHTML += `
            <div class="directiva-detail-card">
                <div class="detail-label">Número de Directiva:</div>
                <div class="detail-value">${directiva.numero || 'N/A'}</div>

                <div class="detail-label">Tipo de Directiva:</div>
                <div class="detail-value">${directiva.tipoDirectiva || 'N/A'}</div>

                <div class="detail-label">Lugar de Instalación:</div>
                <div class="detail-value">${directiva.lugarInstalacion || 'N/A'}</div>

                <div class="detail-label">Dirección:</div>
                <div class="detail-value">${directiva.direccion || 'N/A'}</div>

                <div class="detail-label">Fecha de Aprobación:</div>
                <div class="detail-value">${directiva.fechaAprobacion || 'N/A'}</div>

                <div class="detail-label">Cantidad de Guardias:</div>
                <div class="detail-value">${directiva.cantidadGuardias || 'N/A'}</div>
            </div>
        `;
    });
    resultsContainer.innerHTML = cardsHTML;
}


// Función para volver a la lista de Empresas RRHH desde los detalles específicos
function backToEmpresasList() {
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').classList.add('active');
    renderEmpresasRRHHList(); // Volver a renderizar la lista original de empresas RRHH
}

// Función para buscar en la lista de Empresas RRHH (solo Nombre y RUT)
function searchEmpresasRRHH(searchTerm) {
    const filteredEmpresas = empresasRRHHList.filter(empresa => 
        empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.rut.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const resultsContainer = document.getElementById('empresas-rrhh-results');
    
    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>Nombre Empresa</th><th>RUT</th></tr></thead><tbody>';

    if (filteredEmpresas.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No se encontraron empresas con ese criterio.</div>';
        return;
    }

    filteredEmpresas.forEach(empresa => {
        tableHTML += `
            <tr onclick="showEmpresaDirectivasDetails('${empresa.nombre}')">
                <td>${empresa.nombre}</td>
                <td>${empresa.rut}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}


// Función genérica para mostrar la vista de registros de cualquier sección (Estudios, Planes, Medidas, y ahora subsecciones de Directivas)
function showRecords(section) {
    // Ocultar la vista de consultar si aplica (solo para secciones principales)
    if (document.getElementById(`${section}-consultar`)) {
        document.getElementById(`${section}-consultar`).classList.remove('active');
    }
    // Ocultar cualquier lista de subsecciones de directivas si estamos en ese contexto
    // Se asegura de ocultar todas las listas posibles antes de mostrar la correcta
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-generales-list').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');


    // Mostrar la vista de registros (o la lista específica de la subsección)
    document.getElementById(`${section}-records`).classList.add('active');
    loadData(section); // Carga los datos correspondientes a la sección/subsección
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
        // Para las subsecciones de directivas, el click debe abrir el modal de detalles
        // La sección 'empresas-rrhh' tiene un manejo especial con showEmpresaDirectivasDetails
        if (section.startsWith('directivas-') && section !== 'empresas-rrhh') {
            tableHTML += `<tr onclick="showDetails('${section}', ${index})">`; // Abre el modal de detalles
        } else {
            tableHTML += `<tr onclick="showDetails('${section}', ${index})">`; // Comportamiento general
        }

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
        empresa: 'Nombre Empresa', 
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
    
    // Determina dónde insertar la alerta: si es una sección principal con formulario
    let targetElement = document.querySelector(`#${section}-agregar form`);
    if (targetElement) {
        targetElement.insertBefore(alertDiv, targetElement.firstChild);
    } else {
        // En caso de que no haya un formulario directo (ej. en listas de subsecciones)
        // Puedes ajustar esto para que la alerta aparezca en un lugar más apropiado
        const containerElement = document.querySelector(`#directivas-${currentDirectivasSubSectionType}-list .section-header`);
        if (containerElement) {
            containerElement.parentNode.insertBefore(alertDiv, containerElement.nextSibling);
        }
    }
    
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
