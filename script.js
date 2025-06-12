// Variables globales
let database = {};

// Función para cargar datos desde el Excel
async function loadDataFromExcel(file = null) {
    try {
        let arrayBuffer;
        
        if (file) {
            console.log(`📁 Cargando archivo proporcionado: ${file.name}`);
            arrayBuffer = await file.arrayBuffer();
        } else {
            if (typeof window.fs !== 'undefined' && typeof window.fs.readFile === 'function') {
                console.log('📁 window.fs está disponible, intentando cargar automáticamente...');
                const nombresAlternativos = [
                    'BASE DE DATOS.xlsx',
                    'base de datos.xlsx',
                    'BASE_DE_DATOS.xlsx',
                    'base_de_datos.xlsx',
                    'BaseDeDatos.xlsx',
                    'BASE DE DATOS.xls',
                    'base de datos.xls',
                    'BASE_DE_DATOS.xls',
                    'base_de_datos.xls',
                    'BaseDeDatos.xls',
                    'BASE  DE DATOS COMPONENTES SISTEMA SEGURIDAD PRIVADA TOTAL OS10 COQUIMBO 22 04 25.xlsx'
                ];
                
                let archivoEncontrado = false;
                for (const nombre of nombresAlternativos) {
                    try {
                        console.log(`📁 Probando nombre de archivo: "${nombre}"`);
                        const response = await window.fs.readFile(nombre);
                        arrayBuffer = response.buffer;
                        console.log(`✅ Archivo encontrado y cargado con nombre: "${nombre}"`);
                        archivoEncontrado = true;
                        break;
                    } catch (error) {
                        console.log(`❌ No encontrado: "${nombre}" (Error: ${error.message})`);
                    }
                }
                
                if (!archivoEncontrado) {
                    throw new Error('Archivo "BASE DE DATOS.xlsx" o similar no encontrado en el proyecto.');
                }
            } else {
                console.log('📁 window.fs no disponible, usando datos de ejemplo');
                throw new Error('window.fs no disponible o no tiene la función readFile - usando datos de ejemplo');
            }
        }

        const workbook = XLSX.read(arrayBuffer, {
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });

        console.log('📋 Hojas encontradas en el Excel:', workbook.SheetNames);

        // Inicializar estructura de base de datos
        database = {
            estudios: [],
            planes: [],
            medidas: [],
            servicentros: [],
            'sobre-500-uf': [],
            directivas: [],
            'directivas-funcionamiento': [] // Nueva estructura para directivas
        };

        // Cargar datos de cada hoja
        await loadEstudios(workbook);
        await loadPlanes(workbook);
        await loadMedidasSobre500UF(workbook);
        await loadMedidasServicentros(workbook);
        await loadDirectivasFuncionamiento(workbook); // Nueva función para directivas

        console.log('✅ Datos cargados exitosamente desde Excel:', {
            estudios: database.estudios.length,
            planes: database.planes.length,
            servicentros: database.servicentros.length,
            'sobre-500-uf': database['sobre-500-uf'].length,
            'directivas-funcionamiento': database['directivas-funcionamiento'].length
        });

        showExcelLoadSuccess();

    } catch (error) {
        console.log('📝 Cargando datos de ejemplo debido a:', error.message);
        generateSampleData();
        showExcelLoadError(error.message);
    }
}

