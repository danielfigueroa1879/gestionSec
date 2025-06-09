// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = [];
let currentDirectivasSubSectionType = ''; 
let currentEmpresaSelected = ''; 
let database = {}; // Se llenará con datos del Excel

// Función para cargar datos desde el Excel
async function loadDataFromExcel() {
    try {
        // Leer el archivo Excel
        const response = await window.fs.readFile('BASE  DE DATOS COMPONENTES SISTEMA SEGURIDAD PRIVADA TOTAL OS10 COQUIMBO 22 04 25.xlsx');
        const workbook = XLSX.read(response, {
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });

        // Inicializar estructura de base de datos
        database = {
            estudios: [],
            planes: [],
            medidas: [], // Corresponde a MEDIDAS DE SEGURIDAD LEY 19.303
            servicentros: [], // Se puede usar para categorizar medidas
            'sobre-500-uf': [], // Se puede usar para categorizar medidas
            directivas: [], 
            'empresas-rrhh': [], // Corresponde a DIRECTIVAS DE FUNCIONAMIENTOS
            'guardias-propios': [],
            'eventos-masivos': []
        };

        // Cargar ESTUDIOS
        await loadEstudios(workbook);
        
        // Cargar PLANES DE SEGURIDAD
        await loadPlanes(workbook);
        
        // Cargar MEDIDAS DE SEGURIDAD
        await loadMedidas(workbook);
        
        // Cargar DIRECTIVAS DE FUNCIONAMIENTOS (como empresas-rrhh)
        await loadDirectivas(workbook);
        
        // Cargar EMPRESAS RECURSOS HUMANOS (como lista de empresas)
        await loadEmpresasRRHH(workbook);

        console.log('Datos cargados exitosamente desde Excel:', {
            estudios: database.estudios.length,
            planes: database.planes.length,
            medidas: database.medidas.length,
            directivas: database['empresas-rrhh'].length,
            empresas: empresasRRHHList.length
        });

    } catch (error) {
        console.error('Error cargando datos del Excel:', error);
        // Si hay error, generar datos de ejemplo como fallback
        await generateSampleData();
    }
}

// Función para cargar estudios desde el Excel
async function loadEstudios(workbook) {
    const worksheet = workbook.Sheets['ESTUDIOS '];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Los encabezados están en la fila 1, datos empiezan en fila 2
    const headers = jsonData[1];
    
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue; // Saltar filas vacías
        
        const fechaVigencia = parseFecha(row[12]); // FECHA VIGENCIA
        const fechaInicio = new Date(); // Fecha actual como fecha de inicio
        const fechaFin = new Date(fechaVigencia);
        
        database.estudios.push({
            codigo: `EST-${String(row[0]).padStart(3, '0')}`,
            tipo: row[1] || 'Entidad Obligada', // ENTIDAD
            fechaInicio: fechaInicio.toISOString().split('T')[0],
            fechaFin: fechaFin.toISOString().split('T')[0],
            objeto: `Estudio de seguridad para ${row[1]}`,
            metodologia: 'Metodología basada en Decreto Ley 3.607',
            responsable: row[6] || 'No especificado', // IDENTIFICACION JEFE DE SEGURIDAD
            estadoVigencia: fechaFin > new Date() ? 'Vigente' : 'Vencido',
            rut: row[2] || '', // RUT ENTIDAD
            direccion: row[3] || '', // UBICACIÓN (CASA MATRIZ)
            comuna: extraerComuna(row[3] || '') // Extraer comuna de la dirección
        });
    }
}

// Función para cargar planes desde el Excel
async function loadPlanes(workbook) {
    const worksheet = workbook.Sheets['PLANES DE SEGURIDAD'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        const fechaVigencia = parseFecha(row[11]); // FECHA DE VIGENCIA
        const fechaAprobacion = new Date(fechaVigencia);
        fechaAprobacion.setFullYear(fechaAprobacion.getFullYear() - 3); // 3 años antes
        
        database.planes.push({
            codigo: `PLN-${String(row[0]).padStart(3, '0')}`,
            tipo: row[1] || 'Entidad Financiera', // ENTIDAD
            fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
            vigencia: fechaVigencia.toISOString().split('T')[0],
            revision: row[4] || '', // UBICACIÓN como dirección
            objetivo: `Plan de seguridad para ${row[3] || row[1]}`, // SUCURSAL o ENTIDAD
            alcance: `Aplicable a ${row[4]}`, // UBICACIÓN
            estadoVigencia: fechaVigencia > new Date() ? 'Vigente' : 'Vencido',
            comuna: row[5] || extraerComuna(row[4] || ''), // CIUDAD
            rut: row[2] || '' // RUT ENTIDAD
        });
    }
}

