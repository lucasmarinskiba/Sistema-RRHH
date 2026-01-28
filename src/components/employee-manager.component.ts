
import { Component, inject, signal, computed, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DataService, Legajo } from '../services/data.service';

@Component({
  selector: 'app-employee-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg shadow-sm border border-slate-200">
      
      <!-- Top Toolbar -->
      <div class="p-2 border-b border-slate-200 flex items-center gap-2 text-sm bg-slate-50 shrink-0 overflow-x-auto">
         <h2 class="text-xl font-bold text-slate-800 mr-4">Legajos</h2>
         
         <div class="flex items-center gap-1 border-r border-slate-300 pr-2">
            <button (click)="openModal()" class="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer transition-colors">
               <span class="material-icons-outlined text-lg">add_circle_outline</span> Agregar
            </button>
            <button (click)="editSelected()" class="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium disabled:opacity-50 cursor-pointer transition-colors" [disabled]="!selectedId()">
               <span class="material-icons-outlined text-lg">edit</span> Editar
            </button>
         </div>

         <div class="flex items-center gap-1 px-2">
             <button class="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer transition-colors">
               <span class="material-icons-outlined text-lg">refresh</span> Actualizar
             </button>
             <button (click)="toggleFilters()" class="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer transition-colors" [class.bg-slate-200]="showFilters()">
               <span class="material-icons-outlined text-lg">filter_alt</span> Filtrar Legajos <span class="material-icons-outlined text-sm">arrow_drop_down</span>
             </button>
         </div>
      </div>

      <!-- Excel-like Table Container -->
      <div class="flex-1 overflow-auto bg-white relative custom-scrollbar">
        <table class="w-full border-collapse text-left text-xs md:text-sm text-slate-700">
          <thead class="bg-slate-100 sticky top-0 z-10 text-slate-800 font-bold border-b border-slate-300 shadow-sm">
            <tr>
              <!-- Headers -->
              <th class="p-3 border-r border-slate-300 w-24 cursor-pointer hover:bg-slate-200 transition-colors" (click)="setSort('nroLegajo')">
                 <div class="flex items-center justify-between">Número <span class="material-icons-outlined text-[10px]" *ngIf="sortColumn() === 'nroLegajo'">{{ sortDirection() === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down' }}</span><span class="material-icons-outlined text-[10px] text-slate-400" *ngIf="sortColumn() !== 'nroLegajo'">arrow_drop_down</span></div>
              </th>
              <th class="p-3 border-r border-slate-300 min-w-[200px] cursor-pointer hover:bg-slate-200 transition-colors" (click)="setSort('apellido')">
                 <div class="flex items-center justify-between">Empleado <span class="material-icons-outlined text-[10px]" *ngIf="sortColumn() === 'apellido'">{{ sortDirection() === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down' }}</span><span class="material-icons-outlined text-[10px] text-slate-400" *ngIf="sortColumn() !== 'apellido'">arrow_drop_down</span></div>
              </th>
              <th class="p-3 border-r border-slate-300 w-32">CUIL <span class="material-icons-outlined text-[10px] text-slate-400 float-right">arrow_drop_down</span></th>
              <th class="p-3 border-r border-slate-300">Calificación Profesional <span class="material-icons-outlined text-[10px] text-slate-400 float-right">arrow_drop_down</span></th>
              <th class="p-3 border-r border-slate-300">Categoría <span class="material-icons-outlined text-[10px] text-slate-400 float-right">arrow_drop_down</span></th>
              <th class="p-3 border-r border-slate-300">Sector <span class="material-icons-outlined text-[10px] text-slate-400 float-right">arrow_drop_down</span></th>
              <th class="p-3 border-r border-slate-300 w-24 text-center">Biometría</th>
              <th class="p-3 border-r border-slate-300 text-center w-24">Acciones</th>
            </tr>
            
            <!-- Filter Row -->
            @if (showFilters()) {
               <tr class="bg-slate-50 border-b border-slate-300">
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.nroLegajo" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.apellido" placeholder="Nombre o Apellido" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.cuil" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.calificacion" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.categoria" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"><input [(ngModel)]="filters.sector" class="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"></td>
                  <td class="p-1 border-r border-slate-200"></td>
                  <td class="p-1 border-r border-slate-200"></td>
               </tr>
            }
          </thead>
          <tbody class="divide-y divide-slate-100">
             @for (emp of paginatedLegajos(); track emp.id) {
               <tr 
                 (click)="selectRow(emp.id)" 
                 [class.bg-blue-50]="selectedId() === emp.id"
                 class="hover:bg-slate-50 cursor-pointer transition-colors border-l-4 group"
                 [class]="getSectorStyles(emp.sector).border"
               >
                 <td class="p-3 border-r border-slate-100 font-mono text-xs">{{ emp.nroLegajo }}</td>
                 
                 <!-- Employee Info with Avatar -->
                 <td class="p-3 border-r border-slate-100">
                    <div class="flex items-center gap-3">
                       <div [class]="getSectorStyles(emp.sector).bg + ' ' + getSectorStyles(emp.sector).text" class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-white ring-1 ring-slate-100 overflow-hidden">
                          @if (emp.biometricReference) {
                             <img [src]="emp.biometricReference" class="w-full h-full object-cover">
                          } @else {
                             {{ getInitials(emp.nombre, emp.apellido) }}
                          }
                       </div>
                       <div class="flex flex-col">
                          <span class="font-bold text-slate-800 leading-none group-hover:text-blue-700 transition-colors">{{ emp.apellido }}</span>
                          <span class="text-xs text-slate-500">{{ emp.nombre }}</span>
                       </div>
                    </div>
                 </td>

                 <td class="p-3 border-r border-slate-100 font-mono text-xs text-slate-500">{{ emp.cuil || '-' }}</td>
                 <td class="p-3 border-r border-slate-100 text-xs font-medium text-slate-700 uppercase">{{ emp.calificacionProfesional || '-' }}</td>
                 
                 <td class="p-3 border-r border-slate-100">
                     <span class="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wide border shadow-sm block w-fit" [class]="getSectorStyles(emp.sector).badge">
                        {{ emp.categoria }}
                     </span>
                 </td>
                 
                 <td class="p-3 border-r border-slate-100">
                     <div class="flex items-center gap-2">
                        <span class="material-icons-outlined text-lg" [class]="getSectorStyles(emp.sector).text">{{ getSectorStyles(emp.sector).icon }}</span>
                        <span class="text-xs font-bold uppercase" [class]="getSectorStyles(emp.sector).text">{{ emp.sector || 'SIN ASIGNAR' }}</span>
                     </div>
                 </td>

                 <!-- Biometric Status -->
                 <td class="p-3 border-r border-slate-100 text-center">
                    @if (emp.rostroRegistrado) {
                       <span class="text-green-600" title="Rostro Registrado"><span class="material-icons-outlined">face_retouching_natural</span></span>
                    } @else {
                       <button (click)="openBiometricModal(emp, $event)" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-full text-[10px] font-bold border border-indigo-200 flex items-center gap-1 mx-auto transition-colors">
                          <span class="material-icons-outlined text-xs">add_a_photo</span> Registrar
                       </button>
                    }
                 </td>
                 
                 <td class="p-3 text-center flex items-center justify-center gap-2">
                    <button (click)="deleteLegajo(emp.id, $event)" class="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all transform hover:scale-110" title="Eliminar Legajo">
                       <span class="material-icons-outlined text-lg">delete</span>
                    </button>
                    <!-- Re-enroll option for already enrolled -->
                    @if (emp.rostroRegistrado) {
                        <button (click)="openBiometricModal(emp, $event)" class="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-all" title="Actualizar Rostro">
                           <span class="material-icons-outlined text-lg">face</span>
                        </button>
                    }
                 </td>
               </tr>
             }
             @if (paginatedLegajos().length === 0) {
                <tr>
                   <td colspan="10" class="p-8 text-center text-slate-500 italic flex flex-col items-center justify-center">
                      <span class="material-icons-outlined text-3xl mb-2 text-slate-300">search_off</span>
                      No se encontraron legajos con los filtros actuales.
                   </td>
                </tr>
             }
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-end text-xs text-slate-600 items-center gap-4 shrink-0">
         <span>Elementos mostrados {{ startItem() }} - {{ endItem() }} de {{ filteredLegajos().length }}</span>
         <div class="flex gap-1">
             <button (click)="prevPage()" [disabled]="currentPage() === 1" class="w-6 h-6 flex items-center justify-center border rounded bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer">
               <span class="material-icons-outlined text-sm">chevron_left</span>
             </button>
             <button class="w-6 h-6 flex items-center justify-center border rounded bg-white font-bold cursor-default">
               {{ currentPage() }}
             </button>
             <button (click)="nextPage()" [disabled]="endItem() === filteredLegajos().length" class="w-6 h-6 flex items-center justify-center border rounded bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer">
               <span class="material-icons-outlined text-sm">chevron_right</span>
             </button>
         </div>
      </div>

      <!-- Modal Alta/Edicion -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 class="text-xl font-bold text-slate-800">{{ isEditing() ? 'Editar Legajo' : 'Alta de Personal' }}</h3>
              <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
            </div>
            
            <form [formGroup]="empForm" (ngSubmit)="save()" class="p-6 space-y-4">
              <!-- Form fields -->
              <div class="grid grid-cols-4 gap-4">
                 <div class="col-span-1">
                   <label class="block text-xs font-bold text-slate-700 mb-1">Número Legajo</label>
                   <input formControlName="nroLegajo" type="text" class="w-full border-slate-300 rounded text-sm p-2 focus:ring-blue-500">
                </div>
                 <div class="col-span-1">
                   <label class="block text-xs font-bold text-slate-700 mb-1">CUIL (Sin guiones)</label>
                   <input formControlName="cuil" type="text" placeholder="20123456789" class="w-full border-slate-300 rounded text-sm p-2 focus:ring-blue-500">
                </div>
                 <div class="col-span-2">
                   <label class="block text-xs font-bold text-slate-700 mb-1">Fecha Ingreso</label>
                   <input formControlName="fechaIngreso" type="date" class="w-full border-slate-300 rounded text-sm p-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-1">
                   <label class="block text-xs font-bold text-slate-700 mb-1">Apellido</label>
                   <input formControlName="apellido" type="text" class="w-full border-slate-300 rounded text-sm p-2 uppercase focus:ring-blue-500">
                </div>
                <div class="col-span-1">
                   <label class="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
                   <input formControlName="nombre" type="text" class="w-full border-slate-300 rounded text-sm p-2 uppercase focus:ring-blue-500">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                 <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Sector</label>
                    <input formControlName="sector" list="sectoresList" type="text" placeholder="Ej: CHOFERES" class="w-full border-slate-300 rounded text-sm p-2 uppercase">
                    <datalist id="sectoresList">
                       <option value="ADMINISTRACIÓN">
                       <option value="CHOFERES">
                       <option value="UOCRA">
                       <option value="OBRA">
                       <option value="TECNICO">
                    </datalist>
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                    <input formControlName="categoria" type="text" placeholder="Ej: OFICIAL" class="w-full border-slate-300 rounded text-sm p-2 uppercase">
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Calificación Profesional</label>
                    <input formControlName="calificacionProfesional" type="text" class="w-full border-slate-300 rounded text-sm p-2 uppercase">
                 </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Básico / Jornal ($)</label>
                    <input formControlName="basicoJornal" type="number" step="0.01" class="w-full border-slate-300 rounded text-sm p-2">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Obra Actual</label>
                    <select formControlName="obraId" class="w-full border-slate-300 rounded text-sm p-2">
                      <option [ngValue]="null">-- Sin Asignar --</option>
                      @for (obra of dataService.obras(); track obra.id) {
                        <option [value]="obra.id">{{ obra.obra }}</option>
                      }
                    </select>
                 </div>
              </div>
              
              <div class="col-span-1">
                 <label class="block text-xs font-bold text-slate-700 mb-1">Dirección / Domicilio</label>
                 <input formControlName="direccion" type="text" class="w-full border-slate-300 rounded text-sm p-2 focus:ring-blue-500">
              </div>

              <div class="flex items-center gap-4 pt-2">
                 <div class="flex items-center gap-2">
                    <input formControlName="trabajoAntes" type="checkbox" id="trabajoAntes" class="w-4 h-4 text-blue-600 rounded">
                    <label for="trabajoAntes" class="text-xs text-slate-700 font-bold select-none cursor-pointer">¿Trabajó antes?</label>
                 </div>
                 <div class="flex items-center gap-2">
                    <input formControlName="activo" type="checkbox" id="activo" class="w-4 h-4 text-green-600 rounded">
                    <label for="activo" class="text-xs text-slate-700 font-bold select-none cursor-pointer">LEGAJO ACTIVO</label>
                 </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" (click)="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors">Cancelar</button>
                <button type="submit" [disabled]="empForm.invalid" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors shadow-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Biometric Enrollment Modal (Banking Style - Proof of Life) -->
      @if (showBiometricModal()) {
        <div class="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
           
           <!-- Header / Cancel -->
           <div class="absolute top-0 w-full p-4 flex justify-between items-center z-50">
              <span class="text-white/80 text-sm font-medium tracking-wide">Prueba de vida y Registro</span>
              <button (click)="closeBiometricModal()" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <span class="material-icons-outlined">close</span>
              </button>
           </div>

           <!-- The Camera & Mask Container -->
           <div class="relative w-full h-full flex flex-col items-center justify-center">
               
               <!-- Video Base -->
               <video #videoElement autoplay playsinline class="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"></video>
               
               <!-- Dark Overlay with Oval Cutout (SVG Mask) -->
               <div class="absolute inset-0 z-10 pointer-events-none">
                  <svg class="w-full h-full" preserveAspectRatio="none">
                     <defs>
                        <mask id="face-mask">
                           <rect width="100%" height="100%" fill="white"/>
                           <!-- The Oval Hole -->
                           <ellipse cx="50%" cy="45%" rx="140" ry="190" fill="black" />
                        </mask>
                     </defs>
                     <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.95)" mask="url(#face-mask)"/>
                     
                     <!-- Dynamic Border Ring around the hole -->
                     <ellipse cx="50%" cy="45%" rx="146" ry="196" fill="none" 
                              stroke-width="6"
                              [attr.stroke]="getBorderColor()"
                              class="transition-colors duration-500 ease-out"
                              [class.animate-pulse]="bioStep() === 'processing'"/>
                  </svg>
               </div>

               <!-- UI Elements on top of overlay -->
               <div class="absolute inset-0 z-20 flex flex-col items-center justify-between py-12 pointer-events-none">
                  
                  <!-- Top spacer -->
                  <div class="h-20"></div>

                  <!-- Feedback Area (Center of screen approx) -->
                  <div class="flex flex-col items-center justify-center gap-4 mt-[350px]"> <!-- Pushed down below the oval -->
                     
                     <!-- Dynamic Instruction Text -->
                     <h3 class="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md px-6 transition-all duration-300">
                        {{ bioInstruction() }}
                     </h3>

                     <!-- Step Indicators -->
                     @if (bioStep() !== 'success' && bioStep() !== 'start') {
                        <div class="flex gap-2">
                           <div class="w-2 h-2 rounded-full transition-colors duration-300" [class.bg-white]="bioStep() === 'center'" [class.bg-white/20]="bioStep() !== 'center'"></div>
                           <div class="w-2 h-2 rounded-full transition-colors duration-300" [class.bg-white]="bioStep() === 'left'" [class.bg-white/20]="bioStep() !== 'left'"></div>
                           <div class="w-2 h-2 rounded-full transition-colors duration-300" [class.bg-white]="bioStep() === 'right'" [class.bg-white/20]="bioStep() !== 'right'"></div>
                        </div>
                     }

                     <!-- Action Button (Only at start) -->
                     @if (bioStep() === 'start') {
                        <button (click)="startEnrollment()" class="pointer-events-auto mt-4 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-900/50 text-lg transition-transform hover:scale-105 active:scale-95">
                           Iniciar Enrolamiento
                        </button>
                     }

                     <!-- Success State -->
                     @if (bioStep() === 'success') {
                        <div class="flex flex-col items-center animate-in zoom-in duration-300">
                           <div class="bg-green-500 rounded-full p-4 mb-2 shadow-xl">
                              <span class="material-icons-outlined text-4xl text-white">check</span>
                           </div>
                           <p class="text-green-400 font-bold">Rostro Guardado</p>
                        </div>
                     }
                  </div>

                  <!-- Bottom branding/help -->
                  <div class="text-white/30 text-xs">
                     ConstructoraHR Security
                  </div>
               </div>
           </div>
        </div>
      }

    </div>
  `,
  styles: []
})
export class EmployeeManagerComponent implements OnDestroy {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  showModal = signal(false);
  isEditing = signal(false);
  showFilters = signal(false);
  selectedId = signal<string | null>(null);
  
  // Biometric State
  showBiometricModal = signal(false);
  currentBioLegajoId = signal<string|null>(null);
  bioStep = signal<'start' | 'center' | 'left' | 'right' | 'processing' | 'success'>('start');
  bioInstruction = signal('');
  
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  videoStream: MediaStream | null = null;
  
  // Sort State
  sortColumn = signal<keyof Legajo | ''>('nroLegajo');
  sortDirection = signal<'asc'|'desc'>('asc');

  // Pagination
  currentPage = signal(1);
  pageSize = 15;

  // Filter Models
  filters = {
    nroLegajo: '',
    apellido: '',
    nombre: '',
    cuil: '',
    calificacion: '',
    categoria: '',
    sector: ''
  };

  currentId: string | null = null;

  empForm = this.fb.group({
    nroLegajo: ['', Validators.required],
    apellido: ['', Validators.required],
    nombre: ['', Validators.required],
    cuil: [''],
    calificacionProfesional: [''],
    sector: [''],
    basicoJornal: [0],
    direccion: [''],
    categoria: ['', Validators.required],
    obraId: [null as string | null],
    trabajoAntes: [false],
    activo: [true],
    fechaIngreso: ['', Validators.required]
  });

  ngOnDestroy() {
     this.stopCamera();
  }

  // --- Helpers for Styling ---
  getInitials(name: string, surname: string): string {
    return ((name?.[0] || '') + (surname?.[0] || '')).toUpperCase();
  }

  getSectorStyles(sector?: string) {
      const s = (sector || '').toUpperCase().trim();
      let style = {
         bg: 'bg-slate-100',
         text: 'text-slate-700',
         border: 'border-l-slate-400',
         badge: 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-200',
         icon: 'badge'
      };

      if (s.includes('OBRA') || s.includes('UOCRA') || s.includes('OFICIAL') || s.includes('AYUDANTE') || s.includes('ALBAÑIL')) {
          style = { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'engineering' };
      } else if (s.includes('CHOFER') || s.includes('TRANSPORTE') || s.includes('LOGISTICA') || s.includes('CAMION')) {
          style = { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-l-blue-600', badge: 'bg-blue-100 text-blue-900 border-blue-300', icon: 'local_shipping' };
      } else if (s.includes('ADMIN') || s.includes('RRHH') || s.includes('OFICINA') || s.includes('GERENCIA')) {
          style = { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-l-purple-600', badge: 'bg-purple-100 text-purple-900 border-purple-300', icon: 'domain' };
      } else if (s.includes('TECNICO') || s.includes('SEGURIDAD') || s.includes('INGENIERO') || s.includes('ARQUITECTO')) {
          style = { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-l-emerald-600', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'health_and_safety' };
      }
      return style;
  }

  // Banking Style Border Colors
  getBorderColor() {
     switch(this.bioStep()) {
        case 'start': return 'white'; // Neutral
        case 'center': return '#3b82f6'; // Blue (Active)
        case 'left': return '#3b82f6'; 
        case 'right': return '#3b82f6';
        case 'processing': return '#fbbf24'; // Amber/Yellow
        case 'success': return '#22c55e'; // Green
        default: return 'white';
     }
  }

  // --- Computed Data Logic ---

  filteredLegajos = computed(() => {
    let data = this.dataService.legajos();
    const f = this.filters;

    if (f.nroLegajo) data = data.filter(l => l.nroLegajo.toLowerCase().includes(f.nroLegajo.toLowerCase()));
    if (f.apellido) data = data.filter(l => l.apellido.toLowerCase().includes(f.apellido.toLowerCase()) || l.nombre.toLowerCase().includes(f.apellido.toLowerCase()));
    if (f.nombre) data = data.filter(l => l.nombre.toLowerCase().includes(f.nombre.toLowerCase()));
    if (f.cuil) data = data.filter(l => (l.cuil || '').includes(f.cuil));
    if (f.calificacion) data = data.filter(l => (l.calificacionProfesional || '').toLowerCase().includes(f.calificacion.toLowerCase()));
    if (f.categoria) data = data.filter(l => l.categoria.toLowerCase().includes(f.categoria.toLowerCase()));
    if (f.sector) data = data.filter(l => (l.sector || '').toLowerCase().includes(f.sector.toLowerCase()));

    const col = this.sortColumn();
    const dir = this.sortDirection();
    
    if (col) {
      data = [...data].sort((a, b) => {
         const va = a[col] ?? '';
         const vb = b[col] ?? '';
         if (va < vb) return dir === 'asc' ? -1 : 1;
         if (va > vb) return dir === 'asc' ? 1 : -1;
         return 0;
      });
    }

    return data;
  });

  paginatedLegajos = computed(() => {
     const start = (this.currentPage() - 1) * this.pageSize;
     return this.filteredLegajos().slice(start, start + this.pageSize);
  });

  startItem = computed(() => (this.currentPage() - 1) * this.pageSize + 1);
  endItem = computed(() => Math.min(this.currentPage() * this.pageSize, this.filteredLegajos().length));

  // --- Actions ---

  toggleFilters() {
     this.showFilters.update(v => !v);
  }

  setSort(col: keyof Legajo) {
     if (this.sortColumn() === col) {
        this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
     } else {
        this.sortColumn.set(col);
        this.sortDirection.set('asc');
     }
  }

  prevPage() {
     if (this.currentPage() > 1) this.currentPage.update(c => c - 1);
  }

  nextPage() {
     if (this.endItem() < this.filteredLegajos().length) this.currentPage.update(c => c + 1);
  }

  selectRow(id: string) {
     this.selectedId.set(id === this.selectedId() ? null : id);
  }

  async deleteLegajo(id: string, event: Event) {
    event.stopPropagation();
    if(confirm('¿Está seguro de eliminar este empleado? Esta acción es irreversible.')) {
        await this.dataService.deleteLegajo(id);
        this.selectedId.set(null);
    }
  }

  openModal() {
    this.isEditing.set(false);
    this.empForm.reset();
    const nextLegajo = (this.dataService.legajos().length + 100).toString();
    this.empForm.patchValue({ 
      nroLegajo: nextLegajo,
      trabajoAntes: false,
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0]
    });
    this.showModal.set(true);
  }

  editSelected() {
     const id = this.selectedId();
     if (!id) return;
     const emp = this.dataService.legajos().find(e => e.id === id);
     if (emp) this.editEmployee(emp);
  }

  editEmployee(emp: Legajo) {
    this.isEditing.set(true);
    this.currentId = emp.id;
    this.empForm.patchValue({
      nroLegajo: emp.nroLegajo,
      apellido: emp.apellido,
      nombre: emp.nombre,
      cuil: emp.cuil,
      calificacionProfesional: emp.calificacionProfesional,
      sector: emp.sector,
      basicoJornal: emp.basicoJornal,
      direccion: emp.direccion,
      categoria: emp.categoria,
      obraId: emp.obraId || null,
      trabajoAntes: emp.trabajoAntes,
      activo: emp.activo,
      fechaIngreso: emp.fechaIngreso || ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentId = null;
  }

  save() {
    if (this.empForm.invalid) return;

    const val = this.empForm.value;
    const empData: any = {
       nroLegajo: val.nroLegajo || '',
       apellido: val.