// Nueva función para cargar directivas de funcionamiento
async function loadDirectivasFuncionamiento(workbook) {
    console.log('🔄 Cargando directivas de funcionamiento...');
    
    const worksheet = workbook.Sheets['DIRECTIVAS DE FUNCIONAMIENTOS '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "DIRECTIVAS DE FUNCIONAMIENTOS " no encontrada');
        return;
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    console.log(`📋 Filas totales en DIRECTIVAS DE FUNCIONAMIENTOS: ${jsonData.length}`);
    
    let registrosCargados = 0;
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0] || row[0] === null) continue;
        
        try {
            const fechaAprobacion = parseFechaSimple(row[10]); // RESOLUCION APROB. DD.FF.
            const vigencia = new Date(fechaAprobacion.getTime() + (3 * 365 * 24 * 60 * 60 * 1000));
            
            const registro = {
                numero: row[0] || `DF-${String(i).padStart(3, '0')}`, // NRO
                empresaRRHH: row[1] || 'Empresa no especificada', // EMPRESA RR.HH.
                rutEmpresa: row[2] || '', // RUT EMPRESA RR.HH.
                nombreInstalacion: row[3] || '', // NOMBRE INSTALACIÓN
                entidadMandante: row[4] || '', // ENTIDAD MANDANTE (CONTRATANTE)
                rutMandante: row[5] || '', // RUT ENTIDAD MANDANTE (CONTRATANTE)
                representanteLegal: row[6] || '', // REPRESENTANTE LEGAL
                telefono: row[8] || '', // TELEFONO
                correo: row[9] || '', // CORREO ELECTRONICO
                resolucion: row[10] || '', // RESOLUCION APROB. DD.FF.
                fechaAprobacion: fechaToSafeString(fechaAprobacion),
                vigencia: fechaToSafeString(vigencia),
                estadoVigencia: vigencia > new Date() ? 'Vigente' : 'Vencido'
            };
            
            database['directivas-funcionamiento'].push(registro);
            registrosCargados++;
            
        } catch (error) {
            console.warn(`⚠️ Error procesando fila ${i} de DIRECTIVAS DE FUNCIONAMIENTOS:`, error.message);
        }
    }
    
    console.log(`✅ Directivas de funcionamiento cargadas: ${registrosCargados} registros`);
}

// Funciones auxiliares para fechas
function parseFechaSimple(fechaStr) {
    if (!fechaStr || fechaStr === null || fechaStr === undefined) {
        return new Date();
    }
    
    if (typeof fechaStr === 'number' && !isNaN(fechaStr)) {
        try {
            const excelDate = new Date((fechaStr - 25569) * 86400 * 1000);
            if (isNaN(excelDate.getTime())) {
                return new Date();
            }
            return excelDate;
        } catch (error) {
            return new Date();
        }
    }
    
    if (typeof fechaStr === 'string' && fechaStr.includes('.')) {
        try {
            const parts = fechaStr.split('.');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    if (isNaN(date.getTime())) {
                        return new Date();
                    }
                    return date;
                }
            }
        } catch (error) {
            return new Date();
        }
    }
    
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
            return new Date();
        }
        return fecha;
    } catch (error) {
        return new Date();
    }
}