// Función para cargar medidas desde el Excel
async function loadMedidas(workbook) {
    const worksheet = workbook.Sheets['MEDIDAS DE SEGURIDAD LEY 19.303'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[1]) continue; // La primera columna está vacía, datos empiezan en índice 1
        
        const fechaVigencia = parseFecha(row[11]); // FECHA DE VIGENCIA MEDIDAS DE SEGURIDAD
        const fechaAprobacion = new Date(fechaVigencia);
        fechaAprobacion.setFullYear(fechaAprobacion.getFullYear() - 3);
        
        database.medidas.push({
            codigo: `MED-${String(row[1]).padStart(3, '0')}`,
            categoria: row[2] || 'Entidad Comercial', // ENTIDAD
            prioridad: 'Media',
            estado: row[12] === 'VIGENTE' ? 'Implementada' : 'Pendiente', // ESTADO DE TRAMITACIÓN
            descripcion: `Medidas de seguridad para ${row[4]} - ${row[2]}`, // INSTALACIÓN - ENTIDAD
            responsable: row[7] || 'No especificado', // IDENTIFICACION ENCARGADO
            fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
            vigencia: fechaVigencia.toISOString().split('T')[0],
            estadoVigencia: fechaVigencia > new Date() ? 'Vigente' : 'Vencido',
            rut: row[3] || '', // RUT ENTIDAD
            direccion: row[5] || '', // UBICACIÓN INSTALACIÓN
            comuna: row[6] || extraerComuna(row[5] || ''), // Hay una columna que parece ser comuna
            alcance: `Medidas aplicables a ${row[4]}` // INSTALACIÓN
        });
    }
}

// Función para cargar directivas desde el Excel
async function loadDirectivas(workbook) {
    const worksheet = workbook.Sheets['DIRECTIVAS DE FUNCIONAMIENTOS '];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        // Procesar fecha de resolución para obtener fecha de aprobación
        const resolucion = row[9] || ''; // RESOLUCION APROB. DD.FF.
        const fechaAprobacion = parseFechaResolucion(resolucion);
        const vigencia = new Date(fechaAprobacion);
        vigencia.setFullYear(vigencia.getFullYear() + 3);
        
        database['empresas-rrhh'].push({
            numero: `RRHH-${String(row[0]).padStart(4, '0')}`,
            empresa: row[1] || 'Empresa no especificada', // EMPRESA RR.HH.
            rut: row[2] || '', // RUT EMPRESA RR.HH.
            tipoDirectiva: determinarTipoDirectiva(row[3] || ''), // NOMBRE INSTALACIÓN
            lugarInstalacion: row[3] || '', // NOMBRE INSTALACIÓN
            direccion: row[4] ? `${row[4]} - Contratante` : '', // ENTIDAD MANDANTE
            fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
            cantidadGuardias: 'No especificado',
            area: 'Recursos Humanos',
            version: '1.0',
            titulo: `Directiva de funcionamiento - ${row[3]}`,
            contenido: `Directiva para la instalación: ${row[3]}, contratada por ${row[4]}`,
            responsable: row[6] || 'No especificado', // REPRESENTANTE LEGAL
            estado: row[10] || 'Vigente', // ESTADO DE TRAMITACIÓN
            vigencia: vigencia.toISOString().split('T')[0],
            estadoVigencia: vigencia > new Date() ? 'Vigente' : 'Vencido',
            comuna: extraerComuna(row[4] || ''),
            alcance: `Directiva aplicable a ${row[3]}`
        });
    }
}

