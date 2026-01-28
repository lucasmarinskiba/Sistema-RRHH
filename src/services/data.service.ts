
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { EmailService } from './email.service';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ESQUEMA DE DATOS SOLICITADO (INTERFACES) ---

export interface Empresa {
  id: number; // Usamos number para el ID compartido con usuarios, aunque en firestore sea doc ID string, mapeamos
  nombre: string;
  direccion?: string;
  localidad?: string;
  lat?: number;
  lng?: number;
}

export interface TipoUsuario {
  id: number;          
  tipousuario: string; 
}

export interface Usuario {
  id: string;          
  usuario: string;     
  contrasenia: string; 
  tipousuarioId: number; 
  nombre: string;
  verificado: boolean;
  empresaId: number;
  cargo?: string; // Para mostrar en responsables
}

export interface TipoJornada {
  id: number;          
  tipoJornada: string; 
}

export interface Obra {
  id: string;          
  empresaId: number;
  obra: string;        // Nombre de la obra
  direccion?: string;  // Calle
  altura?: string;     // Número
  localidad?: string;
  provincia?: string;
  fechaInicio?: string;
  estado?: 'Activa' | 'Finalizada' | 'Pausada';
  lat?: number;        // Coordenada Latitud
  lng?: number;        // Coordenada Longitud
}

export interface TipoNovedad {
  id: number;          
  tipoNovedad: string; 
}

export interface Legajo {
  id: string;          
  empresaId: number;   
  
  // Campos solicitados imagen
  nroLegajo: string;   
  apellido: string;    
  nombre: string;
  cuil: string;        // Requerido imagen
  calificacionProfesional?: string; // Requerido imagen
  categoria: string;   
  sector?: string;     // Requerido imagen
  basicoJornal?: number; // Requerido imagen ("1.003.660,520")

  direccion: string;   
  obraId?: string;     
  
  // Extras útiles
  email?: string;
  activo: boolean; // Estado
  trabajoAntes: boolean; 
  fechaIngreso?: string;
  
  // Biometría
  rostroRegistrado?: boolean; // Booleano simple
  biometricReference?: string; // Base64 de la foto de referencia para comparación IA
}

export interface Periodo {
  id: string;          
  empresaId: number;
  legajoId: string;    
  fechaIngreso: string;
  fechaEgreso?: string;
}

export interface Novedad {
  id: string;          
  empresaId: number;
  tipoNovedad: string; // Texto libre o FK
  legajoId: string;      
  fecha: string;
  cantidad: number;    // Ej: horas o días
  observacion?: string;
}

// --- OTROS MODELOS (Documentos, Fichadas, etc para la app) ---

export interface Documento {
  id: string;
  empresaId: number;
  legajoId: string; 
  // Tipos ampliados según requerimiento
  tipo: 'Alta' | 'Baja' | 'ModificacionObra' | 'CertificadoMedico' | 'FormularioART' | 'PlanillaHoraria' | 'EntregaEPP' | 'Formulario931' | 'Otro';
  fechaCarga: string;
  fechaVencimiento?: string;
  rutaArchivo: string; 
  observaciones?: string;
  contenido?: string; // Base64
}

export interface Fichada {
  id: string;
  empresaId: number;
  legajoId: string;
  entrada: string; 
  salida?: string;
  latitud?: number;
  longitud?: number;
  ubicacionNombre?: string; // Nombre de la obra detectada o dirección aprox
}

export interface ReciboSueldo {
  id: string;
  empresaId: number;
  legajoId: string;
  periodo: string; 
  monto: number;
  estado: 'Pendiente' | 'Firmado';
  firmaHash?: string;
  firmaImagen?: string; // Base64 de la firma manuscrita
  fechaFirma?: string;
}

export interface AuditLog {
  id: string;
  fecha: string;
  usuarioId: string;
  accion: string;
  detalles: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private emailService = inject(EmailService);
  
  private useLocalStorage = false;

  // --- CATALOGOS ESTATICOS ---
  
  readonly tipoUsuarios = signal<TipoUsuario[]>([
    { id: 1, tipousuario: 'Administrador' },
    { id: 2, tipousuario: 'RRHH' },
    { id: 3, tipousuario: 'Capataz' }
  ]);

  readonly tipoJornadas = signal<TipoJornada[]>([
    { id: 1, tipoJornada: 'Jornada Completa (UOCRA)' },
    { id: 2, tipoJornada: 'Media Jornada' },
    { id: 3, tipoJornada: 'Por Hora' }
  ]);