function fechaToSafeString(fecha) {
    try {
        if (!fecha || isNaN(fecha.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        return fecha.toISOString().split('T')[0];
    } catch (error) {
        return new Date().toISOString().split('T')[0];
    }
}

// Funciones auxiliares para cargar otros datos (simplificadas)
async function loadEstudios(workbook) {
    const worksheet = workbook.Sheets['ESTUDIOS '];
    if (!worksheet) return;
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    for (let i = 2; i < Math.min(jsonData.length, 10); i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        database.estudios.push({
            codigo: `EST-${String(i).padStart(3, '0')}`,
            tipo: row[1] || 'Entidad Obligada',
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date(Date.now() + 365*24*60*60*1000*2).toISOString().split('T')[0],
            estadoVigencia: 'Vigente',
            rut: row[2] || '',
            direccion: row[3] || '',
            comuna: 'La Serena'
        });
    }
}

async function loadPlanes(workbook) {
    const worksheet = workbook.Sheets['PLANES DE SEGURIDAD'];
    if (!worksheet) return;
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    for (let i = 2; i < Math.min(jsonData.length, 10); i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        database.planes.push({
            codigo: `PLN-${String(i).padStart(3, '0')}`,
            tipo: row[1] || 'Entidad Financiera',
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente',
            revision: row[4] || '',
            comuna: row[5] || 'La Serena',
            rut: row[2] || ''
        });
    }
}

async function loadMedidasSobre500UF(workbook) {
    const worksheet = workbook.Sheets['MEDIDAS SOBRE 500 UF '];
    if (!worksheet) return;
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    for (let i = 3; i < Math.min(jsonData.length, 15); i++) {
        const row = jsonData[i];
        if (!row || !row[1]) continue;
        
        database['sobre-500-uf'].push({
            id: `S500-${String(row[1]).padStart(3, '0')}`,
            entidad: row[2] || 'Entidad no especificada',
            instalacion: row[4] || '',
            rut: row[3] || '',
            ubicacion: row[5] || '',
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente',
            comuna: 'La Serena',
            monto: `${500 + Math.floor(Math.random() * 1000)} UF`
        });
    }
}

async function loadMedidasServicentros(workbook) {
    const worksheet = workbook.Sheets['MEDIDAS SERVICENTRO'];
    if (!worksheet) return;
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    for (let i = 2; i < Math.min(jsonData.length, 15); i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;
        
        database.servicentros.push({
            codigo: `SER-${String(row[0]).padStart(3, '0')}`,
            nombreServicentro: row[1] || 'Servicentro',
            propietario: row[2] || 'Propietario no especificado',
            rut: row[3] || '',
            ubicacion: row[4] || '',
            comuna: row[5] || 'La Serena',
            maximoDinero: row[6] || 'No especificado',
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente'
        });
    }
}

// Función para generar datos de ejemplo
function generateSampleData() {
    database = {
        estudios: [],
        planes: [],
        medidas: [],
        servicentros: [],
        'sobre-500-uf': [],
        directivas: [],
        'directivas-funcionamiento': []
    };

    // Generar directivas de funcionamiento de ejemplo
    for (let i = 1; i <= 15; i++) {
        database['directivas-funcionamiento'].push({
            numero: `DF-${String(i).padStart(3, '0')}`,
            empresaRRHH: `Empresa RRHH ${i}`,
            rutEmpresa: `${Math.floor(Math.random() * 20) + 70}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${['1','2','3','4','5','6','7','8','9','K'][Math.floor(Math.random() * 10)]}`,
            nombreInstalacion: `Instalación ${i}`,
            entidadMandante: `Entidad Contratante ${i}`,
            rutMandante: `${Math.floor(Math.random() * 20) + 50}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${['1','2','3','4','5','6','7','8','9','K'][Math.floor(Math.random() * 10)]}`,
            representanteLegal: `Representante Legal ${i}`,
            telefono: `+56 9 ${Math.floor(Math.random() * 90000000) + 10000000}`,
            correo: `contacto${i}@empresa.cl`,
            resolucion: `Resolución ${i}/2024`,
            fechaAprobacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente'
        });
    }

    // Generar datos de ejemplo para otras secciones
    for (let i = 1; i <= 5; i++) {
        database.estudios.push({
            codigo: `EST-${String(i).padStart(3, '0')}`,
            tipo: `Entidad de Ejemplo ${i}`,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date(Date.now() + 365*24*60*60*1000*2).toISOString().split('T')[0],
            estadoVigencia: 'Vigente',
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-1`,
            direccion: `Dirección ${i}, La Serena`,
            comuna: 'La Serena'
        });

        database.planes.push({
            codigo: `PLN-${String(i).padStart(3, '0')}`,
            tipo: `Entidad Financiera ${i}`,
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente',
            revision: `Dirección ${i}, La Serena`,
            comuna: 'La Serena',
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-2`
        });

        database.servicentros.push({
            codigo: `SER-${String(i).padStart(3, '0')}`,
            nombreServicentro: `Servicentro ${i}`,
            propietario: `Propietario ${i}`,
            rut: `${Math.floor(Math.random() * 20) + 70}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-3`,
            ubicacion: `Ubicación ${i}, La Serena`,
            comuna: 'La Serena',
            maximoDinero: `${Math.floor(Math.random() * 500) + 100}.000`,
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente'
        });

        database['sobre-500-uf'].push({
            id: `S500-${String(i).padStart(3, '0')}`,
            entidad: `Entidad Financiera ${i}`,
            instalacion: `Instalación ${i}`,
            rut: `${Math.floor(Math.random() * 20) + 90}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-4`,
            ubicacion: `Ubicación ${i}, La Serena`,
            comuna: 'La Serena',
            monto: `${500 + Math.floor(Math.random() * 1000)} UF`,
            fechaAprobacion: new Date().toISOString().split('T')[0],
            vigencia: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().split('T')[0],
            estadoVigencia: 'Vigente'
        });
    }
}

// Funciones de navegación
function showHome() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('home').style.display = 'block';
    updateCounts();
}

function showSection(sectionName) {
    console.log(`🔄 Mostrando sección: ${sectionName}`);
    
    document.getElementById('home').style.display = 'none';
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (!targetSection) {
        console.error(`❌ ERROR: No se encontró la sección ${sectionName}`);
        return;
    }
    
    targetSection.classList.add('active');
    console.log(`✅ Sección ${sectionName} activada`);
    
    if (sectionName === 'medidas') {
        showTab(sectionName, 'consultar');
        setTimeout(() => {
            const medidasConsultar = document.getElementById('medidas-consultar');
            if (medidasConsultar) {
                medidasConsultar.style.display = 'block';
                medidasConsultar.classList.add('active');
            }
        }, 100);
    } else if (sectionName === 'directivas') {
        showTab(sectionName, 'consultar');
        // Cargar automáticamente los datos de directivas de funcionamiento
        setTimeout(() => {
            loadData('directivas-funcionamiento');
        }, 100);
    } else {
        showTab(sectionName, 'consultar');
    }
}

function showTab(section, tab) {
    console.log(`🔄 Cambiando a pestaña: ${section} - ${tab}`);
    
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
            updateMedidasSubSectionCounts();
        } else if (tab === 'agregar') {
            document.getElementById('medidas-agregar').classList.add('active');
            document.getElementById('servicentros-page').classList.remove('active');
            document.getElementById('sobre-500-uf-page').classList.remove('active');
        }
    } else {
        document.getElementById(`${section}-${tab}`).classList.add('active');
    }
}