// Función para cargar empresas RRHH desde el Excel
async function loadEmpresasRRHH(workbook) {
    const worksheet = workbook.Sheets['EMPRESAS RECURSOS HUMANOS '];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    empresasRRHHList = [];
    
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        empresasRRHHList.push({
            id: parseInt(row[0]) || i,
            nombre: row[1] || `Empresa ${i}`, // RAZON SOCIAL
            rut: row[2] || '', // RUT ENTIDAD
            direccion: row[3] || '', // DOMICILIO COMERCIAL
            directivasCount: 0 // Se calculará después
        });
    }
    
    // Calcular el conteo de directivas por empresa
    empresasRRHHList.forEach(empresa => {
        empresa.directivasCount = database['empresas-rrhh'].filter(
            directiva => directiva.empresa === empresa.nombre
        ).length;
    });
}

// Funciones utilitarias para procesar fechas y datos

function parseFecha(fechaStr) {
    if (!fechaStr) return new Date();
    
    // Si viene en formato DD.MM.YYYY
    if (typeof fechaStr === 'string' && fechaStr.includes('.')) {
        const parts = fechaStr.split('.');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }
    
    // Si viene en formato MMM-YY (ej: May-25)
    if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
        const parts = fechaStr.split('-');
        if (parts.length === 2) {
            const monthMap = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            const month = monthMap[parts[0]] || 0;
            const year = 2000 + parseInt(parts[1]);
            return new Date(year, month, 1);
        }
    }
    
    // Si es una fecha de Excel (número)
    if (typeof fechaStr === 'number') {
        return new Date((fechaStr - 25569) * 86400 * 1000);
    }
    
    // Intentar parsear como fecha normal
    const fecha = new Date(fechaStr);
    return isNaN(fecha.getTime()) ? new Date() : fecha;
}

function parseFechaResolucion(resolucionStr) {
    if (!resolucionStr) return new Date();
    
    // Extraer fecha de resoluciones como "02 DE 05.01.2023"
    const match = resolucionStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (match) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
    
    return new Date();
}

function extraerComuna(direccion) {
    if (!direccion) return 'No especificada';
    
    const comunasComunes = [
        'LA SERENA', 'COQUIMBO', 'OVALLE', 'VICUÑA', 'ILLAPEL', 
        'SANTIAGO', 'PROVIDENCIA', 'LAS CONDES', 'ÑUÑOA'
    ];
    
    const direccionUpper = direccion.toUpperCase();
    for (const comuna of comunasComunes) {
        if (direccionUpper.includes(comuna)) {
            return comuna.charAt(0) + comuna.slice(1).toLowerCase();
        }
    }
    
    return 'La Serena'; // Comuna por defecto
}

function determinarTipoDirectiva(instalacion) {
    if (!instalacion) return 'General';
    
    const instalacionLower = instalacion.toLowerCase();
    
    if (instalacionLower.includes('obra') || instalacionLower.includes('construccion')) {
        return 'Construcción';
    } else if (instalacionLower.includes('farmacia') || instalacionLower.includes('comercial')) {
        return 'Comercial';
    } else if (instalacionLower.includes('turistico') || instalacionLower.includes('complejo')) {
        return 'Turismo';
    } else if (instalacionLower.includes('banco') || instalacionLower.includes('financier')) {
        return 'Financiero';
    } else {
        return 'General';
    }
}