  readonly tipoNovedades = signal<TipoNovedad[]>([
    { id: 1, tipoNovedad: 'Horas Extras 50%' },
    { id: 2, tipoNovedad: 'Horas Extras 100%' },
    { id: 3, tipoNovedad: 'Ausencia Injustificada' },
    { id: 4, tipoNovedad: 'Enfermedad' },
    { id: 5, tipoNovedad: 'Vacaciones' },
    { id: 6, tipoNovedad: 'Lluvia / Días Caídos' },
    { id: 7, tipoNovedad: 'Presentismo' },
    { id: 8, tipoNovedad: 'Adelanto de Sueldo' }
  ]);

  // --- OBSERVABLES ---
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _obras = signal<Obra[]>([]); 
  private readonly _legajos = signal<Legajo[]>([]);
  private readonly _periodos = signal<Periodo[]>([]);
  private readonly _novedades = signal<Novedad[]>([]);
  private readonly _empresas = signal<Empresa[]>([]); // Almacén interno de empresas
  
  private readonly _documentos = signal<Documento[]>([]);
  private readonly _fichadas = signal<Fichada[]>([]);
  private readonly _recibos = signal<ReciboSueldo[]>([]);
  private readonly _auditLogs = signal<AuditLog[]>([]);

  // --- SESSION STATE ---
  readonly currentUser = signal<Usuario | null>(null);
  readonly dbStatus = signal<'connecting' | 'connected' | 'error' | 'local'>('connecting');
  private pendingVerifications = new Map<string, string>();

  // --- PUBLIC VIEWS (Filtered by Company Tenant) ---
  