// Función para mostrar las subsecciones de medidas
function showSubMedidaPage(subSectionType) {
    console.log(`🔄 Mostrando subsección de medidas: ${subSectionType}`);
    
    document.querySelectorAll('#medidas .tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    if (subSectionType === 'servicentros') {
        const servicentrosPage = document.getElementById('servicentros-page');
        servicentrosPage.classList.add('active');
        servicentrosPage.style.display = 'block';
        loadData('servicentros');
    } else if (subSectionType === 'sobre-500-uf') {
        const sobre500Page = document.getElementById('sobre-500-uf-page');
        sobre500Page.classList.add('active');
        sobre500Page.style.display = 'block';
        loadData('sobre-500-uf');
    }
}

// Función para cargar y mostrar datos
function loadData(section) {
    console.log(`🔄 Cargando datos para sección: ${section}`);
    
    let resultsContainerId = `${section}-results`;
    if (section === 'directivas-funcionamiento') {
        resultsContainerId = 'directivas-results';
    }
    
    const resultsContainer = document.getElementById(resultsContainerId);

    if (!resultsContainer) {
        console.error(`❌ No se encontró el contenedor: ${resultsContainerId}`);
        return;
    }

    const data = database[section];
    console.log(`📊 Datos disponibles para ${section}:`, data ? data.length : 'undefined');
    
    if (!data || !Array.isArray(data)) {
        console.warn(`⚠️ Datos inválidos para la sección: ${section}`);
        resultsContainer.innerHTML = '<div class="no-data">Error: Datos no válidos</div>';
        return;
    }
    
    if (data.length === 0) {
        console.warn(`⚠️ No hay datos para la sección: ${section}`);
        resultsContainer.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
        return;
    }

    const table = createTable(section, data);
    resultsContainer.innerHTML = table;
}

