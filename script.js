// Función de prueba para debug desde consola
window.testMedidas = function() {
    console.log('🧪 PRUEBA DE MEDIDAS - Estado actual:');
    console.log('📊 Servicentros:', database.servicentros ? database.servicentros.length : 'NO EXISTE');
    console.log('📊 Sobre 500 UF:', database['sobre-500-uf'] ? database['sobre-500-uf'].length : 'NO EXISTE');

    if (database.servicentros && database.servicentros.length > 0) {
        console.log('✅ Ejemplo servicentro:', database.servicentros[0]);
    }

    if (database['sobre-500-uf'] && database['sobre-500-uf'].length > 0) {
        console.log('✅ Ejemplo sobre 500 UF:', database['sobre-500-uf'][0]);
    }

    // Probar mostrar servicentros
    console.log('🧪 Probando mostrar servicentros...');
    showSubMedidaPage('servicentros');

    setTimeout(() => {
        console.log('🧪 Probando mostrar sobre 500 UF...');
        showSubMedidaPage('sobre-500-uf');
    }, 2000);
};

// Función para verificar qué archivos están disponibles y el estado de window.fs
window.verificarArchivos = async function() {
    console.log('🔍 Verificando archivos disponibles...');
    console.log('Tipo de window.fs:', typeof window.fs); // Added to check window.fs availability

    if (typeof window.fs === 'undefined') {
        console.log('❌ window.fs no está disponible, no se pueden verificar los archivos directamente.');
        return;
    }

    // Lista de posibles nombres de archivo
    const posiblesNombres = [
        'BASE DE DATOS.xlsx',
        'base de datos.xlsx',
        'BASE_DE_DATOS.xlsx',
        'base_de_datos.xlsx',
        'BaseDeDatos.xlsx',
        'BASE DE DATOS.xls', // Added .xls extension
        'base de datos.xls', // Added .xls extension
        'BASE_DE_DATOS.xls', // Added .xls extension
        'base_de_datos.xls', // Added .xls extension
        'BaseDeDatos.xls', // Added .xls extension
        'BASE  DE DATOS COMPONENTES SISTEMA SEGURIDAD PRIVADA TOTAL OS10 COQUIMBO 22 04 25.xlsx' // Original long name
    ];

    console.log('📁 Probando nombres de archivo...');

    for (const nombre /* Nombre de archivo que se está probando */ of posiblesNombres) {
        try {
            const response = await window.fs.readFile(nombre);
            console.log(`✅ ENCONTRADO: "${nombre}" (${response.length} bytes)`);
        } catch (error) {
            console.log(`❌ NO ENCONTRADO: "${nombre}" (Error: ${error.message})`); // Added error message
        }
    }

    console.log('✅ Verificación completada');
};

// Inicializa la aplicación - CORREGIDA
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando sistema...');
    console.log('📁 Buscando archivo "BASE DE DATOS.xlsx"...');

    // Verificar interfaz primero
    const interfazOK = verificarInterfaz();
    if (!interfazOK) {
        console.error('❌ Error en la verificación de interfaz, abortando inicialización');
        return;
    }

    // Intentar cargar datos desde Excel automáticamente
    await loadDataFromExcel();

    // Debug: Verificar estado de la base de datos después de la carga
    console.log('🔍 Estado de la base de datos después de la carga:');
    console.log('- Estudios:', database.estudios ? database.estudios.length : 'undefined');
    console.log('- Planes:', database.planes ? database.planes.length : 'undefined');
    console.log('- Servicentros:', database.servicentros ? database.servicentros.length : 'undefined');
    console.log('- Sobre 500 UF:', database['sobre-500-uf'] ? database['sobre-500-uf'].length : 'undefined');
    console.log('- Directivas (Empresas RRHH):', database['empresas-rrhh'] ? database['empresas-rrhh'].length : 'undefined'); // Renamed for clarity

    // Actualizar contadores de forma segura
    updateCounts();

    // Verificar interfaz nuevamente después de cargar datos
    setTimeout(() => {
        console.log('🔍 Verificación final de interfaz...');
        verificarInterfaz();

        // Mostrar funciones de prueba disponibles
        console.log('🧪 Funciones de debug disponibles:');
        console.log('- Para probar medidas: testMedidas()');
        console.log('- Para verificar archivos: verificarArchivos()');

        // Si no hay datos reales, mostrar instrucciones
        if (database.servicentros.length === 10 && database['sobre-500-uf'].length === 8) { // Assuming sample data has these fixed counts
            console.log('📝 Se están usando datos de ejemplo.');
            console.log('💡 Para cargar tu Excel "BASE DE DATOS.xlsx":');
            console.log('   1. Haz click en "📁 Cargar BASE DE DATOS.xlsx"');
            console.log('   2. O ejecuta: verificarArchivos() para ver qué archivos están disponibles');
        }
    }, 1000);

    console.log('✅ Sistema iniciado correctamente:', {
        'Estudios de Seguridad': database.estudios ? database.estudios.length : 0,
        'Planes de Seguridad': database.planes ? database.planes.length : 0,
        'Servicentros': database.servicentros ? database.servicentros.length : 0,
        'Medidas Sobre 500 UF': database['sobre-500-uf'] ? database['sobre-500-uf'].length : 0,
        'Empresas RRHH (Directivas)': database['empresas-rrhh'] ? database['empresas-rrhh'].length : 0,
        'Directivas totales': database['empresas-rrhh'] ? database['empresas-rrhh'].length : 0 // Assuming this is the total for directivas section
    });
});
// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = []; // This holds the list of unique company names from 'EMPRESAS RECURSOS HUMANOS' sheet
let currentDirectivasSubSectionType = '';
let currentEmpresaSelected = '';
let database = {}; // Se llenará con datos del Excel o ejemplos

// Pagination variables for Empresas RRHH (Directivas)
let directivasItemsPerPage = 50;
let currentDirectivasPage = 1;
let filteredDirectivasData = []; // Stores filtered data for pagination

