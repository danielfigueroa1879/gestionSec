// Variables globales para la navegación jerárquica de directivas
let empresasRRHHList = [];
let currentDirectivasSubSectionType = ''; // Nueva variable para rastrear la subsección activa de directivas
let currentEmpresaSelected = ''; // Variable para almacenar la empresa seleccionada en detalles de RRHH

// Función para generar datos de ejemplo
function generateSampleData() {
    const database = {
        estudios: [],
        planes: [],
        medidas: [], // Medidas generales, separadas de servicentros y sobre-500-uf
        servicentros: [],
        'sobre-500-uf': [], // Nuevo array para registros "Sobre 500 UF"
        directivas: [], 
        'empresas-rrhh': [], 
        'guardias-propios': [],
        'eventos-masivos': [],
        'directivas-generales': []
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
        const direccion = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)]; // Asignar una dirección aleatoria

        empresasRRHHList.push({
            id: i,
            nombre: empresaName,
            rut: rut,
            direccion: direccion, // Añadida la dirección a la empresa
            directivasCount: 0
        });
    }

    // Generar 5 estudios de seguridad (Vigencia de 2 años)
    const tiposEstudio = ['Análisis de Riesgos', 'Evaluación de Vulnerabilidades', 'Auditoría de Seguridad', 'Impacto Ambiental'];
    const responsables = ['Dr. Carlos López', 'Ing. María González', 'Dr. Juan Pérez', 'Lic. Ana Torres', 'Ing. Pedro Sánchez'];
    
    for (let i = 1; i <= 5; i++) {
        const startDate = `2025-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDateObj);
        endDateObj.setFullYear(endDateObj.getFullYear() + 2); // 2 años de vigencia
        const fechaFin = endDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = endDateObj > today ? 'Vigente' : 'Vencido';

        database.estudios.push({
            codigo: `EST-${String(i).padStart(3, '0')}`,
            tipo: tiposEstudio[Math.floor(Math.random() * tiposEstudio.length)],
            fechaInicio: startDate,
            fechaFin: fechaFin,
            objeto: `Evaluación de seguridad en área ${i}`,
            metodologia: `Metodología basada en estándares internacionales ISO 27001 y análisis cuantitativo de riesgos`,
            responsable: responsables[i - 1],
            estadoVigencia: estadoVigencia // Nuevo campo para el estado de vigencia
        });
    }

    // Generar 61 planes de seguridad (Vigencia de 3 años)
    const tiposPlanes = ['Emergencia', 'Contingencia', 'Evacuación', 'Recuperación'];
    const areas = ['Edificio Principal', 'Planta de Producción', 'Laboratorio', 'Almacén', 'Oficinas Administrativas'];
    
    for (let i = 1; i <= 61; i++) {
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022, 2023, 2024, 2025 for diverse validity
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database.planes.push({
            codigo: `PLN-${String(i).padStart(3, '0')}`,
            tipo: tiposPlanes[Math.floor(Math.random() * tiposPlanes.length)], // This will be renamed to 'entidad'
            fechaAprobacion: fechaAprobacion, 
            vigencia: vigencia, 
            revision: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Now stores an address for 'Dirección'
            objetivo: `Establecer procedimientos de seguridad para ${areas[Math.floor(Math.random() * areas.length)]}`,
            alcance: `Aplicable a todo el personal de ${areas[Math.floor(Math.random() * areas.length)]}`,
            estadoVigencia: estadoVigencia,
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // New field
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}` // Added RUT
        });
    }

    // Generar 90 medidas de seguridad (generales) (Vigencia de 3 años)
    const categorias = ['Preventiva', 'Correctiva', 'Detectiva', 'Compensatoria'];
    const prioridades = ['Alta', 'Media', 'Baja'];
    const estados = ['Implementada', 'En proceso', 'Pendiente', 'Suspendida'];
    const responsablesMedidas = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Torres', 'Pedro Sánchez', 'Luis Martín', 'Carmen Ruiz'];
    
    for (let i = 1; i <= 90; i++) {
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database.medidas.push({
            codigo: `MED-${String(i).padStart(3, '0')}`,
            categoria: categorias[Math.floor(Math.random() * categorias.length)], // This will be renamed to 'entidad'
            prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
            estado: estados[Math.floor(Math.random() * estados.length)], // This is the general status, not validity
            descripcion: `Medida de seguridad ${i}: Control y monitoreo de accesos, implementación de protocolos de seguridad`,
            responsable: responsablesMedidas[Math.floor(Math.random() * responsablesMedidas.length)],
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`, // Added RUT
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Added Direccion
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Alcance para Medida ${i} de ${categorias[Math.floor(Math.random() * categorias.length)]}` // Added Alcance
        });
    }

    // Generar 90 servicentros (Vigencia de 3 años)
    const tiposServicentros = ['Gasolinera', 'Taller Mecánico', 'Lavado de Autos', 'Cambio de Aceite', 'Revisión Técnica'];
    const ubicaciones = ['Norte', 'Sur', 'Centro', 'Este', 'Oeste'];
    const responsablesServicentros = ['Carlos Mendez', 'Laura Silva', 'Roberto Díaz', 'Patricia Morales', 'Fernando Castro'];
    
    for (let i = 1; i <= 90; i++) { // 90 registros para Servicentros
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database.servicentros.push({
            codigo: `SER-${String(i).padStart(3, '0')}`,
            nombre: `Servicentro ${i}`,
            tipo: tiposServicentros[Math.floor(Math.random() * tiposServicentros.length)], // This will be renamed to 'entidad'
            ubicacion: `Zona ${ubicaciones[Math.floor(Math.random() * ubicaciones.length)]}`,
            direccion: `Calle ${i}, Sector ${Math.floor(Math.random() * 20) + 1}`,
            telefono: `+56-9-${Math.floor(Math.random() * 90000000) + 10000000}`,
            horario: `${Math.floor(Math.random() * 12) + 6}:00 - ${Math.floor(Math.random() * 6) + 18}:00`,
            capacidad: `${Math.floor(Math.random() * 50) + 10} vehículos`,
            responsable: responsablesServicentros[Math.floor(Math.random() * responsablesServicentros.length)],
            estado: Math.random() > 0.2 ? 'Operativo' : 'Mantenimiento', // This is the general status, not validity
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`, // Added RUT
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Servicios de ${tiposServicentros[Math.floor(Math.random() * tiposServicentros.length)]}` // Added Alcance
        });
    }

    // Generar 95 registros de "Sobre 500 UF" (Vigencia de 3 años)
    const tiposGasto = ['Infraestructura', 'Tecnología', 'Personal Especializado', 'Consultoría Legal', 'Adquisición Equipos'];
    const responsablesUF = ['Gerente Financiero', 'Director de Operaciones', 'Jefe de Proyectos', 'Asesoría Externa'];

    for (let i = 1; i <= 95; i++) { // 95 registros para Sobre 500 UF
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['sobre-500-uf'].push({
            id: `UF-${String(i).padStart(3, '0')}`,
            descripcion: `Inversión en ${tiposGasto[Math.floor(Math.random() * tiposGasto.length)]} para el proyecto X${i}.`,
            monto: (Math.random() * 1000 + 500).toFixed(2), // Monto aleatorio entre 500 y 1500
            fecha: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            responsable: responsablesUF[Math.floor(Math.random() * responsablesUF.length)],
            estado: Math.random() > 0.3 ? 'Aprobado' : 'Pendiente', // This is the general status, not validity
            fechaAprobacion: fechaAprobacion,
            vigencia: vigencia,
            estadoVigencia: estadoVigencia,
            tipo: tiposGasto[Math.floor(Math.random() * tiposGasto.length)], // Added 'tipo' for Entidad mapping
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`, // Added RUT
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Added Direccion
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Alcance de Inversión para el Proyecto X${i}` // Added Alcance
        });
    }

    // Generar subcategorías de directivas de funcionamiento (Vigencia de 3 años)
    
    // 1. Generar 800 registros de Empresas de RRHH (distribuidos en 300 empresas)
    const tiposDirectivaRRHH = ['Contratación', 'Capacitación', 'Evaluación', 'Bienestar', 'Nómina', 'Beneficios'];
    const lugaresInstalacion = ['Oficinas Centrales', 'Sucursal Norte', 'Sucursal Sur', 'Planta Industrial', 'Centro Comercial'];
    
    for (let i = 1; i <= 800; i++) {
        const empresaAsignada = empresasRRHHList[Math.floor(Math.random() * empresasRRHHList.length)];
        
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['empresas-rrhh'].push({
            numero: `RRHH-${String(i).padStart(4, '0')}`,
            empresa: empresaAsignada.nombre,
            rut: empresaAsignada.rut,
            tipoDirectiva: tiposDirectivaRRHH[Math.floor(Math.random() * tiposDirectivaRRHH.length)], // This will be renamed to 'entidad'
            lugarInstalacion: lugaresInstalacion[Math.floor(Math.random() * lugaresInstalacion.length)],
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Now stores an address
            fechaAprobacion: fechaAprobacion,
            cantidadGuardias: `${Math.floor(Math.random() * 15) + 2} guardias`,
            area: 'Recursos Humanos',
            version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            titulo: `Directiva ${tiposDirectivaRRHH[Math.floor(Math.random() * tiposDirectivaRRHH.length)]} - ${empresaAsignada.nombre}`,
            contenido: `Procedimiento específico de recursos humanos para ${empresaAsignada.nombre}. Establece los lineamientos para la gestión del personal.`,
            responsable: `Jefe RRHH ${empresaAsignada.nombre}`,
            estado: Math.random() > 0.1 ? 'Vigente' : 'En revisión', // Estado general (no de vigencia)
            vigencia: vigencia, // Nueva fecha de vigencia
            estadoVigencia: estadoVigencia, // Estado de vigencia (Vigente/Vencido)
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Alcance para Directiva RRHH ${i}` // Added Alcance
        });
        
        // Incrementar contador de directivas para esta empresa
        empresaAsignada.directivasCount++;
    }

    // 2. Generar 50 registros de Empresas con Guardias Propios (Vigencia de 3 años)
    const tiposGuardias = ['Seguridad Industrial', 'Vigilancia Perimetral', 'Control de Acceso', 'Rondas Nocturnas'];
    const condominios = ['Condominio Mistral V', 'Condominio Las Torres', 'Condominio Portal del Sol', 'Condominio Vista Hermosa'];
    
    for (let i = 1; i <= 50; i++) {
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['guardias-propios'].push({
            numero: `GUARD-${String(i).padStart(3, '0')}`,
            empresa: i <= 4 ? condominios[i-1] : `Empresa Seguridad ${String(i).padStart(2, '0')}`,
            tipoServicio: tiposGuardias[Math.floor(Math.random() * tiposGuardias.length)], // This will be renamed to 'entidad'
            lugarInstalacion: lugaresInstalacion[Math.floor(Math.random() * lugaresInstalacion.length)],
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Now stores an address
            fechaAprobacion: fechaAprobacion,
            cantidadGuardias: `${Math.floor(Math.random() * 12) + 3} guardias`,
            area: 'Seguridad Privada',
            version: `${Math.floor(Math.random() * 3) + 1}.0`,
            titulo: `Protocolo de Guardias ${tiposGuardias[Math.floor(Math.random() * tiposGuardias.length)]}`,
            contenido: `Directiva para el manejo de guardias propios en servicios de seguridad privada. Incluye protocolos de actuación.`,
            turno: Math.random() > 0.5 ? '24/7' : 'Diurno',
            responsable: `Jefe Seguridad Emp-${String(i).padStart(2, '0')}`,
            estado: 'Activo', // Estado general (no de vigencia)
            vigencia: vigencia, // Nueva fecha de vigencia
            estadoVigencia: estadoVigencia, // Estado de vigencia (Vigente/Vencido)
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`, // Added RUT
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Servicio de Guardias para ${lugaresInstalacion[Math.floor(Math.random() * lugaresInstalacion.length)]}` // Added Alcance
        });
    }

    // 3. Generar 50 registros de Eventos Masivos (SIN VIGENCIA)
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
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Now stores an address
            // NO se añaden fechaAprobacion, vigencia, ni estadoVigencia para Eventos Masivos
            estadoAprobacion: aprobado ? 'APROBADO' : 'RECHAZADO', // Se mantiene el estado de aprobación
            cantidadGuardias: `${Math.floor(Math.random() * 50) + 10} guardias`,
            tipoEvento: tiposEventos[Math.floor(Math.random() * tiposEventos.length)], // This will be renamed to 'entidad'
            ubicacion: ubicacionesEventos[Math.floor(Math.random() * ubicacionesEventos.length)],
            area: 'Eventos y Espectáculos',
            version: '1.0',
            titulo: `Protocolo de Seguridad - ${tiposEventos[Math.floor(Math.random() * tiposEventos.length)]}`,
            contenido: `Directiva de seguridad para eventos masivos. Incluye protocolos de evacuación, control de multitudes y emergencias.`,
            capacidad: `${Math.floor(Math.random() * 50000) + 5000} personas`,
            duracion: `${Math.floor(Math.random() * 8) + 2} horas`,
            responsable: `Coordinador Eventos ${String(i).padStart(2, '0')}`,
            estado: aprobado ? 'Aprobado' : 'Rechazado', // Estado general (no de vigencia)
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)], // Added Comuna
            alcance: `Cobertura de Seguridad para Evento Masivo ${i}` // Added Alcance
        });
    }

    // 4. Generar 300 Directivas Generales (Vigencia de 3 años)
    const areasGenerales = ['Operaciones', 'Mantenimiento', 'Calidad', 'Administración', 'Logística'];
    for (let i = 1; i <= 300; i++) {
        const area = areasGenerales[Math.floor(Math.random() * areasGenerales.length)];
        
        const approvalYear = 2022 + Math.floor(Math.random() * 4); // 2022-2025
        const approvalMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const approvalDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const fechaAprobacion = `${approvalYear}-${approvalMonth}-${approvalDay}`;
        
        const approvalDateObj = new Date(fechaAprobacion);
        const vigenciaDateObj = new Date(approvalDateObj);
        vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años de vigencia
        const vigencia = vigenciaDateObj.toISOString().split('T')[0];

        const today = new Date();
        const estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';

        database['directivas-generales'].push({
            numero: `GEN-${String(i).padStart(4, '0')}`,
            area: area, // This will be renamed to 'entidad'
            version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            fecha: fechaAprobacion, // Usamos fechaAprobacion para la 'fecha' de emisión
            titulo: `Directiva General ${i} - ${area}`,
            contenido: `Directiva general para el área de ${area}. Establece procedimientos estándar de funcionamiento organizacional.`,
            alcance: 'Toda la organización',
            responsable: `Jefe de ${area}`,
            estado: Math.random() > 0.15 ? 'Vigente' : 'En actualización', // Estado general (no de vigencia)
            vigencia: vigencia, // Nueva fecha de vigencia
            estadoVigencia: estadoVigencia, // Estado de vigencia (Vigente/Vencido)
            rut: `${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 999) + 100}-${rutSuffixes[Math.floor(Math.random() * rutSuffixes.length)]}`, // Added RUT
            direccion: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)], // Added Direccion
            comuna: comunasChile[Math.floor(Math.random() * comunasChile.length)] // Added Comuna
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
        // Este caso ya no debería ser una pestaña directamente, sino un botón en 'medidas-consultar'
        // Se mantiene para compatibilidad si alguna otra parte del código lo llama, pero el flujo principal ha cambiado
        activeButton = Array.from(tabButtons).find(btn => btn.textContent.includes('Servicentros'));
    }
    
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Muestra el contenido de la pestaña seleccionada
    const tabContents = document.querySelectorAll(`#${section} .tab-content`);
    tabContents.forEach(content => content.classList.remove('active')); // Oculta todo el contenido de las pestañas
    
    document.getElementById(`${section}-${tab}`).classList.add('active'); // Muestra el contenido de la pestaña
    
    // Si la pestaña actual es la de consulta de medidas, actualiza los contadores de subsecciones
    if (section === 'medidas' && tab === 'consultar') {
        updateMedidasSubSectionCounts();
    }
}

// Función para mostrar las subsecciones de medidas (Medidas Generales, Servicentros, Sobre 500 UF)
function showMedidasSubSection(subSectionType) {
    // Oculta la vista principal de consulta de medidas
    document.getElementById('medidas-consultar').classList.remove('active');
    // Oculta cualquier otra lista de medidas que pudiera estar activa
    document.getElementById('medidas-servicentros-records').classList.remove('active');
    document.getElementById('medidas-sobre-500-uf-records').classList.remove('active');
    document.getElementById('medidas-records').classList.remove('active'); // Ocultar también medidas generales si está visible


    // Muestra el contenedor de registros de la subsección seleccionada
    // Se usa un switch para manejar 'medidas' que es una sección principal pero también una subcategoría de "Medidas de Seguridad"
    // NOTA: 'medidas' (general) ahora se gestiona internamente, no a través de un botón directo en el menú principal de Medidas.
    if (subSectionType === 'medidas') { // Esta ruta solo se usa si se llama internamente, no por un botón directo.
        document.getElementById('medidas-records').classList.add('active');
    } else {
        document.getElementById(`medidas-${subSectionType}-records`).classList.add('active');
    }
    loadData(subSectionType); // Carga los datos correspondientes
}

// Función para volver a la pantalla de consulta principal de Medidas
function backToMedidasConsultar() {
    document.getElementById('medidas-servicentros-records').classList.remove('active');
    document.getElementById('medidas-sobre-500-uf-records').classList.remove('active');
    document.getElementById('medidas-records').classList.remove('active'); // Ocultar también medidas generales si está visible
    document.getElementById('medidas-consultar').classList.add('active');
    updateMedidasSubSectionCounts(); // Actualiza los contadores de los botones al regresar
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

// Función para volver a la vista principal de Directivas
function backToDirectivasMain() {
    // Oculta todas las listas de subsecciones
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-generales-list').classList.remove('active');
    
    // Muestra la vista principal de consultar directivas
    document.getElementById('directivas-consultar').classList.add('active');
}

// Función para volver a la vista de consulta desde la vista de registros de Estudios, Planes o Medidas
function backToConsultar(section) {
    document.getElementById(`${section}-records`).classList.remove('active');
    document.getElementById(`${section}-consultar`).classList.add('active');
}

// Función específica para renderizar la lista de Empresas RRHH (solo Nombre y RUT y Dirección)
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
    
    // Oculta la lista de empresas RRHH
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    // Muestra la nueva sección de detalles específicos
    document.getElementById('directivas-empresa-specific-details').classList.add('active');
    
    // Actualiza el título de la sección de detalles
    document.getElementById('empresa-specific-details-title').textContent = `Directivas de Funcionamiento e Instalaciones de ${empresaNombre}`;
    
    // Carga los datos de directivas de esta empresa específica
    loadCompanySpecificDirectivas(empresaNombre);
}

// Carga y muestra los detalles de directivas para una empresa específica en formato de tabla
function loadCompanySpecificDirectivas(empresaNombre) {
    const resultsContainer = document.getElementById('empresa-specific-details-results');
    const directivasEmpresa = database['empresas-rrhh'].filter(directiva => directiva.empresa === empresaNombre);

    if (directivasEmpresa.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No hay directivas de instalaciones para esta empresa.</div>';
        return;
    }

    // Encabezados de la tabla para esta vista específica, siguiendo el nuevo orden
    const headers = [
        'numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna', 'alcance'
    ];

    let tableHTML = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    directivasEmpresa.forEach((directiva, index) => {
        // En este contexto, 'index' se refiere al índice dentro de 'data' (filtrada).
        // Para 'showDetails', necesitamos el índice original de la directiva en 'database['empresas-rrhh']'.
        // Se encuentra el índice original del objeto 'directiva' dentro del array completo 'database['empresas-rrhh']'.
        tableHTML += `<tr onclick="showDetails('empresas-rrhh', ${database['empresas-rrhh'].indexOf(directiva)})">`;
        headers.forEach(header => {
            let value = directiva[header] || 'N/A';
            let cellClass = '';
            // Aplica el estilo de color para el estado de vigencia
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
         directiva.cantidadGuardias.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
         directiva.tipoDirectiva.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (directiva.rut && directiva.rut.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by RUT
         (directiva.comuna && directiva.comuna.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by Comuna
         (directiva.alcance && directiva.alcance.toLowerCase().includes(searchTerm.toLowerCase()))) // Search by Alcance
    );

    const resultsContainer = document.getElementById('empresa-specific-details-results');
    if (filteredDirectivas.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No se encontraron directivas con ese criterio.</div>';
        return;
    }

    // Reutilizar la función para crear la tabla
    const tableHTML = createTableForCompanySpecificDirectivas(filteredDirectivas);
    resultsContainer.innerHTML = tableHTML;
}

// Helper para crear tabla específica para directivas de instalaciones (reutilizado por search)
function createTableForCompanySpecificDirectivas(data) {
    const headers = [
        'numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna', 'alcance'
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
            let cellClass = '';
            // Aplica el estilo de color para el estado de vigencia
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
    renderEmpresasRRHHList(); // Volver a renderizar la lista original de empresas RRHH
}

// Función para buscar en la lista de Empresas RRHH (solo Nombre y RUT y Dirección)
function searchEmpresasRRHH(searchTerm) {
    const filteredEmpresas = empresasRRHHList.filter(empresa => 
        empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.direccion.toLowerCase().includes(searchTerm.toLowerCase()) // Añadido para buscar por dirección
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


// Función genérica para mostrar la vista de registros de cualquier sección (Estudios, Planes, Medidas generales, y subsecciones de Directivas)
function showRecords(section) {
    // Ocultar la vista de consultar si aplica (solo para secciones principales)
    if (document.getElementById(`${section}-consultar`)) {
        document.getElementById(`${section}-consultar`).classList.remove('active');
    }
    // Ocultar cualquier lista de subsecciones de directivas si estamos en ese contexto
    document.getElementById('directivas-empresas-rrhh-list').classList.remove('active');
    document.getElementById('directivas-guardias-propios-list').classList.remove('active');
    document.getElementById('directivas-eventos-masivos-list').classList.remove('active');
    document.getElementById('directivas-generales-list').classList.remove('active');
    document.getElementById('directivas-empresa-specific-details').classList.remove('active');

    // Muestra la vista de registros (o la lista específica de la subsección si aplica)
    // Se usa un switch para manejar 'medidas' que es una sección principal pero también una subcategoría de "Medidas de Seguridad"
    if (section === 'medidas') { 
        document.getElementById('medidas-records').classList.add('active');
    } else {
        document.getElementById(`${section}-records`).classList.add('active');
    }
    loadData(section); // Carga los datos correspondientes a la sección
}


// Funciones para manejar datos (agregar, cargar, buscar, mostrar detalles)
function addRecord(section, event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    
    const formData = {};
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        let key;
        // Ajuste para manejar IDs de input de manera más genérica
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

    let targetArray = database[section]; // Por defecto, añade a la sección principal

    // Lógica para calcular la vigencia y el estado de vigencia al agregar un registro
    if (section === 'planes' || section === 'medidas-generales' || section === 'servicentros' || section === 'sobre-500-uf' || section === 'empresas-rrhh' || section === 'guardias-propios' || section === 'directivas-generales') { // Para estas secciones (3 años de vigencia)
        const fechaAprobacion = formData.fechaAprobacion || formData.fecha; // Use fecha for directivas
        if (fechaAprobacion) {
            const approvalDateObj = new Date(fechaAprobacion);
            const vigenciaDateObj = new Date(approvalDateObj);
            vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años
            formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de aprobación o emisión es requerida para este tipo de registro.', 'error');
            return;
        }
        if (section === 'medidas-generales') {
            targetArray = database.medidas; // Asegura que se añade al array correcto de medidas
        }
    } else if (section === 'estudios') { // Para estudios (2 años de vigencia)
        const fechaInicio = formData.fechaInicio;
        if (fechaInicio) {
            const startDateObj = new Date(fechaInicio);
            const endDateObj = new Date(startDateObj);
            endDateObj.setFullYear(endDateObj.getFullYear() + 2); // 2 años
            formData.fechaFin = endDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = endDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de inicio es requerida para un estudio.', 'error');
            return;
        }
    } else if (section === 'directivas') { // Para directivas generales (3 años de vigencia) - This is for the main 'directivas' array, not subcategories
        const fechaEmision = formData.fecha; 
        if (fechaEmision) {
            const emissionDateObj = new Date(fechaEmision);
            const vigenciaDateObj = new Date(emissionDateObj);
            vigenciaDateObj.setFullYear(vigenciaDateObj.getFullYear() + 3); // 3 años
            formData.vigencia = vigenciaDateObj.toISOString().split('T')[0];

            const today = new Date();
            formData.estadoVigencia = vigenciaDateObj > today ? 'Vigente' : 'Vencido';
        } else {
            showAlert(section, 'La fecha de emisión es requerida para una directiva.', 'error');
            return;
        }
        targetArray = database.directivas; 
    }

    targetArray.push(formData); // Añade el nuevo registro al array correspondiente
    
    form.reset(); // Limpia el formulario
    
    showAlert(section, 'Registro guardado exitosamente', 'success'); // Muestra un mensaje de éxito
    
    updateCounts(); // Actualiza los contadores en la página de inicio
    
    // Redirige de vuelta a la pestaña de consultar correcta después de agregar
    if (section === 'medidas-generales') {
        showTab('medidas', 'consultar'); 
    } else if (section === 'directivas') {
        showTab('directivas', 'consultar'); // Redirige a la consulta de directivas
    }
    else {
        showTab(section, 'consultar'); 
    }
}

// Carga y muestra los datos de una sección en formato de tabla
function loadData(section) {
    // Ajuste para seleccionar el contenedor de resultados correcto, ya sea directo o dentro de medidas-subseccion-records
    let resultsContainerId;
    if (section === 'medidas') {
        resultsContainerId = 'medidas-results';
    } else if (section === 'servicentros' || section === 'sobre-500-uf') {
        resultsContainerId = `${section}-results`; // Dentro de medidas-servicentros-records o medidas-sobre-500-uf-records
    } else {
        resultsContainerId = `${section}-results`; // Para estudios, planes, etc.
    }
    const resultsContainer = document.getElementById(resultsContainerId);

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

    // Determina los encabezados basados en la sección para mostrar las columnas relevantes
    let headers = [];
    if (section === 'estudios') {
        headers = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'responsable', 'objeto', 'metodologia'];
    } else if (section === 'planes') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna', 'alcance'];
    } else if (section === 'medidas') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna', 'alcance', 'prioridad', 'estado', 'descripcion', 'responsable'];
    } else if (section === 'servicentros') {
        headers = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna', 'alcance', 'nombre', 'ubicacion', 'telefono', 'horario', 'capacidad', 'responsable', 'estado'];
    } else if (section === 'sobre-500-uf') {
        headers = ['id', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna', 'alcance', 'monto', 'responsable', 'estado', 'descripcion'];
    } else if (section === 'empresas-rrhh') {
        headers = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna', 'alcance', 'empresa', 'lugarInstalacion', 'cantidadGuardias', 'area', 'version', 'titulo', 'responsable', 'estado'];
    } else if (section === 'guardias-propios') { 
        headers = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna', 'alcance', 'empresa', 'lugarInstalacion', 'cantidadGuardias'];
    } else if (section === 'eventos-masivos') { 
        // Eventos Masivos NO tiene vigencia/estadoVigencia
        headers = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna', 'alcance', 'nombreEmpresa', 'nombreEvento', 'cantidadGuardias'];
    } else if (section === 'directivas-generales') {
        headers = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna', 'alcance', 'version', 'titulo', 'responsable', 'estado'];
    } else if (section === 'directivas') { // Para el array 'directivas' genérico, si se usa
        headers = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna', 'alcance', 'version', 'titulo', 'contenido', 'responsable', 'estado'];
    }

    let tableHTML = '<table class="data-table';
    // Agrega la clase 'truncate-text' y 'eventos-masivos-table' solo para la sección de eventos masivos
    if (section === 'eventos-masivos') {
        tableHTML += ' truncate-text eventos-masivos-table'; 
    }
    tableHTML += '"><thead><tr>';
    
    headers.forEach(header => {
        tableHTML += `<th>${formatHeader(header)}</th>`; // Formatea el encabezado para una mejor lectura
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach((row, index) => {
        const originalIndex = database[section].indexOf(row); // Obtiene el índice original del elemento en la base de datos
        const detailIndex = originalIndex !== -1 ? originalIndex : index; 

        tableHTML += `<tr onclick="showDetails('${section}', ${detailIndex})">`;

        headers.forEach(header => {
            let value = row[header] || '-';
            let cellClass = '';
            // Aplica el estilo de color para el estado de vigencia o aprobación
            if (header === 'estadoVigencia' || header === 'estadoAprobacion') { 
                if (value === 'Vigente' || value === 'APROBADO') {
                    cellClass = 'status-vigente';
                } else if (value === 'Vencido' || value === 'RECHAZADO') {
                    cellClass = 'status-vencido';
                }
            }
            
            // La lógica de truncado de texto se maneja por CSS (truncate-text clase)
            tableHTML += `<td class="${cellClass}">${value}</td>`;
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
        categoria: 'Entidad', // Renombrado de 'categoria' a 'Entidad' para medidas
        prioridad: 'Prioridad',
        estado: 'Estado', // Estado general (ej: implementada, pendiente)
        descripcion: 'Descripción',
        responsable: 'Responsable',
        tipo: 'Entidad', // Renombrado de 'tipo' a 'Entidad' para planes, estudios, servicentros y sobre-500-uf
        vigencia: 'Fecha de Vigencia',
        revision: 'Dirección', // Renombrado de 'revision' a 'Dirección' para planes
        objetivo: 'Objetivo',
        alcance: 'Alcance',
        numero: 'Código', // Renombrado de 'numero' a 'Código' para directivas
        area: 'Entidad', // Renombrado de 'area' a 'Entidad' para directivas generales
        version: 'Versión',
        fecha: 'Fecha de Aprobación', // Renombrado de 'fecha' a 'Fecha de Aprobación' para directivas generales y sobre-500-uf
        titulo: 'Título',
        contenido: 'Contenido',
        fechaInicio: 'Fecha de Aprobación', // Renombrado de 'fechaInicio' a 'Fecha de Aprobación' para estudios
        fechaFin: 'Fecha Fin',
        objeto: 'Objeto',
        metodologia: 'Metodología',
        nombre: 'Nombre',
        ubicacion: 'Ubicación',
        direccion: 'Dirección', // Esta es la dirección general o de empresas/directivas
        telefono: 'Teléfono',
        horario: 'Horario',
        capacidad: 'Capacidad',
        empresa: 'Nombre Empresa', 
        tipoDirectiva: 'Entidad', // Renombrado de 'tipoDirectiva' a 'Entidad' para empresas-rrhh
        tipoServicio: 'Entidad', // Renombrado de 'tipoServicio' a 'Entidad' para guardias-propios
        numeroGuardias: 'Número Guardias',
        turno: 'Turno',
        tipoEvento: 'Entidad', // Renombrado de 'tipoEvento' a 'Entidad' para eventos masivos
        nombreEvento: 'Nombre del Evento',
        duracion: 'Duración',
        lugarInstalacion: 'Lugar de Instalación',
        fechaAprobacion: 'Fecha de Aprobación', 
        cantidadGuardias: 'Cantidad de Guardias',
        nombreEmpresa: 'Nombre Empresa', 
        rut: 'RUT',
        fechaEvento: 'Fecha del Evento', // Se mantiene el nombre original del campo para el dato
        estadoAprobacion: 'Estado de Aprobación',
        id: 'Código', // Renombrado de 'id' a 'Código' para sobre-500-uf
        monto: 'Monto (UF)',
        estadoVigencia: 'Estado de Vigencia', // Estado de vigencia (Vigente/Vencido)
        comuna: 'Comuna' // Nuevo encabezado para 'comuna'
    };
    return headerMap[header] || header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
}

// Busca datos dentro de una sección por término de búsqueda
function searchData(section, searchTerm) {
    const data = database[section];
    const filteredData = data.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    // Ajuste para seleccionar el contenedor de resultados correcto, ya sea directo o dentro de medidas-subseccion-records
    let resultsContainerId;
    if (section === 'medidas') {
        resultsContainerId = 'medidas-results';
    } else if (section === 'servicentros' || section === 'sobre-500-uf') {
        resultsContainerId = `${section}-results`; // Dentro de medidas-servicentros-records o medidas-sobre-500-uf-records
    } else {
        resultsContainerId = `${section}-results`; // Para estudios, planes, etc.
    }
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
    // Define el orden de las propiedades en el modal, similar a las tablas
    let detailKeys = Object.keys(item);
    if (section === 'estudios') {
        detailKeys = ['codigo', 'fechaInicio', 'fechaFin', 'estadoVigencia', 'tipo', 'objeto', 'metodologia', 'responsable'];
    } else if (section === 'planes') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'revision', 'comuna', 'alcance', 'objetivo'];
    } else if (section === 'medidas') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'categoria', 'rut', 'direccion', 'comuna', 'alcance', 'prioridad', 'estado', 'descripcion', 'responsable'];
    } else if (section === 'servicentros') {
        detailKeys = ['codigo', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna', 'alcance', 'nombre', 'ubicacion', 'telefono', 'horario', 'capacidad', 'responsable', 'estado'];
    } else if (section === 'sobre-500-uf') {
        detailKeys = ['id', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipo', 'rut', 'direccion', 'comuna', 'alcance', 'monto', 'fecha', 'responsable', 'estado', 'descripcion'];
    } else if (section === 'empresas-rrhh') {
        detailKeys = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoDirectiva', 'rut', 'direccion', 'comuna', 'alcance', 'empresa', 'lugarInstalacion', 'cantidadGuardias', 'area', 'version', 'titulo', 'contenido', 'responsable', 'estado'];
    } else if (section === 'guardias-propios') { 
        detailKeys = ['numero', 'fechaAprobacion', 'vigencia', 'estadoVigencia', 'tipoServicio', 'rut', 'direccion', 'comuna', 'alcance', 'empresa', 'lugarInstalacion', 'cantidadGuardias'];
    } else if (section === 'eventos-masivos') { 
        detailKeys = ['numero', 'fechaEvento', 'estadoAprobacion', 'tipoEvento', 'rut', 'direccion', 'comuna', 'alcance', 'nombreEmpresa', 'nombreEvento', 'cantidadGuardias', 'ubicacion', 'area', 'version', 'titulo', 'contenido', 'capacidad', 'duracion', 'responsable', 'estado'];
    } else if (section === 'directivas-generales') {
        detailKeys = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna', 'alcance', 'version', 'titulo', 'contenido', 'responsable', 'estado'];
    } else if (section === 'directivas') { // Para el array 'directivas' genérico
        detailKeys = ['numero', 'fecha', 'vigencia', 'estadoVigencia', 'area', 'rut', 'direccion', 'comuna', 'alcance', 'version', 'titulo', 'contenido', 'responsable', 'estado'];
    }

    detailKeys.forEach(key => {
        let value = item[key] || 'No especificado';
        let detailClass = '';
        // Aplica la clase de estado en el modal también
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

// Cierra el modal de detalles
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Actualiza los contadores de registros en la página de inicio
function updateCounts() {
    document.getElementById('estudios-count').textContent = `${database.estudios.length} registros`;
    document.getElementById('planes-count').textContent = `${database.planes.length} registros`;
    
    // El contador de "Medidas" ahora suma todas las subcategorías relevantes
    const totalMedidas = database.medidas.length + database.servicentros.length + database['sobre-500-uf'].length;
    document.getElementById('medidas-count').textContent = `${totalMedidas} registros`;
    
    // Suma todos los registros de las subcategorías de directivas
    const totalDirectivas = database['empresas-rrhh'].length + database['guardias-propios'].length + database['eventos-masivos'].length + database['directivas-generales'].length;
    document.getElementById('directivas-count').textContent = `${totalDirectivas} registros`;

    // Actualiza los contadores en los botones de la sección de Medidas (si están visibles)
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


// Muestra un mensaje de alerta temporal en la interfaz
function showAlert(section, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`; 
    alertDiv.textContent = message;
    
    let targetElement;
    // Determina el formulario o contenedor correcto para insertar la alerta
    if (section === 'medidas-generales') { 
        targetElement = document.querySelector(`#medidas-agregar form`);
    } else if (document.querySelector(`#${section}-agregar form`)) {
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

// Cierra el modal si se hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializa la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    updateCounts(); // Actualiza todos los contadores iniciales
    console.log('Sistema cargado con:', {
        'Estudios de Seguridad': database.estudios.length,
        'Planes de Seguridad': database.planes.length, 
        'Medidas de Seguridad (General)': database.medidas.length,
        'Servicentros': database.servicentros.length,
        'Sobre 500 UF': database['sobre-500-uf'].length,
        'Empresas RRHH': empresasRRHHList.length + ' empresas con ' + database['empresas-rrhh'].length + ' registros totales',
        'Guardias Propios': database['guardias-propios'].length,
        'Eventos Masivos': database['eventos-masivos'].length,
        'Directivas Generales': database['directivas-generales'].length
    });
});