// Función para generar datos de ejemplo (fallback si no se puede cargar Excel)
async function generateSampleData() {
    const database = {
        estudios: [],
        planes: [],
        medidas: [],
        servicentros: [],
        'sobre-500-uf': [],
        directivas: [], 
        'empresas-rrhh': [], 
        'guardias-propios': [],
        'eventos-masivos': []
    };

    // Crear lista de empresas únicas de RRHH (300 empresas)
    empresasRRHHList = [];
    const rutSuffixes = ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-K'];
    const sampleAddresses = [
        'Av. Providencia 1234, Santiago',
        'Calle Moneda 567, Santiago',
        'Av. Las Condes 890, Las Condes',
        'Calle Huérfanos 432, Santiago',
        'Av. Libertador 678, Santiago',
        'El Bosque Norte 010, Las Condes',
        'Rosario Norte 555, Las Condes',
        'San Antonio 220, Santiago',
        'Merced 840, Santiago',
        'Apoquindo 3000, Las Condes'
    ];
    const comunasChile = ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'Puente Alto', 'La Florida', 'Vitacura', 'Concepción', 'Viña del Mar', 'Valparaíso', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca'];

    for (let i = 1; i <= 300; i++) {
        const empresaName = `Empresa RRHH ${String(i).padStart(3, '0')}`;
        const baseRut = Math.floor(Math.random() * 90000000) + 10000000;
        const rut = `${baseRut.toString().slice(0, 2)}.${baseRut.toString().slice(2, 5)}.${baseRut.toString().slice(5, 8)}${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`;
        const direccion = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

        empresasRRHHList.push({
            id: i,
            nombre: empresaName,
            rut: rut,
            direccion: direccion,
            directivasCount: 0
        });
    }

    console.log('Usando datos de ejemplo en lugar de datos del Excel');
    return database;
}

// Helper function to format dates for display
function formatDateForDisplay(dateString) {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
}

// Define date headers for formatting
const dateHeaders = ['fechaInicio', 'fechaFin', 'fechaAprobacion', 'vigencia', 'fecha', 'fechaEvento'];

// Funciones de navegación principal
function showHome() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('home').style.display = 'block';
    updateCounts();
}

function showSection(sectionName) {
    document.getElementById('home').style.display = 'none';
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    showTab(sectionName, 'consultar');
}

function showTab(section, tab) {
    const tabButtons = document.querySelectorAll(`#${section} .tab-btn`);
    tabButtons.forEach(btn => btn.classList.remove('active'));

    let activeButton;
    if (tab === 'consultar') {
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Consultar'));
    } else if (tab === 'agregar') {
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Agregar'));
    }
    
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const tabContents = document.querySelectorAll(`#${section} .tab-content`);
    tabContents.forEach(content => content.classList.remove('active'));
    
    if (section === 'medidas') {
        if (tab === 'consultar') {
            document.getElementById('medidas-consultar').classList.add('active');
            document.getElementById('servicentros-page').classList.remove('active');
            document.getElementById('sobre-500-uf-page').classList.remove('active');
            loadData('medidas'); // Cargar medidas directamente
        } else if (tab === 'agregar') {
            document.getElementById('medidas-agregar').classList.add('active');
            document.getElementById('servicentros-page').classList.remove('active');
            document.getElementById('sobre-500-uf-page').classList.remove('active');
        }
    } else {
        document.getElementById(`${section}-${tab}`).classList.add('active');
    }
    
    if (section === 'medidas' && tab === 'consultar') {
        updateMedidasSubSectionCounts();
    }
}

// Función para mostrar las subsecciones de medidas
function showSubMedidaPage(subSectionType) {
    document.querySelectorAll('#medidas .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (subSectionType === 'servicentros') {
        document.getElementById('servicentros-page').classList.add('active');
        // Para servicentros, mostrar medidas filtradas por categoría comercial/servicios
        const servicentrosData = database.medidas.filter(medida => 
            medida.categoria && (
                medida.categoria.toLowerCase().includes('comercial') ||
                medida.categoria.toLowerCase().includes('servicio') ||
                medida.categoria.toLowerCase().includes('centro')
            )
        );
        database.servicentros = servicentrosData.map(medida => ({
            codigo: medida.codigo,
            tipo: medida.categoria,
            fechaAprobacion: medida.fechaAprobacion,
            vigencia: medida.vigencia,
            estadoVigencia: medida.estadoVigencia,
            rut: medida.rut,
            direccion: medida.direccion,
            comuna: medida.comuna,
            alcance: medida.alcance
        }));
        loadData('servicentros');
    } else if (subSectionType === 'sobre-500-uf') {
        document.getElementById('sobre-500-uf-page').classList.add('active');
        // Para sobre 500 UF, mostrar medidas de mayor valor o empresas grandes
        const sobre500Data = database.medidas.filter((medida, index) => index % 2 === 0); // Cada segunda medida
        database['sobre-500-uf'] = sobre500Data.map(medida => ({
            id: medida.codigo,
            tipo: medida.categoria,
            fechaAprobacion: medida.fechaAprobacion,
            vigencia: medida.vigencia,
            estadoVigencia: medida.estadoVigencia,
            rut: medida.rut,
            direccion: medida.direccion,
            comuna: medida.comuna,
            alcance: medida.alcance
        }));
        loadData('sobre-500-uf');
    }
}