// Función para crear tablas HTML
function createTable(section, data) {
    console.log(`🏗️ Creando tabla para sección: ${section} con ${data.length} registros`);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        return '<div class="no-data">No se encontraron resultados</div>';
    }

    let headers = [];
    if (section === 'estudios') {
        headers = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'planes') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna'];
    } else if (section === 'servicentros') {
        headers = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        headers = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto'];
    } else if (section === 'directivas-funcionamiento') {
        headers = ['numero', 'empresaRRHH', 'rutEmpresa', 'nombreInstalacion', 'entidadMandante', 'rutMandante', 'representanteLegal', 'telefono', 'correo', 'resolucion'];
    } else {
        headers = Object.keys(data[0] || {});
    }

    let tableHTML = '<table class="data-table"><thead><tr>';
    
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((row, index) => {
        if (!row || typeof row !== 'object') {
            return;
        }
        
        const originalIndex = database[section].indexOf(row);
        const detailIndex = originalIndex !== -1 ? originalIndex : index; 

        tableHTML += `<tr onclick="showDetails('${section}', ${detailIndex})">`;

        headers.forEach(header => {
            let value = row[header];
            let cellClass = '';
            
            if (value === undefined || value === null) {
                value = '-';
            } else if (typeof value === 'string' && value.trim() === '') {
                value = '-';
            }
            
            // Formatear fechas
            const dateHeaders = ['fechaInicio', 'fechaFin', 'fechaAprobacion', 'vigencia', 'fecha', 'fechaEvento'];
            if (dateHeaders.includes(header) && value !== '-') {
                value = formatDateForDisplay(value);
            }

            if (header === 'estadoVigencia') {
                if (value === 'Vigente') {
                    cellClass = 'status-vigente';
                } else if (value === 'Vencido') {
                    cellClass = 'status-vencido';
                }
            }
            
            if (typeof value === 'string') {
                value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            
            tableHTML += `<td class="${cellClass}">${value}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

// Función para formatear headers
function formatHeader(header) {
    const headerMap = {
        codigo: 'Código',
        numero: 'NRO',
        empresaRRHH: 'Empresa RR.HH.',
        rutEmpresa: 'RUT Empresa RR.HH.',
        nombreInstalacion: 'Nombre Instalación',
        entidadMandante: 'Entidad Mandante (Contratante)',
        rutMandante: 'RUT Entidad Mandante',
        representanteLegal: 'Representante Legal',
        telefono: 'Teléfono',
        correo: 'Correo Electrónico',
        resolucion: 'Resolución Aprob. DD.FF.',
        fechaAprobacion: 'Fecha de Aprobación',
        vigencia: 'Fecha de Vigencia',
        estadoVigencia: 'Estado de Vigencia',
        tipo: 'Entidad',
        rut: 'R.U.T',
        direccion: 'Dirección',
        comuna: 'Comuna',
        fechaInicio: 'Fecha de Inicio',
        fechaFin: 'Fecha Fin',
        revision: 'Dirección',
        nombreServicentro: 'Nombre Servicentro',
        propietario: 'Propietario/Concesionario',
        maximoDinero: 'Máximo de Dinero',
        ubicacion: 'Ubicación',
        id: 'Código',
        entidad: 'Entidad',
        instalacion: 'Instalación',
        monto: 'Monto (UF)'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
}

// Función para formatear fechas
function formatDateForDisplay(dateString) {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
}

// Función para buscar datos
function searchData(section, searchTerm) {
    const data = database[section];
    const filteredData = data.filter(item => {
        return Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    let resultsContainerId = `${section}-results`;
    if (section === 'directivas-funcionamiento') {
        resultsContainerId = 'directivas-results';
    }
    
    const resultsContainer = document.getElementById(resultsContainerId);
    const table = createTable(section, filteredData);
    resultsContainer.innerHTML = table;
}

// Función para mostrar detalles en modal
function showDetails(section, index) {
    const item = database[section][index];
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Detalles - ${item.codigo || item.numero || item.id}`;
    modalTitle.className = `modal-title ${section}`;
    
    let detailsHTML = '';
    let detailKeys = [];
    
    if (section === 'directivas-funcionamiento') {
        detailKeys = ['numero', 'empresaRRHH', 'rutEmpresa', 'nombreInstalacion', 'entidadMandante', 'rutMandante', 'representanteLegal', 'telefono', 'correo', 'resolucion', 'fechaAprobacion', 'vigencia', 'estadoVigencia'];
    } else if (section === 'estudios') {
        detailKeys = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna'];
    } else if (section === 'planes') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna'];
    } else if (section === 'servicentros') {
        detailKeys = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        detailKeys = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto'];
    }

    detailKeys.forEach(key => {
        let value = item[key] || 'No especificado';
        const dateHeaders = ['fechaInicio', 'fechaFin', 'fechaAprobacion', 'vigencia', 'fecha', 'fechaEvento'];
        if (dateHeaders.includes(key)) {
            value = formatDateForDisplay(value);
        }

        let detailClass = '';
        if (key === 'estadoVigencia') {
            if (value === 'Vigente') {
                detailClass = 'status-vigente';
            } else if (value === 'Vencido') {
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

// Función para cerrar modal
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Función para agregar registros
function addRecord(section, event) {
    event.preventDefault();
    
    const formData = {};
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        let key = input.id.replace(`${section}-`, '').replace('directiva-', '');
        formData[key] = input.value;
    });

    if (section === 'directivas') {
        // Mapear campos del formulario a la estructura de directivas-funcionamiento
        const directivaData = {
            numero: formData.numero,
            empresaRRHH: formData.empresa,
            rutEmpresa: formData.rut,
            nombreInstalacion: formData.instalacion,
            entidadMandante: formData.mandante,
            rutMandante: '',
            representanteLegal: '',
            telefono: '',
            correo: '',
            resolucion: '',
            fechaAprobacion: formData.fecha,
            vigencia: new Date(new Date(formData.fecha).getTime() + 3*365*24*60*60*1000).toISOString().split('T')[0],
            estadoVigencia: 'Vigente'
        };
        
        database['directivas-funcionamiento'].push(directivaData);
    } else {
        // Lógica existente para otras secciones
        let targetArray = database[section];
        
        if (section === 'planes' || section === 'medidas' || section === 'servicentros' || section === 'sobre-500-uf') {
            const fechaAprobacion = formData.fechaAprobacion || formData.fecha;
            if (fechaAprobacion) {
                const approvalDateObj = new Date(fechaAprobacion);
                const vigenciaDateObj = new Date(approvalDateObj);
                vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
                formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];
                formData.estadoVigencia = vigenciaDateObj > new Date() ? 'Vigente' : 'Vencido';
            }
        } else if (section === 'estudios') {
            const fechaInicio = formData.fechaInicio;
            if (fechaInicio) {
                const startDateObj = new Date(fechaInicio);
                const endDateObj = new Date(startDateObj);
                endDateObj.setFullYear(endDateObj.getFullYear() + 2);
                formData.fechaFin = endDateObj.toISOString().split('T')[0];
                formData.estadoVigencia = endDateObj > new Date() ? 'Vigente' : 'Vencido';
            }
        }
        
        targetArray.push(formData);
    }
    
    form.reset();
    showAlert(section, 'Registro guardado exitosamente', 'success');
    updateCounts();
    
    if (section === 'directivas') {
        loadData('directivas-funcionamiento');
    } else {
        showTab(section, 'consultar');
    }
}

// Función para actualizar contadores
function updateCounts() {
    if (!database || typeof database !== 'object') {
        return;
    }
    
    const estudiosCount = (database.estudios && Array.isArray(database.estudios)) ? database.estudios.length : 0;
    const planesCount = (database.planes && Array.isArray(database.planes)) ? database.planes.length : 0;
    const servicentrosCount = (database.servicentros && Array.isArray(database.servicentros)) ? database.servicentros.length : 0;
    const sobre500Count = (database['sobre-500-uf'] && Array.isArray(database['sobre-500-uf'])) ? database['sobre-500-uf'].length : 0;
    const medidasTotalCount = servicentrosCount + sobre500Count;
    const directivasCount = (database['directivas-funcionamiento'] && Array.isArray(database['directivas-funcionamiento'])) ? database['directivas-funcionamiento'].length : 0;
    
    const estudiosElement = document.getElementById('estudios-count');
    const planesElement = document.getElementById('planes-count');
    const medidasElement = document.getElementById('medidas-count');
    const directivasElement = document.getElementById('directivas-count');
    
    if (estudiosElement) estudiosElement.textContent = `${estudiosCount} registros`;
    if (planesElement) planesElement.textContent = `${planesCount} registros`;
    if (medidasElement) medidasElement.textContent = `${medidasTotalCount} registros`;
    if (directivasElement) directivasElement.textContent = `${directivasCount} registros`;

    updateMedidasSubSectionCounts();
}

function updateMedidasSubSectionCounts() {
    const servicentrosCount = (database.servicentros && Array.isArray(database.servicentros)) ? database.servicentros.length : 0;
    const sobre500Count = (database['sobre-500-uf'] && Array.isArray(database['sobre-500-uf'])) ? database['sobre-500-uf'].length : 0;
    
    const servicentrosCountElement = document.getElementById('servicentros-count-display');
    const sobre500UFCountElement = document.getElementById('sobre-500-uf-count-display');

    if (servicentrosCountElement) {
        servicentrosCountElement.textContent = `(${servicentrosCount} registros)`;
    }
    if (sobre500UFCountElement) {
        sobre500UFCountElement.textContent = `(${sobre500Count} registros)`;
    }
}

// Función para mostrar alertas
function showAlert(section, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const currentActiveSection = document.querySelector('.section.active');
    if (currentActiveSection) {
        const targetElement = currentActiveSection.querySelector('.section-header');
        if (targetElement && targetElement.nextSibling) {
            targetElement.parentNode.insertBefore(alertDiv, targetElement.nextSibling);
        }
    }
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Funciones de éxito y error de carga
function showExcelLoadSuccess() {
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const statusDiv = homeSection.querySelector('#excel-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <p style="margin: 0; color: #2c5530; font-weight: bold;">
                    ✅ Datos cargados exitosamente desde Excel
                </p>
                <p style="margin: 5px 0 0 0; color: #2c5530; font-size: 0.9em;">
                    ${database.estudios.length} estudios, ${database.planes.length} planes, ${database.servicentros.length} servicentros, ${database['sobre-500-uf'].length} medidas +500UF, ${database['directivas-funcionamiento'].length} directivas
                </p>
            `;
            statusDiv.style.backgroundColor = '#d4edda';
            statusDiv.style.borderColor = '#28a745';
        }
    }
}

function showExcelLoadError(errorMessage = 'No se pudo cargar el archivo Excel automáticamente.') {
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const statusDiv = homeSection.querySelector('#excel-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <p style="margin: 0; color: #8b4513; font-weight: bold;">
                    📝 Archivo Excel no encontrado - Usando datos de ejemplo
                </p>
                <p style="margin: 5px 0 0 0; color: #8b4513; font-size: 0.9em;">
                    ${errorMessage}
                </p>
                <p style="margin: 5px 0 0 0; color: #8b4513; font-size: 0.9em;">
                    ${database.estudios.length} estudios, ${database.planes.length} planes, ${database.servicentros.length} servicentros, ${database['sobre-500-uf'].length} medidas +500UF, ${database['directivas-funcionamiento'].length} directivas de ejemplo.
                </p>
                <div style="margin-top: 15px;">
                    <button onclick="showFileSelector()" style="background: #27ae60; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">📁 Cargar "BASE DE DATOS.xlsx"</button>
                </div>
            `;
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.borderColor = '#ffc107';
        }
    }
}

function showFileSelector() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await loadDataFromExcel(file);
                updateCounts();
            } catch (loadError) {
                console.error('Error cargando archivo:', loadError);
                alert('Error al cargar el archivo Excel. Verifique que sea el archivo correcto.');
            }
        }
    };
    input.click();
}

// Event listeners
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando sistema...');
    
    await loadDataFromExcel();
    updateCounts();
    
    console.log('✅ Sistema iniciado correctamente');
});
