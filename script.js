// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = [];
let currentDirectivasSubSectionType = ''; 
let currentEmpresaSelected = ''; 
let database = {}; // Se llenará con datos del Excel o ejemplos

// Función para cargar datos desde el Excel (versión corregida para navegadores normales)
async function loadDataFromExcel(file = null) {
    try {
        let arrayBuffer;
        
        if (file) {
            // Si se proporciona un archivo, leerlo
            arrayBuffer = await file.arrayBuffer();
        } else {
            // Intentar cargar archivo automáticamente solo si window.fs está disponible
            if (typeof window.fs !== 'undefined' && typeof window.fs.readFile === 'function') {
                try {
                    const response = await window.fs.readFile('BASE DE DATOS.xlsx');
                    arrayBuffer = response.buffer;
                } catch (fsError) {
                    console.log('📁 No se pudo cargar automáticamente desde window.fs:', fsError.message);
                    throw new Error('Archivo no encontrado automáticamente');
                }
            } else {
                // Si window.fs no está disponible, usar datos de ejemplo directamente
                console.log('📁 window.fs no disponible, usando datos de ejemplo');
                throw new Error('window.fs no disponible - usando datos de ejemplo');
            }
        }

        const workbook = XLSX.read(arrayBuffer, {
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
        
        // Cargar MEDIDAS SOBRE 500 UF
        await loadMedidasSobre500UF(workbook);
        
        // Cargar MEDIDAS SERVICENTROS
        await loadMedidasServicentros(workbook);
        
        // Cargar DIRECTIVAS DE FUNCIONAMIENTOS (como empresas-rrhh)
        await loadDirectivas(workbook);
        
        // Cargar EMPRESAS RECURSOS HUMANOS (como lista de empresas)
        await loadEmpresasRRHH(workbook);

        console.log('✅ Datos cargados exitosamente desde Excel:', {
            estudios: database.estudios.length,
            planes: database.planes.length,
            servicentros: database.servicentros.length,
            'sobre-500-uf': database['sobre-500-uf'].length,
            directivas: database['empresas-rrhh'].length,
            empresas: empresasRRHHList.length
        });

        // Actualizar UI para mostrar éxito
        showExcelLoadSuccess();

    } catch (error) {
        console.log('📝 Cargando datos de ejemplo debido a:', error.message);
        // Si hay error, generar datos de ejemplo como fallback
        generateSampleData();
        showExcelLoadError();
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
function showExcelLoadError() {
    // Buscar y actualizar el mensaje de estado en el home
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const statusDiv = homeSection.querySelector('.header > div');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <p style="margin: 0; color: #8b4513; font-weight: bold;">
                    📝 Usando datos de ejemplo
                </p>
                <p style="margin: 5px 0 0 0; color: #8b4513; font-size: 0.9em;">
                    ${database.estudios.length} estudios, ${database.planes.length} planes, ${database.servicentros.length} servicentros, ${database['sobre-500-uf'].length} medidas +500UF de ejemplo.
                    <br><button onclick="showFileSelector()" style="background: #27ae60; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;">📁 Cargar Excel Real</button>
                </p>
            `;
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.borderColor = '#ffc107';
        }
    }
}

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
                        loadData(activeSection.id);
                    }
                }
            } catch (loadError) {
                console.error('Error cargando archivo:', loadError);
                alert('Error al cargar el archivo Excel. Verifique que sea el archivo correcto.');
                showExcelLoadError();
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
    const worksheet = workbook.Sheets['MEDIDAS SOBRE 500 UF '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "MEDIDAS SOBRE 500 UF " no encontrada');
        return;
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Los datos empiezan en la fila 4 (índice 3)
    for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[1]) continue; // NRO está en índice 1
        
        const fechaVigencia = parseFecha(row[11]); // FECHA DE VIGENCIA MEDIDAS DE SEGURIDAD
        const fechaAprobacion = new Date(fechaVigencia);
        fechaAprobacion.setFullYear(fechaAprobacion.getFullYear() - 3);
        
        database['sobre-500-uf'].push({
            id: `S500-${String(row[1]).padStart(3, '0')}`, // NRO
            entidad: row[2] || 'Entidad no especificada', // ENTIDAD
            rut: row[3] || '', // RUT ENTIDAD
            instalacion: row[4] || '', // INSTALACIÓN
            ubicacion: row[5] || '', // UBICACIÓN INSTALACIÓN
            encargado: row[7] || 'No especificado', // IDENTIFICACION ENCARGADO
            telefono: row[8] || '', // TELEFONO
            correo: row[9] || '', // CORREO ELECTRONICO
            resolucion: row[10] || '', // RESOLUCION APROB. MEDIDAS DE SEGURIDAD
            fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
            vigencia: fechaVigencia.toISOString().split('T')[0],
            estadoTramitacion: row[12] || 'VIGENTE', // ESTADO DE TRAMITACIÓN
            estadoVigencia: fechaVigencia > new Date() ? 'Vigente' : 'Vencido',
            tipo: row[2] || 'Entidad Comercial',
            direccion: row[5] || '',
            comuna: extraerComuna(row[5] || ''),
            monto: `${500 + Math.floor(Math.random() * 1000)} UF` // Simular monto sobre 500 UF
        });
    }
}

// Función para cargar medidas SERVICENTROS desde el Excel
async function loadMedidasServicentros(workbook) {
    const worksheet = workbook.Sheets['MEDIDAS SERVICENTRO'];
    if (!worksheet) {
        console.warn('⚠️ Hoja "MEDIDAS SERVICENTRO" no encontrada');
        return;
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    // Los datos empiezan en la fila 3 (índice 2)
    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue; // NRO está en índice 0
        
        const fechaAprobacion = parseFecha(row[7]); // FECHA DE APROBACIÓN
        const vigencia = new Date(fechaAprobacion);
        vigencia.setFullYear(vigencia.getFullYear() + 3);
        
        database.servicentros.push({
            codigo: `SER-${String(row[0]).padStart(3, '0')}`, // NRO
            nombreServicentro: row[1] || 'Servicentro', // NOMBRE SERVICENTRO
            propietario: row[2] || 'Propietario no especificado', // PROPIETARIO O CONCESIONARIO
            rut: row[3] || '', // RUT
            ubicacion: row[4] || '', // UBICACION
            comuna: row[5] || extraerComuna(row[4] || ''), // COMUNA
            maximoDinero: row[6] || 'No especificado', // MAXIMO DE DINERO
            fechaAprobacion: fechaAprobacion.toISOString().split('T')[0],
            vigencia: vigencia.toISOString().split('T')[0],
            estadoVigencia: vigencia > new Date() ? 'Vigente' : 'Vencido',
            tipo: row[1] || 'Servicentro',
            direccion: row[4] || '',
            estado: 'Implementada'
        });
    }
}

// Función para cargar directivas desde el Excel
async function loadDirectivas(workbook) {
    const worksheet = workbook.Sheets['DIRECTIVAS DE FUNCIONAMIENTOS '];
    if (!worksheet) {
        console.warn('⚠️ Hoja "DIRECTIVAS DE FUNCIONAMIENTOS " no encontrada');
        return;
    }
    
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

// Función para generar datos de ejemplo (fallback si no se puede cargar Excel) - CORREGIDA
function generateSampleData() {
    console.log('🔄 Generando datos de ejemplo...');
    
    // IMPORTANTE: Asignar directamente a la variable global database
    database = {
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

    // Crear lista de empresas únicas de RRHH (30 empresas para ejemplo)
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
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)]
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
    for (let i = 1; i <= 10; i++) {
        const fechaAprobacion = `2024-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3);
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database.servicentros.push({
            codigo: `SER-${String(i).padStart(3, '0')}`,
            nombreServicentro: `Servicentro ${i}`,
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

    // Generar 20 directivas de empresas RRHH
    const tiposDirectiva = ['Contratación', 'Capacitación', 'Evaluación', 'Bienestar'];
    
    for (let i = 1; i <= 20; i++) {
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
            numero: `RRHH-${String(i).padStart(4, '0')}`,
            empresa: empresaAsignada.nombre,
            rut: empresaAsignada.rut,
            tipoDirectiva: tiposDirectiva[Math.floor(Math.random() * tiposDirectiva.length)],
            direccion: empresaAsignada.direccion,
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)]
        });
        
        empresaAsignada.directivasCount++;
    }

    console.log('✅ Datos de ejemplo generados:', {
        estudios: database.estudios.length,
        planes: database.planes.length,
        servicentros: database.servicentros.length,
        'sobre-500-uf': database['sobre-500-uf'].length,
        directivas: database['empresas-rrhh'].length,
        empresas: empresasRRHHList.length
    });
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
            updateMedidasSubSectionCounts(); // Actualizar contadores al mostrar la vista principal
            console.log(`📊 Medidas principales mostradas, total: ${database.medidas ? database.medidas.length : 0}`);
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
    document.querySelectorAll('#medidas .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (subSectionType === 'servicentros') {
        document.getElementById('servicentros-page').classList.add('active');
        console.log(`📋 Servicentros cargados: ${database.servicentros.length} registros`);
        loadData('servicentros');
        
    } else if (subSectionType === 'sobre-500-uf') {
        document.getElementById('sobre-500-uf-page').classList.add('active');
        console.log(`💰 Medidas Sobre 500 UF cargadas: ${database['sobre-500-uf'].length} registros`);
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
        (directiva.lugarInstalacion && directiva.lugarInstalacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.direccion && directiva.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.fechaAprobacion && directiva.fechaAprobacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.numero && directiva.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.tipoDirectiva && directiva.tipoDirectiva.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        headers = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        headers = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto'];
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
        comuna: 'Comuna',
        // Campos específicos de Servicentros
        nombreServicentro: 'Nombre Servicentro',
        propietario: 'Propietario/Concesionario',
        maximoDinero: 'Máximo de Dinero',
        ubicacion: 'Ubicación',
        // Campos específicos de Sobre 500 UF
        entidad: 'Entidad',
        instalacion: 'Instalación',
        encargado: 'Encargado'
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
        detailKeys = ['codigo', 'nombreServicentro', 'propietario', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'maximoDinero'];
    } else if (section === 'sobre-500-uf') {
        detailKeys = ['id', 'entidad', 'instalacion', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'rut', 'ubicacion', 'comuna', 'monto'];
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
    const empresasRRHHCount = (database['empresas-rrhh'] && Array.isArray(database['empresas-rrhh'])) ? database['empresas-rrhh'].length : 0;
    const guardiasPropiosCount = (database['guardias-propios'] && Array.isArray(database['guardias-propios'])) ? database['guardias-propios'].length : 0;
    const eventosMasivosCount = (database['eventos-masivos'] && Array.isArray(database['eventos-masivos'])) ? database['eventos-masivos'].length : 0;
    
    // Actualizar los elementos del DOM de forma segura
    const estudiosElement = document.getElementById('estudios-count');
    const planesElement = document.getElementById('planes-count');
    const medidasElement = document.getElementById('medidas-count');
    const directivasElement = document.getElementById('directivas-count');
    
    if (estudiosElement) estudiosElement.textContent = `${estudiosCount} registros`;
    if (planesElement) planesElement.textContent = `${planesCount} registros`;
    if (medidasElement) medidasElement.textContent = `${medidasTotalCount} registros`;
    
    const totalDirectivas = empresasRRHHCount + guardiasPropiosCount + eventosMasivosCount;
    if (directivasElement) directivasElement.textContent = `${totalDirectivas} registros`;

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

// Inicializa la aplicación - CORREGIDA
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando sistema...');
    
    // Intentar cargar datos desde Excel automáticamente
    await loadDataFromExcel();
    
    // Actualizar contadores de forma segura
    updateCounts();
    
    console.log('✅ Sistema iniciado correctamente:', {
        'Estudios de Seguridad': database.estudios ? database.estudios.length : 0,
        'Planes de Seguridad': database.planes ? database.planes.length : 0, 
        'Servicentros': database.servicentros ? database.servicentros.length : 0,
        'Medidas Sobre 500 UF': database['sobre-500-uf'] ? database['sobre-500-uf'].length : 0,
        'Empresas RRHH': empresasRRHHList ? empresasRRHHList.length : 0,
        'Directivas totales': database['empresas-rrhh'] ? database['empresas-rrhh'].length : 0
    });
});