// Función para cargar datos desde el Excel (versión corregida para navegadores normales)
async function loadDataFromExcel(file = null) {
    try {
        let arrayBuffer;

        if (file) {
            // Si se proporciona un archivo, leerlo
            console.log(`📁 Cargando archivo proporcionado: ${file.name}`);
            arrayBuffer = await file.arrayBuffer();
        } else {
            // Intentar cargar archivo automáticamente solo si window.fs está disponible
            if (typeof window.fs !== 'undefined' && typeof window.fs.readFile === 'function') {
                console.log('📁 window.fs está disponible, intentando cargar automáticamente...');
                const nombresAlternativos = [
                    'BASE DE DATOS.xlsx',
                    'base de datos.xlsx',
                    'BASE_DE_DATOS.xlsx',
                    'base_de_datos.xlsx',
                    'BaseDeDatos.xlsx',
                    'BASE DE DATOS.xls', // Added .xls extension
                    'base de datos.xls', // Added .xls extension
                    'BASE_DE_DATOS.xls', // Added .xls extension
                    'base_de_datos.xls', // Added .xls extension
                    'BaseDeDatos.xls', // Added .xls extension
                    'BASE  DE DATOS COMPONENTES SISTEMA SEGURIDAD PRIVADA TOTAL OS10 COQUIMBO 22 04 25.xlsx'
                ];

                let archivoEncontrado = false;
                for (const nombre /* Nombre de archivo que se está probando */ of nombresAlternativos) {
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
                // Si window.fs no está disponible, usar datos de ejemplo directamente
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
            medidas: [], // Array general para compatibilidad
            servicentros: [], // MEDIDAS SERVICENTRO
            'sobre-500-uf': [], // MEDIDAS SOBRE 500 UF
            directivas: [], // This will be the main directivas list, but 'empresas-rrhh' currently holds the data from 'DIRECTIVAS DE FUNCIONAMIENTOS'
            'empresas-rrhh': [], // Corresponds to DIRECTIVAS DE FUNCIONAMIENTOS sheet records
            'guardias-propios': [],
            'eventos-masivos': []
        };

        // Cargar ESTUDIOS
        await loadEstudios(workbook);

        // Cargar PLANES DE SEGURIDAD
        await loadPlanes(workbook);

        // Cargar MEDIDAS SOBRE 500 UF
        await loadMedidasSobre500UF(workbook);

        // Cargar MEDIDAS SERVICENTROS
        await loadMedidasServicentros(workbook);

        // Cargar DIRECTIVAS DE FUNCIONAMIENTOS (populates database['empresas-rrhh'])
        await loadDirectivas(workbook);

        // Cargar EMPRESAS RECURSOS HUMANOS (populates empresasRRHHList with unique company names)
        await loadEmpresasRRHH(workbook);

        // Initialize filteredDirectivasData with all directivas (from 'empresas-rrhh' section)
        filteredDirectivasData = [...database['empresas-rrhh']];


        console.log('✅ Datos cargados exitosamente desde Excel:', {
            estudios: database.estudios.length,
            planes: database.planes.length,
            servicentros: database.servicentros.length,
            'sobre-500-uf': database['sobre-500-uf'].length,
            directivas_funcionamiento: database['empresas-rrhh'].length, // Corrected reference
            empresas_recursos_humanos: empresasRRHHList.length // Corrected reference
        });

        // Actualizar UI para mostrar éxito
        showExcelLoadSuccess();

    } catch (error) {
        console.log('📝 Cargando datos de ejemplo debido a:', error.message);
        // Si hay error, generar datos de ejemplo como fallback
        generateSampleData();
        showExcelLoadError(error.message); // Pass the error message
    }
}

// Función para mostrar mensaje de éxito
function showExcelLoadSuccess() {
    // Buscar y actualizar el mensaje de estado en el home
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const statusDiv = homeSection.querySelector('.header > div');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <p style="margin: 0; color: #2c5530; font-weight: bold;">
                    ✅ Datos cargados exitosamente desde Excel
                </p>
                <p style="margin: 5px 0 0 0; color: #2c5530; font-size: 0.9em;">
                    ${database.estudios.length} estudios, ${database.planes.length} planes, ${database.servicentros.length} servicentros, ${database['sobre-500-uf'].length} medidas +500UF, ${database['empresas-rrhh'].length} directivas
                </p>
            `;
        }
    }
}

// Función para mostrar mensaje de error y opciones
function showExcelLoadError(errorMessage = 'No se pudo cargar el archivo Excel automáticamente.') {
    // Buscar y actualizar el mensaje de estado en el home
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const statusDiv = homeSection.querySelector('.header > div');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <p style="margin: 0; color: #8b4513; font-weight: bold;">
                    📝 Archivo Excel no encontrado - Usando datos de ejemplo
                </p>
                <p style="margin: 5px 0 0 0; color: #8b4513; font-size: 0.9em;">
                    ${errorMessage} Por favor, verifique el nombre y la extensión del archivo (ej: "BASE DE DATOS.xlsx").
                </p>
                <p style="margin: 5px 0 0 0; color: #8b4513; font-size: 0.9em;">
                    ${database.estudios.length} estudios, ${database.planes.length} planes, ${database.servicentros.length} servicentros, ${database['sobre-500-uf'].length} medidas +500UF de ejemplo.
                </p>
                <div style="margin-top: 15px;">
                    <button onclick="showFileSelector()" style="background: #27ae60; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">📁 Cargar "BASE DE DATOS.xlsx"</button>
                    <button onclick="mostrarInstrucciones()" style="background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">❓ ¿Cómo cargar mi Excel?</button>
                </div>
            `;
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.borderColor = '#ffc107';
        }
    }
}

// Función para mostrar instrucciones de carga (hacer global)
window.mostrarInstrucciones = function() {
    alert(`📋 INSTRUCCIONES PARA CARGAR TU EXCEL:

1. ✅ Asegúrate de que tu archivo se llame exactamente: "BASE DE DATOS.xlsx" o una de sus variantes comunes como "base de datos.xlsx".
   Verifica las mayúsculas/minúsculas y la extensión (.xlsx o .xls).

2. 📁 Haz click en "📁 Cargar BASE DE DATOS.xlsx"

3. 🔍 Busca y selecciona tu archivo Excel

4. ⏳ Espera a que se carguen los datos

❗ IMPORTANTE:
- El archivo debe estar en formato .xlsx o .xls
- Debe tener las hojas: "MEDIDAS SERVICENTRO" y "MEDIDAS SOBRE 500 UF"
- Verifica que los datos estén en las hojas correctas

Si sigue sin funcionar, verifica la consola del navegador (F12) para más detalles.`);
};