// Función genérica para mostrar las subsecciones de directivas
function showDirectivasSubSection(subSectionType) {
    currentDirectivasSubSectionType = subSectionType;
    
    document.getElementById('directivas-consultar').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');

    document.getElementById(`directivas-${subSectionType}-list`).classList.add('active');

    const titleElement = document.getElementById(`${subSectionType}-list-title`);
    if (titleElement) {
        let titleText = '';
        switch (subSectionType) {
            case 'empresas-rrhh':
                titleText = '👥 Lista de Empresas de Recursos Humanos';
                renderEmpresasRRHHList();
                break;
            case 'guardias-propios':
                titleText = '🛡️ Lista de Guardias Propios';
                loadData(subSectionType);
                break;
            case 'eventos-masivos':
                titleText = '🎉 Lista de Eventos Masivos';
                loadData(subSectionType);
                break;
        }
        titleElement.textContent = titleText;
    }
}

// Función para volver a la vista principal de Directivas
function backToDirectivasMain() {
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-consultar').classList.add('active');
}

// Función específica para renderizar la lista de Empresas RRHH
function renderEmpresasRRHHList() {
    const resultsContainer = document.getElementById('empresas-rrhh-results');
    
    if (empresasRRHHList.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay empresas de RRHH disponibles</div>';
        return;
    }

    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>Nombre Empresa</th><th>RUT</th><th>Dirección</th></tr></thead><tbody>';

    empresasRRHHList.forEach(empresa => {
        tableHTML += `
            <tr onclick="showEmpresaDirectivasDetails('${empresa.nombre}')">
                <td>${empresa.nombre}</td>
                <td>${empresa.rut}</td>
                <td>${empresa.direccion}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}

// Función para mostrar los detalles de directivas de una empresa RRHH específica
function showEmpresaDirectivasDetails(empresaNombre) {
    currentEmpresaSelected = empresaNombre;
    
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').classList.add('active');
    
    document.getElementById('empresa-specific-details-title').textContent = `Directivas de Funcionamiento e Instalaciones de ${empresaNombre}`;
    
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

    const headers = [
        'numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna'
    ];

    let tableHTML = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    directivasEmpresa.forEach((directiva, index) => {
        tableHTML += `<tr onclick="showDetails('empresas-rrhh', ${database['empresas-rrhh'].indexOf(directiva)})">`;
        headers.forEach(header => {
            let value = directiva[header] || 'N/A';
            if (dateHeaders.includes(header)) {
                value = formatDateForDisplay(value);
            }
            let cellClass = '';
            if (header === 'estadoVigencia') {
                if (value === 'Vigente') {
                    cellClass = 'status-vigente';
                } else if (value === 'Vencido') {
                    cellClass = 'status-vencido';
                }
            }
            tableHTML += `<td class="${cellClass}">${value}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}

// Función para buscar en los detalles de directivas de una empresa específica
function searchCompanySpecificDirectivas(searchTerm) {
    const filteredDirectivas = database['empresas-rrhh'].filter(directiva => 
        directiva.empresa === currentEmpresaSelected &&
        (directiva.lugarInstalacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.fechaAprobacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.tipoDirectiva.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (directiva.rut && directiva.rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (directiva.comuna && directiva.comuna.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const resultsContainer = document.getElementById('empresa-specific-details-results');
    if (filteredDirectivas.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No se encontraron directivas con ese criterio.</div>';
        return;
    }

    const tableHTML = createTableForCompanySpecificDirectivas(filteredDirectivas);
    resultsContainer.innerHTML = tableHTML;
}

// Helper para crear tabla específica para directivas de instalaciones
function createTableForCompanySpecificDirectivas(data) {
    const headers = [
        'numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna'
    ];

    let tableHTML = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((directiva, index) => {
        tableHTML += `<tr onclick="showDetails('empresas-rrhh', ${database['empresas-rrhh'].indexOf(directiva)})">`;
        headers.forEach(header => {
            let value = directiva[header] || 'N/A';
            if (dateHeaders.includes(header)) {
                value = formatDateForDisplay(value);
            }
            let cellClass = '';
            if (header === 'estadoVigencia') {
                if (value === 'Vigente') {
                    cellClass = 'status-vigente';
                } else if (value === 'Vencido') {
                    cellClass = 'status-vencido';
                }
            }
            tableHTML += `<td class="${cellClass}">${value}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    return tableHTML;
}

// Función para volver a la lista de Empresas RRHH desde los detalles específicos
function backToEmpresasList() {
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').classList.add('active');
    renderEmpresasRRHHList();
}

// Función para buscar en la lista de Empresas RRHH
function searchEmpresasRRHH(searchTerm) {
    const filteredEmpresas = empresasRRHHList.filter(empresa => 
        empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const resultsContainer = document.getElementById('empresas-rrhh-results');
    
    let tableHTML = '<table class="data-table"><thead><tr>';
    tableHTML += '<th>Nombre Empresa</th><th>RUT</th><th>Dirección</th></tr></thead><tbody>';

    if (filteredEmpresas.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No se encontraron empresas con ese criterio.</div>';
        return;
    }

    filteredEmpresas.forEach(empresa => {
        tableHTML += `
            <tr onclick="showEmpresaDirectivasDetails('${empresa.nombre}')">
                <td>${empresa.nombre}</td>
                <td>${empresa.rut}</td>
                <td>${empresa.direccion}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    resultsContainer.innerHTML = tableHTML;
}

// Funciones para manejar datos (agregar, cargar, buscar, mostrar detalles)
function addRecord(section, event) {
    event.preventDefault();
    
    const formData = {};
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        let key;
        if (input.id.startsWith('estudio-')) {
            key = input.id.replace('estudio-', '');
        } else if (input.id.startsWith('plan-')) {
            key = input.id.replace('plan-', '');
        } else if (input.id.startsWith('medida-')) {
            key = input.id.replace('medida-', '');
        } else if (input.id.startsWith('directiva-')) {
            key = input.id.replace('directiva-', '');
        } else {
            key = input.id;
        }
        formData[key] = input.value;
    });

    let targetArray = database[section];

    // Lógica para calcular la vigencia y el estado de vigencia
    if (section === 'planes' || section === 'medidas' || section === 'servicentros' || section === 'sobre-500-uf' || section === 'empresas-rrhh' || section === 'guardias-propios') {
        const fechaAprobacion = formData.fechaAprobacion || formData.fecha;
        if (fechaAprobacion) {
            const approvalDateObj = new Date(fechaAprobacion);
            const vigenciaDateObj = new Date(approvalDateObj);
            vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
            formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de aprobación o emisión es requerida para este tipo de registro.', 'error');
            return;
        }
    } else if (section === 'estudios') {
        const fechaInicio = formData.fechaInicio;
        if (fechaInicio) {
            const startDateObj = new Date(fechaInicio);
            const endDateObj = new Date(startDateObj);
            endDateObj.setFullYear(endDateObj.getFullYear() + 2);
            formData.fechaFin = endDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = endDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de inicio es requerida para un estudio.', 'error');
            return;
        }
    } else if (section === 'directivas') {
        const fechaEmision = formData.fecha; 
        if (fechaEmision) {
            const emissionDateObj = new Date(fechaEmision);
            const vigenciaDateObj = new Date(emissionDateObj);
            vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
            formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de emisión es requerida para una directiva.', 'error');
            return;
        }
        targetArray = database.directivas; 
    }

    targetArray.push(formData);
    
    form.reset();
    
    showAlert(section, 'Registro guardado exitosamente', 'success');
    
    updateCounts();
    
    if (section === 'medidas') {
        showTab('medidas', 'consultar'); 
    } else if (section === 'directivas') {
        showTab('directivas', 'consultar');
    }
    else {
        showTab(section, 'consultar'); 
    }
}

// Carga y muestra los datos de una sección en formato de tabla
function loadData(section) {
    let resultsContainerId = `${section}-results`;
    const resultsContainer = document.getElementById(resultsContainerId);

    if (!resultsContainer) {
        console.error(`No se encontró el contenedor: ${resultsContainerId}`);
        return;
    }

    const data = database[section];
    
    if (!data || data.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
        return;
    }

    const table = createTable(section, data);
    resultsContainer.innerHTML = table;
}

// Crea una tabla HTML a partir de un array de objetos
function createTable(section, data) {
    if (data.length === 0) {
        return '<div class="no-data">No se encontraron resultados</div>';
    }

    let headers = [];
    if (section === 'estudios') {
        headers = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'planes') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna'];
    } else if (section === 'medidas') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna'];
    } else if (section === 'servicentros') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'sobre-500-uf') {
        headers = ['id', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'empresas-rrhh') {
        headers = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna'];
    } else if (section === 'guardias-propios') { 
        headers = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna'];
    } else if (section === 'eventos-masivos') { 
        headers = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna'];
    } else if (section === 'directivas') {
        headers = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna'];
    }

    let tableHTML = '<table class="data-table';
    if (section === 'eventos-masivos') {
        tableHTML += ' truncate-text eventos-masivos-table'; 
    }
    tableHTML += '"><thead><tr>';
    
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((row, index) => {
        const originalIndex = database[section].indexOf(row);
        const detailIndex = originalIndex !== -1 ? originalIndex : index; 

        tableHTML += `<tr onclick="showDetails('${section}', ${detailIndex})">`;

        headers.forEach(header => {
            let value = row[header] || '-';
            if (dateHeaders.includes(header)) {
                value = formatDateForDisplay(value);
            }

            let cellClass = '';
            if (header === 'estadoVigencia' || header === 'estadoAprobacion') { 
                if (value === 'Vigente' || value === 'APROBADO') {
                    cellClass = 'status-vigente';
                } else if (value === 'Vencido' || value === 'RECHAZADO') {
                    cellClass = 'status-vencido';
                }
            }
            
            tableHTML += `<td class="${cellClass}">${value}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

// Formatea los nombres de las claves para la interfaz
function formatHeader(header) {
    const headerMap = {
        codigo: 'Código',
        categoria: 'Entidad',
        prioridad: 'Prioridad',
        estado: 'Estado',
        descripcion: 'Descripción',
        responsable: 'Responsable',
        tipo: 'Entidad',
        vigencia: 'Fecha de Vigencia',
        revision: 'Dirección',
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        numero: 'Código',
        area: 'Entidad',
        version: 'Versión',
        fecha: 'Fecha de Aprobación',
        titulo: 'Título',
        contenido: 'Contenido',
        fechaInicio: 'Fecha de Aprobación',
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
        tipoDirectiva: 'Entidad',
        tipoServicio: 'Entidad',
        numeroGuardias: 'Número Guardias',
        turno: 'Turno',
        tipoEvento: 'Entidad',
        nombreEvento: 'Nombre del Evento',
        duracion: 'Duración',
        lugarInstalacion: 'Lugar de Instalación',
        fechaAprobacion: 'Fecha de Aprobación', 
        cantidadGuardias: 'Cantidad de Guardias',
        nombreEmpresa: 'Nombre Empresa',
        rut: 'R.U.T',
        fechaEvento: 'Fecha de Aprobación',
        estadoAprobacion: 'Estado de Aprobación',
        id: 'Código',
        monto: 'Monto (UF)',
        estadoVigencia: 'Estado de Vigencia',
        comuna: 'Comuna'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
}

// Busca datos dentro de una sección
function searchData(section, searchTerm) {
    const data = database[section];
    const filteredData = data.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    let resultsContainerId = `${section}-results`;
    const resultsContainer = document.getElementById(resultsContainerId);

    const table = createTable(section, filteredData);
    resultsContainer.innerHTML = table;
}

// Muestra los detalles de un registro en el modal
function showDetails(section, index) {
    const item = database[section][index];
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Detalles - Código: ${item.codigo || item.numero || item.id}`;
    modalTitle.className = `modal-title ${section}`; 
    
    let detailsHTML = '';
    let detailKeys = [];
    if (section === 'estudios') {
        detailKeys = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'planes') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna'];
    } else if (section === 'medidas') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna'];
    } else if (section === 'servicentros') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'sobre-500-uf') {
        detailKeys = ['id', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'empresas-rrhh') {
        detailKeys = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna'];
    } else if (section === 'guardias-propios') { 
        detailKeys = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna'];
    } else if (section === 'eventos-masivos') { 
        detailKeys = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna'];
    } else if (section === 'directivas') {
        detailKeys = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna'];
    }

    detailKeys.forEach(key => {
        let value = item[key] || 'No especificado';
        if (dateHeaders.includes(key)) {
            value = formatDateForDisplay(value);
        }

        let detailClass = '';
        if (key === 'estadoVigencia' || key === 'estadoAprobacion') { 
            if (value === 'Vigente' || value === 'APROBADO') {
                detailClass = 'status-vigente';
            } else if (value === 'Vencido' || value === 'RECHAZADO') {
                detailClass = 'status-vencido';
            }
        }
        
        detailsHTML += `
            <div class="detail-item ${section}">
                <div class="detail-label">${formatHeader(key)}</div>
                <div class="detail-value ${detailClass}">${value}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML = detailsHTML;
    modal.style.display = 'block'; 
}

// Cierra el modal
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Actualiza los contadores
function updateCounts() {
    document.getElementById('estudios-count').textContent = `${database.estudios.length} registros`;
    document.getElementById('planes-count').textContent = `${database.planes.length} registros`;
    
    const totalMedidas = database.servicentros.length + database['sobre-500-uf'].length;
    document.getElementById('medidas-count').textContent = `${database.medidas.length} registros`;
    
    const totalDirectivas = database['empresas-rrhh'].length + database['guardias-propios'].length + database['eventos-masivos'].length;
    document.getElementById('directivas-count').textContent = `${totalDirectivas} registros`;

    updateMedidasSubSectionCounts();
}

// Función para actualizar los contadores en los botones de "Medidas de Seguridad"
function updateMedidasSubSectionCounts() {
    const servicentrosCountElement = document.getElementById('servicentros-count-sub');
    const sobre500UFCountElement = document.getElementById('sobre-500-uf-count-sub');

    if (servicentrosCountElement) {
        servicentrosCountElement.textContent = database.servicentros.length;
    }
    if (sobre500UFCountElement) {
        sobre500UFCountElement.textContent = database['sobre-500-uf'].length;
    }
}

// Muestra un mensaje de alerta
function showAlert(section, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`; 
    alertDiv.textContent = message;
    
    let targetElement;
    if (document.querySelector(`#${section}-agregar form`)) {
        targetElement = document.querySelector(`#${section}-agregar form`);
    } else {
        const currentActiveSection = document.querySelector('.section.active');
        if (currentActiveSection) {
            targetElement = currentActiveSection.querySelector('.section-header') || currentActiveSection;
            if (targetElement.nextSibling) { 
                targetElement.parentNode.insertBefore(alertDiv, targetElement.nextSibling);
                setTimeout(() => { alertDiv.remove(); }, 3000);
                return;
            }
        }
    }

    if (targetElement) {
        targetElement.insertBefore(alertDiv, targetElement.firstChild);
    } else {
        console.error('No se pudo encontrar un elemento adecuado para mostrar la alerta.');
    }
    
    setTimeout(() => {
        alertDiv.remove(); 
    }, 3000);
}

// Cierra el modal si se hace clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializa la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando carga de datos desde Excel...');
    
    // Intentar cargar datos desde Excel
    await loadDataFromExcel();
    
    updateCounts();
    
    console.log('Sistema cargado con datos del Excel:', {
        'Estudios de Seguridad': database.estudios.length,
        'Planes de Seguridad': database.planes.length, 
        'Medidas de Seguridad': database.medidas.length,
        'Servicentros': database.servicentros.length,
        'Sobre 500 UF': database['sobre-500-uf'].length,
        'Empresas RRHH': empresasRRHHList.length + ' empresas con ' + database['empresas-rrhh'].length + ' registros totales',
        'Guardias Propios': database['guardias-propios'].length,
        'Eventos Masivos': database['eventos-masivos'].length
    });
});