  // Empresa actual del usuario logueado
  readonly empresa = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return this._empresas().find(e => e.id === user.empresaId) || null;
  });

  readonly obras = computed(() => {
    const user = this.currentUser();
    return user ? this._obras().filter(o => o.empresaId === user.empresaId) : [];
  });

  readonly legajos = computed(() => {
    const user = this.currentUser();
    return user ? this._legajos().filter(l => l.empresaId === user.empresaId) : [];
  });

  readonly documentos = computed(() => {
    const user = this.currentUser();
    return user ? this._documentos().filter(d => d.empresaId === user.empresaId) : [];
  });

  readonly fichadas = computed(() => {
    const user = this.currentUser();
    return user ? this._fichadas().filter(f => f.empresaId === user.empresaId) : [];
  });

  readonly recibos = computed(() => {
    const user = this.currentUser();
    return user ? this._recibos().filter(r => r.empresaId === user.empresaId) : [];
  });
  
  readonly novedades = computed(() => {
    const user = this.currentUser();
    return user ? this._novedades().filter(n => n.empresaId === user.empresaId) : [];
  });

  readonly auditLogs = computed(() => {
     const user = this.currentUser();
     if (!user) return [];
     const companyUserIds = this._usuarios().filter(u => u.empresaId === user.empresaId).map(u => u.id);
     return this._auditLogs().filter(log => companyUserIds.includes(log.usuarioId));
  });

  // Lista de usuarios de la misma empresa (para "Ver Autorizaciones")
  readonly companyUsers = computed(() => {
    const user = this.currentUser();
    return user ? this._usuarios().filter(u => u.empresaId === user.empresaId) : [];
  });

  readonly activeEmployeesCount = computed(() => this.legajos().filter(l => l.activo).length);
  
  readonly expiringDocsCount = computed(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return this.documentos().filter(d => d.fechaVencimiento && new Date(d.fechaVencimiento) <= nextWeek && new Date(d.fechaVencimiento) >= today).length;
  });

  readonly payrollProgress = computed(() => {
    const total = this.recibos().length;
    if (total === 0) return 0;
    const signed = this.recibos().filter(r => r.estado === 'Firmado').length;
    return Math.round((signed / total) * 100);
  });

  constructor(private router: Router) {
    this.initData();
  }

  // --- DATA INITIALIZATION ---
  
  private async initData() {
    console.log('[DATA] Iniciando carga de datos...');
    this.dbStatus.set('connecting');
    
    try {
      await Promise.all([
        this.fetchCollection('companies', this._empresas),
        this.fetchCollection('users', this._usuarios),
        this.fetchCollection('projects', this._obras),
        this.fetchCollection('employees', this._legajos),
        this.fetchCollection('periods', this._periodos),
        this.fetchCollection('news', this._novedades),
        this.fetchCollection('documents', this._documentos),
        this.fetchCollection('attendance', this._fichadas),
        this.fetchCollection('payroll', this._recibos),
        this.fetchCollection('audit', this._auditLogs),
      ]);
      this.dbStatus.set('connected');
      this.useLocalStorage = false;
      console.log('[FIREBASE] Conexión establecida.');
    } catch (e: any) {
      console.warn('[FIREBASE] Fallo de conexión o permisos. Activando MODO LOCAL.', e);
      this.useLocalStorage = true;
      this.dbStatus.set('local');
      this.initLocalData();
    }

    const savedUserId = localStorage.getItem('CURRENT_USER_ID');
    if (savedUserId) {
      const user = this._usuarios().find(u => u.id === savedUserId);
      if (user) this.currentUser.set(user);
    }
  }

  async retryConnection() {
    console.log('[DATA] Reintentando conexión con Firebase...');
    await this.initData();
  }

  private initLocalData() {
    const load = (key: string, signal: any, defaultData: any[]) => {
       const stored = localStorage.getItem('local_' + key);
       if (stored) {
         signal.set(JSON.parse(stored));
       } else {
         signal.set(defaultData);
         localStorage.setItem('local_' + key, JSON.stringify(defaultData));
       }
    };

    const demoEmpresaId = 9999;
    
    load('companies', this._empresas, [
       { id: demoEmpresaId, nombre: 'Constructora Demo SA', direccion: 'Av. Corrientes 1000', localidad: 'CABA', lat: -34.6037, lng: -58.3816 }
    ]);

    load('users', this._usuarios, [
       { id: 'admin1', usuario: 'admin@demo.com', contrasenia: '123456', nombre: 'Admin Demo', cargo: 'Gerente RRHH', tipousuarioId: 1, verificado: true, empresaId: demoEmpresaId }
    ]);
    load('projects', this._obras, [
       { id: 'p1', empresaId: demoEmpresaId, obra: 'Edificio Libertador', direccion: 'Av. Libertador', altura: '1200', localidad: 'CABA', provincia: 'CABA', fechaInicio: '2026-01-15', estado: 'Activa', lat: -34.588, lng: -58.381 }
    ]);
    
    // Updated Mock Data based on Image
    load('employees', this._legajos, [
       { 
         id: 'l1', empresaId: demoEmpresaId, nroLegajo: '2', apellido: 'MEDINA', nombre: 'NESTOR', 
         cuil: '20-14396826-0', calificacionProfesional: 'CONDUCTOR DE 1°', categoria: 'CONDUCTOR DE 1°',
         sector: 'CHOFERES', basicoJornal: 1003660.520, direccion: 'Zona Norte', activo: true, trabajoAntes: false, fechaIngreso: '2026-01-01', rostroRegistrado: true 
       },
       { 
         id: 'l2', empresaId: demoEmpresaId, nroLegajo: '15', apellido: 'OJEDA', nombre: 'DIEGO RAUL', 
         cuil: '23-29599187-9', calificacionProfesional: 'ENCARGADO', categoria: 'ENCARGADO',
         sector: 'ADMINISTRACIÓN', basicoJornal: 981846.760, direccion: 'Capital', activo: true, trabajoAntes: false, fechaIngreso: '2025-05-10', rostroRegistrado: false 
       },
       { 
         id: 'l3', empresaId: demoEmpresaId, nroLegajo: '21', apellido: 'PEREYRA', nombre: 'ANDRES OSCAR', 
         cuil: '20-28947227-5', calificacionProfesional: 'CONDUCTOR DE 1°', categoria: 'CONDUCTOR DE 1°',
         sector: 'CHOFERES', basicoJornal: 1003660.520, direccion: 'Oeste', activo: true, trabajoAntes: true, fechaIngreso: '2024-02-15' 
       }
    ]);

    load('periods', this._periodos, [
       { id: 'per1', empresaId: demoEmpresaId, legajoId: 'l1', fechaIngreso: '2026-01-15' }
    ]);
    load('news', this._novedades, []);
    load('documents', this._documentos, []);
    load('attendance', this._fichadas, []);
    load('payroll', this._recibos, []);
    load('audit', this._auditLogs, []);
  }

  private async fetchCollection(colName: string, signalUpdater: any) {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    const data = snap.docs.map(doc => {
       const d = doc.data();
       // Fix for companies that use number IDs in JSON but string in Firestore (simulated)
       if(colName === 'companies') return { ...d, id: d['id'] || parseInt(doc.id) || 0 }; 
       return { ...d, id: doc.id };
    });
    signalUpdater.set(data);
  }

  // --- AUTH ACTIONS ---

  async register(nombre: string, email: string, password: string, empresaNombre: string): Promise<boolean> {
    const newEmpresaId = Math.floor(Math.random() * 1000000);
    const exists = this._usuarios().find(u => u.usuario === email);
    if (exists) return false;

    // Crear Empresa Data
    const newEmpresa: Empresa = {
        id: newEmpresaId,
        nombre: empresaNombre,
        direccion: '',
        localidad: '',
        lat: -34.6037, // Default BA
        lng: -58.3816
    };

    const newUser: any = { 
      usuario: email, 
      contrasenia: password, 
      tipousuarioId: 1, 
      nombre, 
      cargo: 'Administrador',
      empresaId: newEmpresaId,
      verificado: false 
    };
    
    if (this.useLocalStorage) {
       // Save Company
       this._empresas.update(e => [...e, newEmpresa]);
       this.saveLocal('companies', this._empresas());

       newUser.id = 'loc_' + Date.now();
       this._usuarios.update(u => [...u, newUser]);
       this.saveLocal('users', this._usuarios());
    } else {
       try {
         // Save Company in Firestore (using ID as doc ID for simplicity in this relational-mock setup)
         await setDoc(doc(db, 'companies', newEmpresaId.toString()), newEmpresa);
         this._empresas.update(e => [...e, newEmpresa]);

         const colRef = collection(db, 'users');
         const docRef = await addDoc(colRef, newUser);
         newUser.id = docRef.id;
         this._usuarios.update(u => [...u, newUser]);
       } catch (e) {
         console.error(e);
         return false;
       }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    this.pendingVerifications.set(email, code);
    return await this.emailService.sendVerificationEmail(email, code);
  }

  getVerificationCodeDebug(email: string): string | undefined {
    return this.pendingVerifications.get(email);
  }

  async validateCodeAndLogin(email: string, code: string): Promise<boolean> {
    const storedCode = this.pendingVerifications.get(email);
    if (storedCode && storedCode === code) {
      const user = this._usuarios().find(u => u.usuario === email);
      if (user) {
        
        if (this.useLocalStorage) {
            const updatedUser = { ...user, verificado: true };
            this._usuarios.update(list => list.map(u => u.id === user.id ? updatedUser : u));
            this.saveLocal('users', this._usuarios());
            this.currentUser.set(updatedUser);
        } else {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { verificado: true });
            const updatedUser = { ...user, verificado: true };
            this._usuarios.update(list => list.map(u => u.id === user.id ? updatedUser : u));
            this.currentUser.set(updatedUser);
        }

        localStorage.setItem('CURRENT_USER_ID', user.id);
        this.logAction('Verificación Exitosa', `Usuario ${user.usuario} verificado.`);
        this.pendingVerifications.delete(email);
        return true;
      }
    }
    return false;
  }

  login(email: string, password: string): { success: boolean, error?: 'email' | 'password' | 'unverified' } {
    const userByEmail = this._usuarios().find(u => u.usuario === email);
    
    // 1. Check Email
    if (!userByEmail) {
        return { success: false, error: 'email' };
    }

    // 2. Check Password
    if (userByEmail.contrasenia !== password) {
        return { success: false, error: 'password' };
    }

    // 3. Check Verification
    if (!userByEmail.verificado) {
        return { success: false, error: 'unverified' };
    }

    // Success
    this.currentUser.set(userByEmail);
    localStorage.setItem('CURRENT_USER_ID', userByEmail.id);
    this.logAction('Login', `Inicio de sesión exitoso`);
    return { success: true };
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('CURRENT_USER_ID');
    this.router.navigate(['/auth']);
  }

  private async logAction(accion: string, detalles: string) {
    const user = this.currentUser();
    if (!user) return;
    
    const log: any = {
      fecha: new Date().toISOString(),
      usuarioId: user.id,
      accion,
      detalles
    };

    if (this.useLocalStorage) {
        log.id = 'loc_' + Date.now();
        this._auditLogs.update(l => [...l, log]);
        this.saveLocal('audit', this._auditLogs());
    } else {
        const docRef = await addDoc(collection(db, 'audit'), log);
        this._auditLogs.update(l => [...l, { ...log, id: docRef.id }]);
    }
  }

  // --- BUSINESS LOGIC (CRUD) ---

  async addLegajo(data: Omit<Legajo, 'id' | 'empresaId' | 'activo'>) {
    const user = this.currentUser();
    if (!user) return;
    
    const newLegajo: any = { ...data, empresaId: user.empresaId, activo: true, rostroRegistrado: false };
    
    if (this.useLocalStorage) {
        newLegajo.id = 'loc_' + Date.now();
        this._legajos.update(l => [...l, newLegajo]);
        this.saveLocal('employees', this._legajos());
    } else {
        const docRef = await addDoc(collection(db, 'employees'), newLegajo);
        this._legajos.update(l => [...l, { ...newLegajo, id: docRef.id }]);
    }
    
    // Crear periodo inicial automático
    this.addPeriodo({
       legajoId: newLegajo.id, 
       fechaIngreso: data.fechaIngreso || new Date().toISOString().split('T')[0]
    }, newLegajo.id); 

    this.logAction('Alta Legajo', `Se creó el legajo ${data.nroLegajo} - ${data.apellido}`);
  }
  
  async addPeriodo(data: Omit<Periodo, 'id' | 'empresaId'>, forcedLegajoId?: string) {
     const user = this.currentUser();
     if (!user) return;
     const newPeriodo: any = { ...data,