// Función para mostrar selector de archivo
function showFileSelector() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📁 Archivo seleccionado:', file.name);
            // Mostrar mensaje de carga
            const homeSection = document.getElementById('home');
            if (homeSection) {
                const statusDiv = homeSection.querySelector('.header > div');
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <p style="margin: 0; color: #0066cc; font-weight: bold;">
                            ⏳ Cargando archivo Excel...
                        </p>
                        <p style="margin: 5px 0 0 0; color: #0066cc; font-size: 0.9em;">
                            Procesando: ${file.name}
                        </p>
                    `;
                    statusDiv.style.backgroundColor = '#cce7ff';
                    statusDiv.style.borderColor = '#0066cc';
                }
            }

            try {
                await loadDataFromExcel(file);
                updateCounts();

                // Recargar datos en la vista actual si es necesario
                const activeSection = document.querySelector('.section.active');
                if (activeSection && activeSection.id !== 'home') {
                    const activeTab = activeSection.querySelector('.tab-content.active');
                    if (activeTab && activeTab.id.includes('consultar')) {
                        // For directivas, reload the specific Empresas RRHH list
                        if (activeSection.id === 'directivas' && document.getElementById('directivas-empresas-rrhh-list').classList.contains('active')) {
                            currentDirectivasPage = 1; // Reset page on reload
                            renderEmpresasRRHHList(); // Re-render with new data
                        } else {
                            loadData(activeSection.id);
                        }
                    }
                }
            } catch (loadError) {
                console.error('Error cargando archivo:', loadError);
                alert('Error al cargar el archivo Excel. Verifique que sea el archivo correcto.');
                showExcelLoadError(loadError.message); // Pass the error message
            }
        }
    };
    input.click();
}

// Función para cargar estudios desde el Excel
async function loadEstudios(workbook) {
    const worksheet = workbook.Sheets['ESTUDIOS '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "ESTUDIOS " no encontrada');
        return;
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    // Los encabezados están en la fila 1, datos empiezan en fila 2
    // User-provided order: NRO, ENTIDAD, RUT ENTIDAD, UBICACIÓN (CASA MATRIZ), REPRESENTANTE LEGAL ENTIDAD, TELEFONO, CORREO ELECTRONICO, IDENTIFICACION JEFE DE SEGURIDAD, TELEFONO, CORREO ELECTRONICO, DECRETO N°, ESTADO DE TRAMITACIÓN, RESOLUCION APROB. EST., FECHA VIGENCIA
    // Assuming mapping from Excel columns to object properties based on user's column names
    // Note: Some fields like 'Representante Legal Entidad', 'Telefono', 'Correo Electronico', 'Decreto N°', 'Estado de Tramitación', 'Resolucion Aprob. Est.' might not be consistently present in the Excel sheet at these exact indices or might be empty.
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue; // Saltar filas vacías

        const fechaVigencia = parseFecha(row[13]); // FECHA VIGENCIA (Assuming this is row[13] based on user's 14-column list)
        const fechaInicio = parseFecha(row[12]); // Assuming Fecha de Aprobación is row[12]
        // If fechaInicio is not from the sheet, default to a date for consistency, or current date if needed
        const actualFechaInicio = (fechaInicio && !isNaN(fechaInicio.getTime())) ? fechaInicio : new Date();

        const endDateObj = new Date(fechaVigencia);
        const today = new Date();
        const estadoVigenciaText = endDateObj > today ? 'Vigente' : 'Vencido';

        database.estudios.push({
            codigo: `EST-${String(row[0]).padStart(3, '0')}`, // NRO
            tipo: row[1] || 'Entidad Obligada', // ENTIDAD
            rut: row[2] || '', // RUT ENTIDAD
            direccion: row[3] || '', // UBICACIÓN (CASA MATRIZ)
            representanteLegal: row[4] || '', // REPRESENTANTE LEGAL ENTIDAD
            telefono: row[5] || '', // TELEFONO
            correoElectronico: row[6] || '', // CORREO ELECTRONICO
            responsable: row[7] || 'No especificado', // IDENTIFICACION JEFE DE SEGURIDAD
            decretoNro: row[10] || '', // DECRETO N°
            estadoTramitacion: row[11] || 'PENDIENTE', // ESTADO DE TRAMITACIÓN
            resolucionAprobacionEst: row[12] || '', // RESOLUCION APROB. EST.
            fechaVigencia: fechaVigencia.toISOString().split('T')[0], // FECHA VIGENCIA
            fechaInicio: actualFechaInicio.toISOString().split('T')[0], // Using internal 'fechaInicio' for consistency
            estadoVigencia: estadoVigenciaText, // This property is kept for consistency with other sections, but 'estadoTramitacion' is the user's specific request
            comuna: extraerComuna(row[3] || '') // Extraer comuna de la dirección
        });
    }
}

// Función para cargar planes desde el Excel
async function loadPlanes(workbook) {
    const worksheet = workbook.Sheets['PLANES DE SEGURIDAD'];
    if (!worksheet) {
        console.warn('⚠️ Hoja "PLANES DE SEGURIDAD" no encontrada');
        return;
    }

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

// Función para cargar medidas SOBRE 500 UF desde el Excel
async function loadMedidasSobre500UF(workbook) {
    console.log('🔄 Cargando medidas SOBRE 500 UF...');

    const worksheet = workbook.Sheets['MEDIDAS SOBRE 500 UF '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "MEDIDAS SOBRE 500 UF " no encontrada');
        return;
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    console.log(`📋 Filas totales en SOBRE 500 UF: ${jsonData.length}`);

    // Los datos empiezan en la fila 4 (índice 3)
    let registrosCargados = 0;
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[1] || row[1] === null) continue; // NRO está en índice 1

        try {
            // Usar función segura para fechas
            const fechaVigencia = parseFechaSimple(row[11]); // FECHA DE VIGENCIA MEDIDAS DE SEGURIDAD
            const fechaAprobacion = new Date(fechaVigencia.getTime() - (3 * 365 * 24 * 60 * 60 * 1000)); // 3 años antes

            const registro = {
                id: `S500-${String(row[1]).padStart(3, '0')}`, // NRO
                entidad: row[2] || 'Entidad no especificada', // ENTIDAD
                rut: row[3] || '', // RUT ENTIDAD
                instalacion: row[4] || '', // INSTALACIÓN
                ubicacion: row[5] || '', // UBICACIÓN INSTALACIÓN
                encargado: row[7] || 'No especificado', // IDENTIFICACION ENCARGADO
                telefono: row[8] || '', // TELEFONO
                correo: row[9] || '', // CORREO ELECTRONICO
                resolucion: row[10] || '', // RESOLUCION APROB. MEDIDAS DE SEGURIDAD
                fechaAprobacion: fechaToSafeString(fechaAprobacion),
                vigencia: fechaToSafeString(fechaVigencia),
                estadoTramitacion: row[12] || 'VIGENTE', // ESTADO DE TRAMITACIÓN
                estadoVigencia: fechaVigencia > new Date() ? 'Vigente' : 'Vencido',
                tipo: row[2] || 'Entidad Comercial',
                direccion: row[5] || '',
                comuna: extraerComuna(row[5] || ''),
                monto: `${500 + Math.floor(Math.random() * 1000)} UF` // Simular monto sobre 500 UF
            };

            database['sobre-500-uf'].push(registro);
            registrosCargados++;

        } catch (error) {
            console.warn(`⚠️ Error procesando fila ${i} de SOBRE 500 UF:`, error.message);
            console.warn(`Datos de la fila:`, row);
        }
    }

    console.log(`✅ Medidas SOBRE 500 UF cargadas: ${registrosCargados} registros`);
}

// Función para cargar medidas SERVICENTROS desde el Excel
async function loadMedidasServicentros(workbook) {
    console.log('🔄 Cargando medidas SERVICENTROS...');

    const worksheet = workbook.Sheets['MEDIDAS SERVICENTRO'];
    if (!worksheet) {
        console.warn('⚠️ Hoja "MEDIDAS SERVICENTRO" no encontrada');
        return;
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    console.log(`📋 Filas totales en SERVICENTROS: ${jsonData.length}`);

    // Los datos empiezan en la fila 3 (índice 2)
    let registrosCargados = 0;
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0] || row[0] === null) continue; // NRO está en índice 0

        try {
            // Usar función segura para fechas
            const fechaAprobacion = parseFechaSimple(row[7]); // FECHA DE APROBACIÓN
            const vigencia = new Date(fechaAprobacion.getTime() + (3 * 365 * 24 * 60 * 60 * 1000)); // 3 años después

            const registro = {
                codigo: `SER-${String(row[0]).padStart(3, '0')}`, // NRO
                nombreServicentro: row[1] || 'Servicentro', // NOMBRE SERVICENTRO
                propietario: row[2] || 'Propietario o Concesionario no especificado', // PROPIETARIO O CONCESIONARIO
                rut: row[3] || '', // RUT
                ubicacion: row[4] || '', // UBICACION
                comuna: row[5] || extraerComuna(row[4] || ''), // COMUNA
                maximoDinero: row[6] || 'No especificado', // MAXIMO DE DINERO
                fechaAprobacion: fechaToSafeString(fechaAprobacion),
                vigencia: fechaToSafeString(vigencia),
                estadoVigencia: vigencia > new Date() ? 'Vigente' : 'Vencido',
                tipo: row[1] || 'Servicentro',
                direccion: row[4] || '',
                estado: 'Implementada'
            };

            database.servicentros.push(registro);
            registrosCargados++;

        } catch (error) {
            console.warn(`⚠️ Error procesando fila ${i} de SERVICENTROS:`, error.message);
            console.warn(`Datos de la fila:`, row);
        }
    }

    console.log(`✅ Medidas SERVICENTROS cargadas: ${registrosCargados} registros`);
}

// Función auxiliar para parsear fechas de manera más simple y segura
function parseFechaSimple(fechaStr) {
    if (!fechaStr || fechaStr === null || fechaStr === undefined) {
        console.log('📅 Fecha vacía, usando fecha actual');
        return new Date();
    }

    // Si es un número (fecha de Excel)
    if (typeof fechaStr === 'number' && !isNaN(fechaStr)) {
        try {
            const excelDate = new Date((fechaStr - 25569) * 86400 * 1000);
            if (isNaN(excelDate.getTime())) {
                console.log('📅 Fecha de Excel inválida, usando fecha actual');
                return new Date();
            }
            return excelDate;
        } catch (error) {
            console.log('📅 Error procesando fecha de Excel, usando fecha actual');
            return new Date();
        }
    }

    // Si es una fecha en formato DD.MM.YYYY
    if (typeof fechaStr === 'string' && fechaStr.includes('.')) {
        try {
            const parts = fechaStr.split('.');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Meses en JS van de 0-11
                const year = parseInt(parts[2]);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    if (isNaN(date.getTime())) {
                        console.log('📅 Fecha DD.MM.YYYY inválida, usando fecha actual');
                        return new Date();
                    }
                    return date;
                }
            }
        } catch (error) {
            console.log('📅 Error procesando fecha DD.MM.YYYY, usando fecha actual');
            return new Date();
        }
    }

    // Si es una fecha en formato DD/MM/YYYY
    if (typeof fechaStr === 'string' && fechaStr.includes('/')) {
        try {
            const parts = fechaStr.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    if (isNaN(date.getTime())) {
                        console.log('📅 Fecha DD/MM/YYYY inválida, usando fecha actual');
                        return new Date();
                    }
                    return date;
                }
            }
        } catch (error) {
            console.log('📅 Error procesando fecha DD/MM/YYYY, usando fecha actual');
            return new Date();
        }
    }

    // Intentar parsear como fecha normal
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
            console.log('📅 Fecha genérica inválida, usando fecha actual');
            return new Date();
        }
        return fecha;
    } catch (error) {
        console.log('📅 Error procesando fecha genérica, usando fecha actual');
        return new Date();
    }
}

// Función auxiliar para convertir fecha a string seguro
function fechaToSafeString(fecha) {
    try {
        if (!fecha || isNaN(fecha.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        return fecha.toISOString().split('T')[0];
    } catch (error) {
        console.log('📅 Error convirtiendo fecha a string, usando fecha actual');
        return new Date().toISOString().split('T')[0];
    }
}

// Función para cargar directivas desde el Excel (Populates database['empresas-rrhh'])
async function loadDirectivas(workbook) {
    const worksheet = workbook.Sheets['DIRECTIVAS DE FUNCIONAMIENTOS '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "DIRECTIVAS DE FUNCIONAMIENTOS " no encontrada');
        return;
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    console.log(`📋 Filas totales encontradas en DIRECTIVAS DE FUNCIONAMIENTOS: ${jsonData.length}`);

    // Limpiar el array antes de cargar para evitar duplicados si se llama varias veces
    database['empresas-rrhh'] = [];

    let recordsProcessed = 0;
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) {
            // console.log(`Skipping empty or invalid row at index ${i} in DIRECTIVAS DE FUNCIONAMIENTOS`); // Optional: log skipped rows
            continue;
        }

        try {
            // Procesar fecha de resolución para obtener fecha de aprobación
            const resolucion = row[9] || ''; // RESOLUCION APROB. DD.FF.
            const fechaAprobacion = parseFechaResolucion(resolucion);
            const vigencia = new Date(fechaAprobacion);
            vigencia.setFullYear(vigencia.getFullYear() + 3);

            database['empresas-rrhh'].push({
                numero: `RRHH-${String(row[0]).padStart(4, '0')}`,
                empresa: row[1] || 'Empresa no especificada', // EMPRESA RR.HH.
                rut: row[2] || '', // RUT EMPRESA RR.HH.
                tipoDirectiva: determinarTipoDirectiva(row[3] || ''), // NAME INSTALACION, used to determine type
                lugarInstalacion: row[3] || '', // NOMBRE INSTALACIÓN
                entidadMandante: row[4] || '', // ENTIDAD MANDANTE (CONTRATANTE)
                rutEntidadMandante: row[5] || '', // RUT ENTIDAD MANDANTE (CONTRATANTE)
                representanteLegal: row[6] || '', // REPRESENTANTE LEGAL ENTIDAD MANDANTE (CONTRATANTE)
                telefono: row[7] || '', // TELEFONO
                correo: row[8] || '', // CORREO ELECTRONICO
                resolucionAprobacion: row[9] || '', // RESOLUCION APROB. DD.FF.
                fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
                estado: row[10] || 'Vigente', // ESTADO DE TRAMITACIÓN
                vigencia: vigencia.toISOString().split('T')[0],
                estadoVigencia: vigencia > new Date() ? 'Vigente' : 'Vencido',
                comuna: extraerComuna(row[4] || ''),
                alcance: `Directiva aplicable a ${row[3]}`
            });
            recordsProcessed++;
        } catch (error) {
            console.warn(`⚠️ Error procesando fila ${i} de DIRECTIVAS DE FUNCIONAMIENTOS:`, error.message);
            console.warn(`Datos de la fila con error:`, row);
        }
    }
    console.log(`✅ Directivas de Funcionamiento cargadas: ${recordsProcessed} registros procesados.`);
}

// Función para cargar empresas RRHH desde el Excel (Populates empresasRRHHList with unique company names)
async function loadEmpresasRRHH(workbook) {
    const worksheet = workbook.Sheets['EMPRESAS RECURSOS HUMANOS '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "EMPRESAS RECURSOS HUMANOS " no encontrada');
        return;
    }

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

    // Calcular el conteo de directivas por empresa (already done when loading directivas)
    // This part is for `empresasRRHHList` which holds unique company names, not directivas themselves.
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

// Función para generar datos de ejemplo (fallback si no se puede cargar Excel) - CORREGIDA
function generateSampleData() {
    console.log('🔄 Generando datos de ejemplo...');

    // IMPORTANTE: Asignar directamente a la variable global database
    database = {
        estudios: [],
        planes: [],
        medidas: [], // Array general para compatibilidad
        servicentros: [], // Array específico para servicentros
        'sobre-500-uf': [], // Array específico para medidas sobre 500 UF
        directivas: [],
        'empresas-rrhh': [], // This will hold the directiva records
        'guardias-propios': [],
        'eventos-masivos': []
    };

    // Crear lista de empresas únicas de RRHH (30 companies for example)
    empresasRRHHList = [];
    const rutSuffixes = ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-K'];
    const sampleAddresses = [
        'Av. Providencia 1234, La Serena',
        'Calle Moneda 567, Coquimbo',
        'Av. Las Condes 890, Ovalle',
        'Calle Huérfanos 432, La Serena',
        'Av. Libertador 678, Coquimbo'
    ];
    const comunasChile = ['La Serena', 'Coquimbo', 'Ovalle', 'Vicuña', 'Illapel'];

    for (let i = 1; i <= 30; i++) {
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

    // Generar 5 estudios de ejemplo
    for (let i = 1; i <= 5; i++) {
        const startDate = `2025-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDateObj);
        endDateObj.setFullYear(endDateObj.getFullYear() + 2);
        const fechaFin = endDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = endDateObj > today ? 'Vigente' : 'Vencido';

        database.estudios.push({
            codigo: `EST-${String(i).padStart(3, '0')}`,
            tipo: `Entidad de Ejemplo ${i}`,
            fechaInicio: startDate,
            fechaFin: fechaFin,
            estadoVigencia: estadoVigencia,
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`,
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)],
            // Adding mock data for new estudio fields to avoid N/A in sample
            representanteLegal: `Rep. Legal ${i}`,
            telefono: `+569${Math.floor(Math.random() * 900000000) + 100000000}`,
            correoElectronico: `estudio${i}@ejemplo.com`,
            responsable: `Jefe Seg. ${i}`,
            decretoNro: `D.S. N° ${Math.floor(Math.random() * 1000) + 100}`,
            estadoTramitacion: Math.random() > 0.5 ? 'APROBADO' : 'EN REVISION',
            resolucionAprobacionEst: `RES. APROB. ${Math.floor(Math.random() * 500) + 10}`
        });
    }

    // Generar 10 planes de ejemplo
    for (let i = 1; i <= 10; i++) {
        const approvalYear = 2024;
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;

        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database.planes.push({
            codigo: `PLN-${String(i).padStart(3, '0')}`,
            tipo: `Entidad Financiera ${i}`,
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            revision: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
            estadoVigencia: estadoVigencia,
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)],
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`
        });
    }

    // Generar 10 servicentros de ejemplo
    const servicentroBrands = ['Copec', 'Petrobras', 'Aramco', 'Shell', 'APM', 'Autogasco S.A.', 'Lincosur', 'Aronex', 'YPF', 'OtraMarca']; // Added all specified brands for testing
    for (let i = 1; i <= 10; i++) {
        const fechaAprobacion = `2024-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        const brand = servicentroBrands[Math.floor(Math.random() * servicentroBrands.length)];

        database.servicentros.push({
            codigo: `SER-${String(i).padStart(3, '0')}`,
            nombreServicentro: `${brand} - Servicentro ${i}`, // Added brand to name
            propietario: `Propietario Ejemplo ${i}`,
            rut: `${Math.floor(Math.random() * 20) + 70}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`,
            ubicacion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)],
            maximoDinero: `${Math.floor(Math.random() * 500) + 100}.000`,
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            tipo: 'Servicentro',
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)]
        });
    }

    // Generar 8 medidas sobre 500 UF de ejemplo
    for (let i = 1; i <= 8; i++) {
        const fechaAprobacion = `2024-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['sobre-500-uf'].push({
            id: `S500-${String(i).padStart(3, '0')}`,
            entidad: `Entidad Financiera ${i}`,
            instalacion: `Instalación ${i}`,
            rut: `${Math.floor(Math.random() * 20) + 90}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`,
            ubicacion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)],
            monto: `${500 + Math.floor(Math.random() * 1000)} UF`,
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            tipo: 'Entidad Financiera',
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)]
        });
    }

    // Generar 514 directivas de empresas RRHH (para simular el total esperado por el usuario)
    const totalSampleDirectivas = 514;
    const tiposDirectiva = ['Contratación', 'Capacitación', 'Evaluación', 'Bienestar', 'Operaciones', 'Seguridad Física'];

    for (let i = 1; i <= totalSampleDirectivas; i++) {
        const empresaAsignada = empresasRRHHList[Math.floor(Math.random() * empresasRRHHList.length)];

        const approvalYear = 2024;
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;

        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['empresas-rrhh'].push({
            numero: `DIR-${String(i).padStart(4, '0')}`, // Changed to DIR- for general directivas
            empresa: empresaAsignada.nombre,
            rut: empresaAsignada.rut,
            tipoDirectiva: tiposDirectiva[Math.floor(Math.random() * tiposDirectiva.length)],
            lugarInstalacion: `Instalación ${String(i).padStart(2, '0')}`,
            entidadMandante: `Mandante Ejemplo ${String(i).padStart(2, '0')}`,
            rutEntidadMandante: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`,
            representanteLegal: `Representante ${String(i).padStart(2, '0')}`,
            telefono: `+569${Math.floor(Math.random() * 900000000) + 100000000}`,
            correo: `contacto${i}@ejemplo.com`,
            resolucionAprobacion: `RES. APROB. N°${i}/${approvalYear}`,
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)]
        });

        empresaAsignada.directivasCount++;
    }

    // Initialize filteredDirectivasData with all directivas (from 'empresas-rrhh' section)
    filteredDirectivasData = [...database['empresas-rrhh']];


    console.log('✅ Datos de ejemplo generados:');
    console.log('- Estudios:', database.estudios.length);
    console.log('- Planes:', database.planes.length);
    console.log('- Servicentros:', database.servicentros.length);
    console.log('- Sobre 500 UF:', database['sobre-500-uf'].length);
    console.log('- Directivas (Empresas RRHH):', database['empresas-rrhh'].length);
    console.log('- Empresas RRHH (Unique):', empresasRRHHList.length);

    // Verificar que los arrays están correctamente poblados
    if (database.servicentros.length === 0) {
        console.error('❌ ERROR: No se generaron servicentros de ejemplo');
    }
    if (database['sobre-500-uf'].length === 0) {
        console.error('❌ ERROR: No se generaron medidas sobre 500 UF de ejemplo');
    }
}

// Helper function to format dates for display
function formatDateForDisplay(dateString) {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    // Add 1 day to account for potential timezone issues if date was created fromYYYY-MM-DD string
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-CL');
}

// Define date headers for formatting
const dateHeaders = ['fechaInicio', 'fechaFin', 'fechaAprobacion', 'vigencia', 'fecha', 'fechaEvento', 'fechaVigencia']; // Added fechaVigencia for estudios

// Funciones de navegación principal
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
        section.style.display = 'none'; // Ensure sections are hidden
    });

    const targetSection = document.getElementById(sectionName);
    if (!targetSection) {
        console.error(`❌ ERROR: No se encontró la sección ${sectionName}`);
        return;
    }

    targetSection.classList.add('active');
    targetSection.style.display = 'block'; // Ensure the section is displayed
    console.log(`✅ Sección ${sectionName} activada`);

    // For measures, force to show the main view with the boxes
    if (sectionName === 'medidas') {
        console.log(`🔧 Configurando vista especial para medidas...`);
        showTab(sectionName, 'consultar');

        // Ensure the boxes are visible
        setTimeout(() => {
            const medidasConsultar = document.getElementById('medidas-consultar');
            if (medidasConsultar) {
                medidasConsultar.style.display = 'block';
                medidasConsultar.classList.add('active');
                console.log(`✅ Vista principal de medidas forzada a visible`);
            }
        }, 100);
    } else if (sectionName === 'directivas') {
        // Upon entering the directivas section, show the Empresas RRHH list by default
        showDirectivasSubSection('empresas-rrhh');
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
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Force hide all tab contents
    });

    if (section === 'medidas') {
        if (tab === 'consultar') {
            document.getElementById('medidas-consultar').classList.add('active');
            document.getElementById('medidas-consultar').style.display = 'block';
            updateMedidasSubSectionCounts(); // Update counters when showing the main view
            console.log(`📊 Vista principal de medidas mostrada`);
            console.log(`📊 Servicentros disponibles: ${database.servicentros ? database.servicentros.length : 0}`);
            console.log(`📊 Sobre 500 UF disponibles: ${database['sobre-500-uf'] ? database['sobre-500-uf'].length : 0}`);
        } else if (tab === 'agregar') {
            document.getElementById('medidas-agregar').classList.add('active');
            document.getElementById('medidas-agregar').style.display = 'block';
        }
    } else if (section === 'directivas') {
        // In the directivas section, if going to "consultar", go back to the main view
        if (tab === 'consultar') {
            document.getElementById('directivas-consultar').classList.add('active');
            document.getElementById('directivas-consultar').style.display = 'block';
        } else if (tab === 'agregar') {
            document.getElementById('directivas-agregar').classList.add('active');
            document.getElementById('directivas-agregar').style.display = 'block';
        }
    } else {
        document.getElementById(`${section}-${tab}`).classList.add('active');
        document.getElementById(`${section}-${tab}`).style.display = 'block'; // Ensure the specific tab is displayed
    }
}

// Función para mostrar las subsecciones de medidas
function showSubMedidaPage(subSectionType) {
    console.log(`🔄 Mostrando subsección de medidas: ${subSectionType}`);

    // Verificar que los elementos existen
    const medidasConsultar = document.getElementById('medidas-consultar');
    const servicentrosPage = document.getElementById('servicentros-page');
    const sobre500Page = document.getElementById('sobre-500-uf-page');

    console.log('🔍 Verificando elementos HTML:');
    console.log('- medidas-consultar:', medidasConsultar ? 'EXISTE' : 'NO EXISTE');
    console.log('- servicentros-page:', servicentrosPage ? 'EXISTE' : 'NO EXISTE');
    console.log('- sobre-500-uf-page:', sobre500Page ? 'EXISTE' : 'NO EXISTE');

    if (!servicentrosPage || !sobre500Page) {
        console.error('❌ ERROR: Elementos HTML necesarios no encontrados');
        alert('Error: No se encontraron los elementos HTML necesarios para mostrar las medidas');
        return;
    }

    // Ocultar todas las secciones de medidas
    document.querySelectorAll('#medidas .tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Forzar ocultar
    });

    if (subSectionType === 'servicentros') {
        console.log(`📋 Activando página de servicentros...`);
        servicentrosPage.classList.add('active');
        servicentrosPage.style.display = 'block'; // Forzar mostrar

        console.log(`📋 Datos de servicentros disponibles: ${database.servicentros ? database.servicentros.length : 'undefined'}`);

        if (!database.servicentros || database.servicentros.length === 0) {
            console.warn('⚠️ No hay datos de servicentros para mostrar');
            servicentrosPage.innerHTML = '<div class="no-data">No hay datos de servicentros disponibles</div>';
            return;
        }

        console.log(`📋 Cargando datos de servicentros...`);
        loadData('servicentros');

    } else if (subSectionType === 'sobre-500-uf') {
        console.log(`💰 Activando página de sobre 500 UF...`);
        sobre500Page.classList.add('active');
        sobre500Page.style.display = 'block'; // Forzar mostrar

        console.log(`💰 Datos de sobre 500 UF disponibles: ${database['sobre-500-uf'] ? database['sobre-500-uf'].length : 'undefined'}`);

        if (!database['sobre-500-uf'] || database['sobre-500-uf'].length === 0) {
            console.warn('⚠️ No hay datos de sobre 500 UF para mostrar');
            sobre500Page.innerHTML = '<div class="no-data">No hay datos de medidas sobre 500 UF disponibles</div>';
            return;
        }

        console.log(`💰 Cargando datos de sobre 500 UF...`);
        loadData('sobre-500-uf');
    }

    console.log(`✅ Subsección ${subSectionType} activada correctamente`);
}

// Función genérica para mostrar las subsecciones de directivas
function showDirectivasSubSection(subSectionType) {
    currentDirectivasSubSectionType = subSectionType;

    document.getElementById('directivas-consultar').classList.remove('active');
    document.getElementById('directivas-consultar').style.display = 'none'; // Hide main consult tab

    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').style.display = 'none';
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').style.display = 'none';
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').style.display = 'none';
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').style.display = 'none';


    const targetListElement = document.getElementById(`directivas-${subSectionType}-list`);
    if (targetListElement) {
        targetListElement.classList.add('active');
        targetListElement.style.display = 'block';
    } else {
        console.error(`❌ ERROR: No se encontró el elemento de lista para la subsección ${subSectionType}`);
        return;
    }


    const titleElement = document.getElementById(`${subSectionType}-list-title`);
    if (titleElement) {
        let titleText = '';
        switch (subSectionType) {
            case 'empresas-rrhh':
                titleText = '👥 Lista de Directivas de Funcionamiento';
                currentDirectivasPage = 1; // Reset page on showing this section
                renderEmpresasRRHHList(); // Call the paginated renderer
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
    document.getElementById('directivas-empresas-rrhh-list').style.display = 'none';
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').style.display = 'none';
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').style.display = 'none';
    document.getElementById('directivas-consultar').classList.add('active');
    document.getElementById('directivas-consultar').style.display = 'block';
}

// Función específica para renderizar la lista de Empresas RRHH (now paginated)
function renderEmpresasRRHHList() {
    const resultsContainer = document.getElementById('empresas-rrhh-results');
    const pageInfoSpan = document.getElementById('directivas-page-info');
    const prevBtn = document.getElementById('directivas-prev-btn');
    const nextBtn = document.getElementById('directivas-next-btn');

    if (!resultsContainer || !pageInfoSpan || !prevBtn || !nextBtn) {
        console.error('❌ Elementos de paginación o contenedor de resultados de Directivas no encontrados.');
        return;
    }

    if (filteredDirectivasData.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay directivas de funcionamiento disponibles o no se encontraron resultados.</div>';
        pageInfoSpan.textContent = 'Página 0 de 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const totalPages = Math.ceil(filteredDirectivasData.length / directivasItemsPerPage);
    const startIndex = (currentDirectivasPage - 1) * directivasItemsPerPage;
    const endIndex = Math.min(startIndex + directivasItemsPerPage, filteredDirectivasData.length);
    const paginatedData = filteredDirectivasData.slice(startIndex, endIndex);

    // Create table using the paginated data
    const tableHTML = createTable('empresas-rrhh', paginatedData);
    resultsContainer.innerHTML = tableHTML;

    // Update pagination info and button states
    pageInfoSpan.textContent = `Página ${currentDirectivasPage} de ${totalPages}`;
    prevBtn.disabled = currentDirectivasPage === 1;
    nextBtn.disabled = currentDirectivasPage === totalPages;
}

// Function to change page for Directivas
function changeDirectivasPage(delta) {
    const totalPages = Math.ceil(filteredDirectivasData.length / directivasItemsPerPage);
    const newPage = currentDirectivasPage + delta;

    if (newPage >= 1 && newPage <= totalPages) {
        currentDirectivasPage = newPage;
        renderEmpresasRRHHList();
    } else {
        console.log(`Intentó ir a la página ${newPage}, pero el total de páginas es ${totalPages}.`);
    }
}


// Función para mostrar los detalles de directivas de una empresa RRHH específica
function showEmpresaDirectivasDetails(empresaNombre) {
    currentEmpresaSelected = empresaNombre;

    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-empresas-rrhh-list').style.display = 'none';
    document.getElementById('directivas-empresa-specific-details').classList.add('active');
    document.getElementById('directivas-empresa-specific-details').style.display = 'block';

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
        'numero', 'empresa', 'rut', 'lugarInstalacion', 'entidadMandante', 'rutEntidadMandante', 'representanteLegal', 'telefono', 'correo', 'resolucionAprobacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia'
    ];

    let tableHTML = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    directivasEmpresa.forEach((directiva, index) => {
        // Note: The index passed to showDetails here is the index within the *original* database['empresas-rrhh'] array
        // to ensure the modal shows correct details.
        const originalIndex = database['empresas-rrhh'].indexOf(directiva);
        tableHTML += `<tr onclick="showDetails('empresas-rrhh', ${originalIndex})">`;
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
        (directiva.lugarInstalacion && directiva.lugarInstalacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.entidadMandante && directiva.entidadMandante.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.resolucionAprobacion && directiva.resolucionAprobacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.fechaAprobacion && directiva.fechaAprobacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.numero && directiva.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.rut && directiva.rut.toLowerCase().includes(searchTerm.toLowerCase()))
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
        'numero', 'empresa', 'rut', 'lugarInstalacion', 'entidadMandante', 'rutEntidadMandante', 'representanteLegal', 'telefono', 'correo', 'resolucionAprobacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia'
    ];

    let tableHTML = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((directiva, index) => {
        const originalIndex = database['empresas-rrhh'].indexOf(directiva); // Get original index for modal
        tableHTML += `<tr onclick="showDetails('empresas-rrhh', ${originalIndex})">`;
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
    document.getElementById('directivas-empresa-specific-details').style.display = 'none';
    document.getElementById('directivas-empresas-rrhh-list').classList.add('active');
    document.getElementById('directivas-empresas-rrhh-list').style.display = 'block';
    renderEmpresasRRHHList(); // Re-render the paginated list
}

// Función para buscar en la lista de Empresas RRHH (now applies to all directivas, and resets pagination)
function searchEmpresasRRHH(searchTerm) {
    if (searchTerm === '') {
        // If search term is empty, show all directivas
        filteredDirectivasData = [...database['empresas-rrhh']];
    } else {
        // Filter directivas based on search term across relevant fields
        filteredDirectivasData = database['empresas-rrhh'].filter(directiva =>
            Object.values(directiva).some(value =>
                value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }
    currentDirectivasPage = 1; // Reset to first page after search
    renderEmpresasRRHHList(); // Render the filtered/paginated data
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
    if (section === 'planes' || section === 'medidas' || section === 'servicentros' || section === 'sobre-500-uf' || section === 'guardias-propios') {
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
            endDateObj.setFullYear(endDateObj.getFullYear() + 2); // Estudios are 2 years
            formData.fechaFin = endDateObj.toISOString().split('T')[0];
            formData.fechaVigencia = endDateObj.toISOString().split('T')[0]; // Map to new key
            
            const today = new Date();
            formData.estadoVigencia = endDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de inicio es requerida para un estudio.', 'error');
            return;
        }
    } else if (section === 'directivas') {
        // Directivas added via form will be stored in database.directivas
        const fechaEmision = formData.fecha;
        if (fechaEmision) {
            const emissionDateObj = new Date(fechaEmision);
            const vigenciaDateObj = new Date(emissionDateObj);
            vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // Directivas are 3 years
            formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de emisión es requerida para una directiva.', 'error');
            return;
        }
        targetArray = database.directivas; // Ensure form-added directivas go to separate array
    } else if (section === 'empresas-rrhh') {
        // This section is for Excel-loaded directivas, not form-added ones for now.
        // If the form is to add a record to 'empresas-rrhh' (Excel sheet data), its logic needs to be updated.
        // For now, form submissions to 'directivas' go to `database.directivas`.
        showAlert(section, 'No se permite añadir registros directamente a esta sección desde el formulario. Use la sección "Directivas" general.', 'error');
        return;
    }


    targetArray.push(formData);

    form.reset();

    showAlert(section, 'Registro guardado exitosamente', 'success');

    updateCounts();

    // After adding, show the list view, and for directivas, update the paginated list
    if (section === 'medidas') {
        showTab('medidas', 'consultar');
    } else if (section === 'directivas') {
        // After adding a new directiva from the form, it goes to `database.directivas`
        // The main list (`empresas-rrhh` section) should not be affected by `database.directivas` as they are separate.
        showTab('directivas', 'consultar'); // Go back to the main directivas overview
    }
    else {
        showTab(section, 'consultar');
    }
}

// Carga y muestra los datos de una sección en formato de tabla
function loadData(section) {
    console.log(`🔄 Cargando datos para sección: ${section}`);

    let resultsContainerId = `${section}-results`;
    const resultsContainer = document.getElementById(resultsContainerId);

    if (!resultsContainer) {
        console.error(`❌ No se encontró el contenedor: ${resultsContainerId}`);

        // Intentar encontrar contenedores alternativos
        const alternativeContainers = document.querySelectorAll(`[id*="${section}"]`);
        console.log('🔍 Contenedores alternativos encontrados:', alternativeContainers.length);
        alternativeContainers.forEach((container, index) => {
            console.log(`  ${index + 1}. ${container.id}`);
        });

        return;
    }

    console.log(`✅ Contenedor encontrado: ${resultsContainerId}`);

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

    console.log(`✅ Creando tabla para ${section} con ${data.length} registros`);
    console.log(`📋 Primer registro de ejemplo:`, data[0]);

    const table = createTable(section, data);

    if (!table || table.trim() === '') {
        console.error(`❌ Error: La tabla generada está vacía para ${section}`);
        resultsContainer.innerHTML = '<div class="no-data">Error generando la tabla</div>';
        return;
    }

    console.log(`📝 Tabla generada (primeros 200 caracteres):`, table.substring(0, 200) + '...');

    resultsContainer.innerHTML = table;

    // Verificar que la tabla se insertó correctamente
    const tableElement = resultsContainer.querySelector('table');
    if (tableElement) {
        const rows = tableElement.querySelectorAll('tbody tr');
        console.log(`✅ Tabla insertada correctamente con ${rows.length} filas de datos`);
    } else {
        console.error(`❌ Error: No se pudo insertar la tabla en ${resultsContainerId}`);
    }
}

// Crea una tabla HTML a partir de un array de objetos
function createTable(section, data) {
    console.log(`🏗️ Creando tabla para sección: ${section} con ${data.length} registros`);

    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`⚠️ No hay datos válidos para crear tabla de ${section}`);
        return '<div class="no-data">No se encontraron resultados</div>';
    }

    let headers = [];
    if (section === 'estudios') {
        headers = [
            'codigo', // NRO
            'tipo', // ENTIDAD
            'rut', // RUT ENTIDAD
            'direccion', // UBICACIÓN (CASA MATRIZ)
            'representanteLegal', // REPRESENTANTE LEGAL ENTIDAD
            'telefono', // TELEFONO
            'correoElectronico', // CORREO ELECTRONICO
            'responsable', // IDENTIFICACION JEFE DE SEGURIDAD
            'decretoNro', // DECRETO N°
            'estadoTramitacion', // ESTADO DE TRAMITACIÓN
            'resolucionAprobacionEst', // RESOLUCION APROB. EST.
            'fechaVigencia' // FECHA VIGENCIA
        ];
    } else if (section === 'planes') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna'];
    } else if (section === 'medidas') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna'];
    } else if (section === 'servicentros') {
        headers = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        headers = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto'];
    } else if (section === 'empresas-rrhh') { // This is for the directivas section displaying all directivas
        headers = ['numero', 'empresa', 'rut', 'lugarInstalacion', 'entidadMandante', 'rutEntidadMandante', 'representanteLegal', 'telefono', 'correo', 'resolucionAprobacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia'];
    } else if (section === 'guardias-propios') {
        headers = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna'];
    } else if (section === 'eventos-masivos') {
        headers = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna'];
    } else if (section === 'directivas') { // This is for form-added directivas, currently empty unless user adds.
        headers = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'version', 'titulo']; // Displaying less columns for manually added directivas
    } else {
        console.warn(`⚠️ Sección desconocida: ${section}, usando headers del primer objeto`);
        headers = Object.keys(data[0] || {});
    }

    console.log(`📋 Headers para ${section}:`, headers);

    let tableHTML = '<table class="data-table';
    if (section === 'eventos-masivos') {
        tableHTML += ' truncate-text eventos-masivos-table';
    }
    tableHTML += '"><thead><tr>';

    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    let validRows = 0;
    data.forEach((row, index) => {
        if (!row || typeof row !== 'object') {
            console.warn(`⚠️ Fila inválida en índice ${index}:`, row);
            return;
        }

        const originalIndex = database[section].indexOf(row);
        const detailIndex = originalIndex !== -1 ? originalIndex : index; // Use original index for showDetails

        tableHTML += `<tr onclick="showDetails('${section}', ${detailIndex})">`;

        headers.forEach(header => {
            let value = row[header];
            let cellClass = '';

            // Manejar valores undefined/null
            if (value === undefined || value === null) {
                value = 'N/A'; // Changed from '-' to 'N/A' as per user request implicit in column list
            } else if (typeof value === 'string' && value.trim() === '') {
                value = 'N/A'; // Changed from '-' to 'N/A'
            }

            // Formatear fechas
            if (dateHeaders.includes(header) && value !== 'N/A') {
                value = formatDateForDisplay(value);
            }

            // Aplicar estilos de marca para servicentros
            if (section === 'servicentros' && header === 'nombreServicentro') {
                const lowerCaseName = value.toLowerCase();
                if (lowerCaseName.includes('copec')) {
                    cellClass = 'brand-copec';
                } else if (lowerCaseName.includes('petrobras') || lowerCaseName.includes('aramco')) {
                    cellClass = 'brand-petrobras'; // Usamos la misma clase para Petrobras y Aramco
                } else if (lowerCaseName.includes('shell')) {
                    cellClass = 'brand-shell';
                } else if (lowerCaseName.includes('apm') || lowerCaseName.includes('autogasco') ||
                           lowerCaseName.includes('lincosur') || lowerCaseName.includes('aronex') ||
                           lowerCaseName.includes('ypf')) {
                    cellClass = 'brand-red-bg'; // Fondo rojo para estas marcas
                } else {
                    // Para cualquier otra marca no especificada
                    cellClass = 'brand-other'; // Letras rojas, negrita
                }
            } else if (header === 'estadoVigencia' || header === 'estadoAprobacion' || header === 'estadoTramitacion') { // Added estadoTramitacion
                if (value === 'Vigente' || value === 'APROBADO' || value === 'FINALIZADO') {
                    cellClass = 'status-vigente'; // Green for positive states
                } else if (value === 'Vencido' || value === 'RECHAZADO' || value === 'EN REVISION' || value === 'PENDIENTE') {
                    cellClass = 'status-vencido'; // Red/grey for negative/pending states
                }
            }

            // Escapar HTML para seguridad
            if (typeof value === 'string') {
                value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            tableHTML += `<td class="${cellClass}">${value}</td>`;
        });
        tableHTML += '</tr>';
        validRows++;
    });

    tableHTML += '</tbody></table>';

    console.log(`✅ Tabla creada con ${validRows} filas válidas de ${data.length} registros`);

    return tableHTML;
}

// Formatea los nombres de las claves para la interfaz
function formatHeader(header) {
    const headerMap = {
        codigo: 'NRO', // Cambiado a NRO
        categoria: 'Entidad',
        prioridad: 'Prioridad',
        estado: 'Estado',
        descripcion: 'Descripción',
        responsable: 'IDENTIFICACION JEFE DE SEGURIDAD', // Updated for Estudios
        tipo: 'ENTIDAD', // Updated for Estudios
        vigencia: 'Fecha de Vigencia',
        revision: 'Dirección',
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        numero: 'NRO', // For directivas
        area: 'Área',
        version: 'Versión',
        fecha: 'Fecha de Emisión',
        titulo: 'Título',
        contenido: 'Contenido',
        fechaInicio: 'Fecha de Aprobación', // For estudios
        fechaFin: 'FECHA VIGENCIA', // For estudios
        objeto: 'Objeto',
        metodologia: 'Metodología',
        nombre: 'Nombre',
        ubicacion: 'UBICACIÓN (CASA MATRIZ)', // Updated for Estudios
        direccion: 'UBICACIÓN (CASA MATRIZ)', // Adjusted to map for both
        telefono: 'TELEFONO', // Updated for Estudios
        horario: 'Horario',
        capacidad: 'Capacidad',
        empresa: 'EMPRESA RR.HH.', // For directivas
        tipoDirectiva: 'Tipo Directiva', // Nuevo campo para tipo de directiva
        tipoServicio: 'Tipo Servicio',
        numeroGuardias: 'Número Guardias',
        turno: 'Turno',
        tipoEvento: 'Tipo de Evento',
        nombreEvento: 'Nombre del Evento',
        duracion: 'Duración',
        lugarInstalacion: 'NOMBRE INSTALACIÓN',
        fechaAprobacion: 'Fecha Aprob.',
        cantidadGuardias: 'Cantidad de Guardias',
        nombreEmpresa: 'Nombre Empresa',
        rut: 'RUT ENTIDAD', // For estudios
        fechaEvento: 'Fecha Evento',
        estadoAprobacion: 'Estado de Aprobación',
        id: 'NRO', // For sobre-500-uf
        monto: 'Monto (UF)',
        estadoVigencia: 'Estado de Vigencia', // General status (Vigente/Vencido)
        comuna: 'Comuna',
        // Campos específicos de Servicentros
        nombreServicentro: 'Nombre Servicentro',
        propietario: 'Propietario/Concesionario',
        maximoDinero: 'Máximo de Dinero',
        // Campos específicos de Sobre 500 UF
        entidad: 'Entidad', // For sobre-500-uf
        instalacion: 'Instalación', // For sobre-500-uf
        encargado: 'Encargado',
        // Nuevos campos para Directivas de Funcionamiento (from Excel)
        entidadMandante: 'ENTIDAD MANDANTE (CONTRATANTE)',
        rutEntidadMandante: 'RUT ENTIDAD MANDANTE (CONTRATANTE)',
        representanteLegal: 'REPRESENTANTE LEGAL ENTIDAD', // Updated for directivas as well
        correo: 'CORREO ELECTRONICO', // For directivas
        resolucionAprobacion: 'RESOLUCION APROB. DD.FF.', // For directivas
        // Specifically for Estudios, if they are separate from general 'telefono' etc.
        correoElectronico: 'CORREO ELECTRONICO', // For Estudios
        decretoNro: 'DECRETO N°', // For Estudios
        estadoTramitacion: 'ESTADO DE TRAMITACIÓN', // For Estudios
        resolucionAprobacionEst: 'RESOLUCION APROB. EST.', // For Estudios
        fechaVigencia: 'FECHA VIGENCIA' // Specific for Estudios
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
}

// Busca datos dentro de una sección
function searchData(section, searchTerm) {
    const data = database[section];
    const filteredData = data.filter(item => {
        return Object.values(item).some(value =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

    modalTitle.textContent = `Detalles - NRO: ${item.numero || item.id || item.codigo || 'N/A'}`; // Added item.codigo for consistency
    modalTitle.className = `modal-title ${section}`;

    let detailKeys = [];
    if (section === 'estudios') {
        detailKeys = ['codigo', 'tipo', 'rut', 'direccion', 'representanteLegal', 'telefono', 'correoElectronico', 'responsable', 'decretoNro', 'estadoTramitacion', 'resolucionAprobacionEst', 'fechaVigencia', 'objeto', 'metodologia', 'comuna'];
    } else if (section === 'planes') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna', 'objetivo', 'alcance'];
    } else if (section === 'medidas') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna'];
    } else if (section === 'servicentros') {
        detailKeys = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        detailKeys = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto', 'encargado', 'telefono', 'correo', 'resolucion'];
    } else if (section === 'empresas-rrhh') { // Details for directivas (from Excel)
        detailKeys = ['numero', 'empresa', 'rut', 'tipoDirectiva', 'lugarInstalacion', 'entidadMandante', 'rutEntidadMandante', 'representanteLegal', 'telefono', 'correo', 'resolucionAprobacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'estado', 'comuna', 'alcance'];
    } else if (section === 'guardias-propios') {
        detailKeys = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna'];
    } else if (section === 'eventos-masivos') {
        detailKeys = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna'];
    } else if (section === 'directivas') { // Details for form-added directivas
        detailKeys = ['numero', 'area', 'version', 'fecha', 'titulo', 'contenido', 'vigencia', 'estadoVigencia'];
    }

    let detailsHTML = ''; // Clear detailsHTML for dynamic content

    detailKeys.forEach(key => {
        let value = item[key] || 'N/A'; // Changed from 'No especificado' to 'N/A'
        if (dateHeaders.includes(key)) {
            value = formatDateForDisplay(value);
        }

        let detailClass = '';
        if (key === 'estadoVigencia' || key === 'estadoAprobacion' || key === 'estadoTramitacion') { // Added estadoTramitacion
            if (value === 'Vigente' || value === 'APROBADO' || value === 'FINALIZADO') {
                detailClass = 'status-vigente';
            } else if (value === 'Vencido' || value === 'RECHAZADO' || value === 'EN REVISION' || value === 'PENDIENTE') {
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

// Actualiza los contadores - CORREGIDA PARA EVITAR ERRORES
function updateCounts() {
    // Verificar que database existe y tiene las propiedades necesarias
    if (!database || typeof database !== 'object') {
        console.warn('⚠️ Base de datos no inicializada para updateCounts');
        return;
    }

    // Verificar cada sección individualmente y usar valores seguros
    const estudiosCount = (database.estudios && Array.isArray(database.estudios)) ? database.estudios.length : 0;
    const planesCount = (database.planes && Array.isArray(database.planes)) ? database.planes.length : 0;
    const servicentrosCount = (database.servicentros && Array.isArray(database.servicentros)) ? database.servicentros.length : 0;
    const sobre500Count = (database['sobre-500-uf'] && Array.isArray(database['sobre-500-uf'])) ? database['sobre-500-uf'].length : 0;
    const medidasTotalCount = servicentrosCount + sobre500Count; // Total de medidas = servicentros + sobre 500 UF
    const empresasRRHHCount = (database['empresas-rrhh'] && Array.isArray(database['empresas-rrhh'])) ? database['empresas-rrhh'].length : 0; // Excel loaded directivas
    const guardiasPropiosCount = (database['guardias-propios'] && Array.isArray(database['guardias-propios'])) ? database['guardias-propios'].length : 0;
    const eventosMasivosCount = (database['eventos-masivos'] && Array.isArray(database['eventos-masivos'])) ? database['eventos-masivos'].length : 0;
    const formAddedDirectivasCount = (database.directivas && Array.isArray(database.directivas)) ? database.directivas.length : 0; // Manually added directivas

    // Sum of all directivas from Excel sheets (empresas-rrhh, guardias-propios, eventos-masivos) plus manually added
    const totalDirectivasSectionCount = empresasRRHHCount + guardiasPropiosCount + eventosMasivosCount + formAddedDirectivasCount;


    // Actualizar los elementos del DOM de forma segura
    const estudiosElement = document.getElementById('estudios-count');
    const planesElement = document.getElementById('planes-count');
    const medidasElement = document.getElementById('medidas-count');
    const directivasElement = document.getElementById('directivas-count');
    const empresasRRHHDisplayElement = document.getElementById('empresas-rrhh-count-display'); // For the box count


    if (estudiosElement) estudiosElement.textContent = `${estudiosCount} registros`;
    if (planesElement) planesElement.textContent = `${planesCount} registros`;
    if (medidasElement) medidasElement.textContent = `${medidasTotalCount} registros`;
    if (directivasElement) directivasElement.textContent = `${totalDirectivasSectionCount} registros`; // Total for Directivas menu card
    if (empresasRRHHDisplayElement) empresasRRHHDisplayElement.textContent = `(${empresasRRHHCount} registros)`; // Count for the directivas box

    updateMedidasSubSectionCounts();
}

// Función para actualizar los contadores en los cuadros de "Medidas de Seguridad"
function updateMedidasSubSectionCounts() {
    // Usar directamente los datos de las bases de datos específicas
    const servicentrosCount = (database.servicentros && Array.isArray(database.servicentros)) ? database.servicentros.length : 0;
    const sobre500Count = (database['sobre-500-uf'] && Array.isArray(database['sobre-500-uf'])) ? database['sobre-500-uf'].length : 0;

    // Actualizar contadores en la UI
    const servicentrosCountElement = document.getElementById('servicentros-count-display');
    const sobre500UFCountElement = document.getElementById('sobre-500-uf-count-display');

    if (servicentrosCountElement) {
        servicentrosCountElement.textContent = `(${servicentrosCount} registros)`;
        console.log(`📊 Contador Servicentros actualizado: ${servicentrosCount}`);
    }
    if (sobre500UFCountElement) {
        sobre500UFCountElement.textContent = `(${sobre500Count} registros)`;
        console.log(`📊 Contador Sobre 500 UF actualizado: ${sobre500Count}`);
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

// Función para verificar la integridad de la interfaz
function verificarInterfaz() {
    console.log('🔍 Verificando integridad de la interfaz...');

    // Verificar elementos principales de medidas
    const medidasSection = document.getElementById('medidas');
    const medidasConsultar = document.getElementById('medidas-consultar');
    const servicentrosPage = document.getElementById('servicentros-page');
    const sobre500Page = document.getElementById('sobre-500-uf-page');
    const servicentrosResults = document.getElementById('servicentros-results');
    const sobre500Results = document.getElementById('sobre-500-uf-results');

    console.log('📋 Estado de elementos HTML:');
    console.log('- medidas section:', medidasSection ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('- medidas-consultar:', medidasConsultar ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('- servicentros-page:', servicentrosPage ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('- sobre-500-uf-page:', sobre500Page ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('- servicentros-results:', servicentrosResults ? '✅ EXISTE' : '❌ NO EXISTE');
    console.log('- sobre-500-uf-results:', sobre500Results ? '✅ EXISTE' : '❌ NO EXISTE');

    // Verificar datos
    console.log('📊 Estado de datos:');
    console.log('- database.servicentros:', database.servicentros ? `✅ ${database.servicentros.length} registros` : '❌ NO EXISTE');
    console.log('- database["sobre-500-uf"]:', database['sobre-500-uf'] ? `✅ ${database['sobre-500-uf'].length} registros` : '❌ NO EXISTE');
    console.log('- database["empresas-rrhh"] (Directivas):', database['empresas-rrhh'] ? `✅ ${database['empresas-rrhh'].length} registros` : '❌ NO EXISTE');


    // Verificar contadores
    const servicentrosCountDisplay = document.getElementById('servicentros-count-display');
    const sobre500CountDisplay = document.getElementById('sobre-500-uf-count-display');
    const empresasRRHHCountDisplay = document.getElementById('empresas-rrhh-count-display'); // For the Directivas box

    console.log('🔢 Estado de contadores:');
    console.log('- servicentros-count-display:', servicentrosCountDisplay ? `✅ "${servicentrosCountDisplay.textContent}"` : '❌ NO EXISTE');
    console.log('- sobre-500-uf-count-display:', sobre500CountDisplay ? `✅ "${sobre500CountDisplay.textContent}"` : '❌ NO EXISTE');
    console.log('- empresas-rrhh-count-display (Directivas Box):', empresasRRHHCountDisplay ? `✅ "${empresasRRHHCountDisplay.textContent}"` : '❌ NO EXISTE');


    // Verificar que los elementos críticos existan
    const elementosFaltantes = [];
    if (!medidasSection) elementosFaltantes.push('medidas section');
    if (!servicentrosPage) elementosFaltantes.push('servicentros-page');
    if (!sobre500Page) elementosFaltantes.push('sobre-500-uf-page');
    if (!servicentrosResults) elementosFaltantes.push('servicentros-results');
    if (!sobre500Results) elementosFaltantes.push('sobre-500-uf-results');
    // Check directivas pagination elements
    if (!document.getElementById('directivas-page-info')) elementosFaltantes.push('directivas-page-info');
    if (!document.getElementById('directivas-prev-btn')) elementosFaltantes.push('directivas-prev-btn');
    if (!document.getElementById('directivas-next-btn')) elementosFaltantes.push('directivas-next-btn');


    if (elementosFaltantes.length > 0) {
        console.error('❌ ELEMENTOS CRÍTICOS FALTANTES:', elementosFaltantes);
        alert(`Error: Elementos HTML faltantes: ${elementosFaltantes.join(', ')}`);
        return false;
    }

    console.log('✅ Verificación de interfaz completada - Todo OK');
    return true;
}
