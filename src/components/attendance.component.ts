
import { Component, inject, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Obra, Legajo } from '../services/data.service';

declare const L: any;

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      <!-- Header with Action Button -->
      <div class="flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
         <div>
             <h2 class="text-2xl font-bold text-slate-800">Control de Asistencia</h2>
             <div class="flex items-center gap-2 text-sm text-slate-500">
                <span class="material-icons-outlined text-sm">today</span>
                {{ today | date:'fullDate' }}
             </div>
         </div>
         
         <!-- NEW BUTTON: Biometric Terminal -->
         <button (click)="openKioskMode()" class="group relative overflow-hidden bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-slate-700">
             <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
             <div class="relative flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors">
                    <span class="material-icons-outlined animate-pulse">face_retouching_natural</span>
                 </div>
                 <div class="text-left">
                    <p class="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Modo Terminal</p>
                    <p class="font-bold leading-none">Fichar con Cámara + GPS</p>
                 </div>
             </div>
         </button>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          <!-- Employee List Panel -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 class="font-bold text-slate-700 flex items-center gap-2">
                    <span class="material-icons-outlined">groups</span> Personal Activo
                </h3>
                <span class="text-xs bg-white border px-2 py-1 rounded text-slate-500">{{ dataService.legajos().length }}</span>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                @if (dataService.legajos().length === 0) {
                    <div class="p-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg m-2">
                        Sin empleados registrados.
                    </div>
                }
                @for (emp of dataService.legajos(); track emp.id) {
                    <div class="p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden">
                        <div class="flex items-center gap-3 relative z-10">
                            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                {{ emp.nombre.charAt(0) }}{{ emp.apellido.charAt(0) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-slate-800 text-sm truncate">{{ emp.apellido }}, {{ emp.nombre }}</p>
                                <p class="text-[10px] text-slate-500 font-mono">ID: {{ emp.nroLegajo }}</p>
                            </div>
                            
                            <!-- Individual Action Buttons -->
                            @if (isWorking(emp.id)) {
                                <button (click)="verifyIdentityAndClock(emp.id, 'out')" class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors" title="Marcar Salida">
                                    <span class="material-icons-outlined text-sm">logout</span>
                                </button>
                            } @else {
                                <button (click)="verifyIdentityAndClock(emp.id, 'in')" class="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors" title="Marcar Entrada">
                                    <span class="material-icons-outlined text-sm">login</span>
                                </button>
                            }
                        </div>
                        <!-- Status Indicator Stripe -->
                        <div class="absolute left-0 top-0 bottom-0 w-1" [class]="isWorking(emp.id) ? 'bg-green-500' : 'bg-slate-300'"></div>
                    </div>
                }
            </div>
          </div>

          <!-- Log Table Panel -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
               <h3 class="font-bold text-slate-700">Historial de Fichadas (Tiempo Real)</h3>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-white sticky top-0 z-10 shadow-sm text-xs uppercase text-slate-400 font-bold tracking-wider">
                        <tr>
                            <th class="px-6 py-3 bg-slate-50">Empleado</th>
                            <th class="px-6 py-3 bg-slate-50">Horario</th>
                            <th class="px-6 py-3 bg-slate-50">Ubicación GPS</th>
                            <th class="px-6 py-3 bg-slate-50 text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @if (dataService.fichadas().length === 0) {
                            <tr><td colspan="4" class="p-8 text-center text-slate-400 italic">No hay actividad hoy.</td></tr>
                        }
                        @for (fich of dataService.fichadas(); track fich.id) {
                            <tr class="hover:bg-blue-50/30 transition-colors">
                                <td class="px-6 py-3">
                                    <div class="font-bold text-slate-700">{{ getLegajoName(fich.legajoId) }}</div>
                                    <div class="text-[10px] text-slate-400 font-mono">Legajo #{{ getLegajoNro(fich.legajoId) }}</div>
                                </td>
                                <td class="px-6 py-3">
                                    <div class="flex flex-col">
                                        <div class="flex items-center gap-1 text-green-700">
                                            <span class="material-icons-outlined text-[10px]">login</span> 
                                            <span class="font-mono font-bold">{{ fich.entrada | date:'HH:mm' }}</span>
                                        </div>
                                        @if (fich.salida) {
                                            <div class="flex items-center gap-1 text-red-700 mt-1">
                                                <span class="material-icons-outlined text-[10px]">logout</span> 
                                                <span class="font-mono font-bold">{{ fich.salida | date:'HH:mm' }}</span>
                                            </div>
                                        }
                                    </div>
                                </td>
                                <td class="px-6 py-3">
                                    <div class="flex items-center gap-2">
                                        <span class="material-icons-outlined text-indigo-400 text-lg">location_on</span>
                                        <div>
                                            <p class="text-xs font-bold text-slate-700">{{ fich.ubicacionNombre || 'Ubicación Remota' }}</p>
                                            <p class="text-[10px] text-slate-400 font-mono">Lat: {{ fich.latitud | number:'1.4-4' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-3 text-right">
                                    <span [class]="fich.salida ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700 animate-pulse'" class="px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-transparent">
                                        {{ fich.salida ? 'Finalizado' : 'En Obra' }}
                                    </span>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
          </div>

      </div>
      
      <!-- BIOMETRIC + GPS SCANNER MODAL -->
      @if (showVerifyModal()) {
        <div class="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center font-sans overflow-hidden animate-in fade-in duration-300">
           
           <!-- Header Overlay -->
           <div class="absolute top-0 w-full p-4 z-50 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
              <div class="pointer-events-auto">
                  <div class="flex items-center gap-2 text-white mb-1">
                      <span class="material-icons-outlined text-blue-400" [class.animate-spin-slow]="verificationStatus() === 'scanning'">linked_camera</span>
                      <span class="font-bold tracking-widest text-sm uppercase">Terminal Biométrica</span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-mono">GPS + FACE DETECTION REQUIRED</p>
              </div>
              <button (click)="closeVerifyModal()" class="pointer-events-auto text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all">
                 <span class="material-icons-outlined">close</span>
              </button>
           </div>

           <!-- SPLIT SCREEN UI -->
           <div class="relative w-full h-full flex flex-col md:flex-row">
               
               <!-- LEFT/TOP: CAMERA + FACE MESH -->
               <div class="flex-1 relative bg-black overflow-hidden border-b md:border-b-0 md:border-r border-slate-800 group">
                   <video #verifyVideo autoplay playsinline class="w-full h-full object-cover transform scale-x-[-1]"></video>
                   
                   <!-- Tech HUD Overlay -->
                   <div class="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                      <!-- Face Target Box -->
                      <div class="relative w-64 h-80 border-2 rounded-3xl flex items-center justify-center overflow-hidden transition-colors duration-300"
                           [class.border-blue-500]="verificationStatus() === 'scanning'"
                           [class.border-green-500]="verificationStatus() === 'success'"
                           [class.border-red-500]="verificationStatus() === 'fail'">
                          
                          <!-- Corners -->
                          <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4" [class.border-blue-500]="verificationStatus() === 'scanning'" [class.border-green-500]="verificationStatus() === 'success'"></div>
                          <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4" [class.border-blue-500]="verificationStatus() === 'scanning'" [class.border-green-500]="verificationStatus() === 'success'"></div>
                          <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4" [class.border-blue-500]="verificationStatus() === 'scanning'" [class.border-green-500]="verificationStatus() === 'success'"></div>
                          <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4" [class.border-blue-500]="verificationStatus() === 'scanning'" [class.border-green-500]="verificationStatus() === 'success'"></div>
                          
                          <!-- Scanning Laser Line -->
                          @if(verificationStatus() === 'scanning') {
                             <div class="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                          }

                          <!-- Face Outline SVG -->
                          <svg viewBox="0 0 200 250" class="w-full h-full opacity-30 animate-pulse fill-none stroke-current stroke-1"
                               [class.text-blue-300]="verificationStatus() === 'scanning'"
                               [class.text-green-300]="verificationStatus() === 'success'">
                              <path d="M50,100 Q100,150 150,100 T50,100" /> 
                              <circle cx="70" cy="90" r="10" /> 
                              <circle cx="130" cy="90" r="10" /> 
                              <path d="M100,90 L100,130" /> 
                              <rect x="40" y="40" width="120" height="180" rx="60" class="stroke-dashed" stroke-dasharray="5,5" />
                          </svg>
                      </div>
                      
                      <!-- Face Analysis Text -->
                      <div class="absolute bottom-10 bg-black/60 backdrop-blur px-4 py-2 rounded border border-white/10 text-xs font-mono">
                          @if(verificationStatus() === 'scanning') {
                              <span class="text-blue-300 animate-pulse">ESPERANDO IDENTIFICACIÓN...</span>
                          } @else if (verificationStatus() === 'success') {
                              <span class="text-green-400 font-bold">IDENTIDAD CONFIRMADA</span>
                          } @else if (verificationStatus() === 'fail') {
                              <span class="text-red-400 font-bold">EMPLEADO NO ENCONTRADO</span>
                          }
                      </div>
                   </div>
               </div>

               <!-- RIGHT/BOTTOM: CONTROLS & MAP -->
               <div class="h-auto md:w-96 bg-slate-900 relative flex flex-col border-l border-slate-800">
                   
                   <!-- Mini Map -->
                   <div class="h-40 relative z-0 border-b border-slate-800 bg-slate-950">
                       <div id="verifyMap" class="w-full h-full grayscale opacity-60"></div>
                       <div class="absolute bottom-2 right-2 z-10 bg-black/80 text-[10px] text-white px-2 py-1 rounded border border-slate-700 font-mono">
                           @if(currentLat()) {
                               LAT: {{ currentLat() | number:'1.4-4' }} <br> LNG: {{ currentLng() | number:'1.4-4' }}
                           } @else {
                               BUSCANDO SEÑAL GPS...
                           }
                       </div>
                   </div>

                   <!-- Interaction Panel -->
                   <div class="flex-1 p-6 flex flex-col justify-center space-y-6">
                       
                       @if (verificationStatus() === 'success' && detectedEmployee()) {
                           <!-- SUCCESS STATE -->
                           <div class="text-center animate-in slide-in-from-bottom duration-500">
                               <div class="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] border-4 border-slate-900">
                                   <span class="material-icons-outlined text-4xl text-white">check</span>
                               </div>
                               <h3 class="text-white font-bold text-xl mb-1">Hola, {{ detectedEmployee()?.nombre }}</h3>
                               <p class="text-slate-400 text-sm mb-6">Fichada registrada en {{ nearestProject()?.name || 'Sitio Remoto' }}</p>
                               
                               <div class="bg-slate-800 rounded p-3 text-xs text-left mb-4 font-mono text-slate-300 border border-slate-700">
                                  <div class="flex justify-between"><span>HORA:</span> <span class="text-white">{{ today | date:'HH:mm:ss' }}</span></div>
                                  <div class="flex justify-between"><span>GPS:</span> <span class="text-green-400">PRECISIÓN ALTA</span></div>
                                  <div class="flex justify-between"><span>ESTADO:</span> <span class="text-white">{{ isWorking(detectedEmployee()?.id!) ? 'SALIDA' : 'ENTRADA' }}</span></div>
                               </div>

                               <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                   <div class="h-full bg-green-500 animate-[progress_2s_ease-out_forwards]" style="width: 0%"></div>
                               </div>
                           </div>
                       } @else {
                           <!-- INPUT STATE -->
                           <div>
                               <label class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Identificación de Empleado</label>
                               <div class="relative">
                                   <span class="material-icons-outlined absolute left-3 top-3 text-slate-500">badge</span>
                                   <input type="text" 
                                          [(ngModel)]="manualLegajoInput" 
                                          (keyup.enter)="manualIdentify()"
                                          placeholder="Ingrese N° Legajo" 
                                          class="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg placeholder-slate-600 transition-all">
                               </div>
                               <p class="text-[10px] text-slate-500 mt-2 text-center">
                                  Ingrese su número de legajo para validar con la cámara.
                               </p>
                           </div>

                           <div class="space-y-3">
                               <button (click)="manualIdentify()" 
                                       [disabled]="!currentLat() || !manualLegajoInput"
                                       class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 group">
                                   <span class="material-icons-outlined group-hover:scale-110 transition-transform">camera</span>
                                   VALIDAR Y FICHAR
                               </button>

                               @if(!currentLat()) {
                                   <div class="flex items-center justify-center gap-2 text-orange-400 text-xs animate-pulse">
                                       <span class="material-icons-outlined text-sm">satellite_alt</span>
                                       Esperando señal GPS...
                                   </div>
                               } @else {
                                   <div class="flex items-center justify-center gap-2 text-green-500 text-xs">
                                       <span class="material-icons-outlined text-sm">my_location</span>
                                       Ubicación Confirmada
                                   </div>
                               }
                           </div>
                       }
                   </div>
               </div>

           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes scan {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    .animate-spin-slow {
        animation: spin 3s linear infinite;
    }
  `]
})
export class AttendanceComponent implements OnDestroy {
  dataService = inject(DataService);
  today = new Date();
  
  showVerifyModal = signal(false);
  verificationStatus = signal<'scanning' | 'success' | 'fail'>('scanning');
  geoError = signal<string | null>(null);
  
  // States specific for Kiosk Mode or Manual Mode
  isKiosk = signal(false);
  pendingAction: { legajoId: string, type: 'in' | 'out' } | null = null;
  detectedEmployee = signal<Legajo | null>(null);
  manualLegajoInput = '';
  
  // Location Data
  currentLat = signal<number | null>(null);
  currentLng = signal<number | null>(null);
  nearestProject = signal<{ name: string, distance: number } | null>(null);

  @ViewChild('verifyVideo') verifyVideo!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  map: any;

  // Helpers
  isWorking(empId: string) { return this.dataService.fichadas().some(f => f.legajoId === empId && !f.salida); }
  getLegajoNro(id: string): string { const l = this.dataService.legajos().find(x => x.id === id); return l ? l.nroLegajo : '???'; }
  getLegajoName(id: string): string { const l = this.dataService.legajos().find(x => x.id === id); return l ? `${l.apellido}, ${l.nombre}` : 'Desconocido'; }

  // 1. Manual Entry (from list)
  verifyIdentityAndClock(legajoId: string, type: 'in' | 'out') {
      this.isKiosk.set(false);
      this.pendingAction = { legajoId, type };
      this.manualLegajoInput = this.getLegajoNro(legajoId); // Pre-fill
      this.launchScanner();
  }

  // 2. Kiosk Entry (Big Button)
  openKioskMode() {
      if (this.dataService.legajos().length === 0) {
          alert("No hay empleados para escanear. Registre personal primero.");
          return;
      }
      this.isKiosk.set(true);
      this.pendingAction = null;
      this.manualLegajoInput = '';
      this.launchScanner();
  }

  // Common Scanner Launcher
  private launchScanner() {
      this.showVerifyModal.set(true);
      this.verificationStatus.set('scanning');
      this.geoError.set(null);
      this.nearestProject.set(null);
      this.detectedEmployee.set(null);

      this.startCamera();
      this.initLocationSequence();
  }

  initLocationSequence() {
      if (!navigator.geolocation) {
          this.geoError.set('Geolocalización no soportada.');
          alert("Su dispositivo no soporta GPS. No se puede fichar.");
          return;
      }

      navigator.geolocation.getCurrentPosition(
          (pos) => {
              this.currentLat.set(pos.coords.latitude);
              this.currentLng.set(pos.coords.longitude);
              
              this.checkProximity(pos.coords.latitude, pos.coords.longitude);
              setTimeout(() => this.initMap(), 100);
          },
          (err) => {
              console.error(err);
              this.geoError.set('GPS requerido para fichar.');
              alert("Debe permitir el acceso a la ubicación para registrar asistencia.");
          },
          { enableHighAccuracy: true, timeout: 15000 }
      );
  }

  // Nueva lógica real: Usuario ingresa ID -> Click Validar -> Captura Foto -> Ficha
  manualIdentify() {
      if (!this.manualLegajoInput) return;
      if (!this.currentLat()) {
         alert("Esperando señal GPS...");
         return;
      }

      // 1. Buscar Empleado
      const emp = this.dataService.legajos().find(l => l.nroLegajo === this.manualLegajoInput.trim());
      
      if (!emp) {
         this.verificationStatus.set('fail');
         setTimeout(() => this.verificationStatus.set('scanning'), 2000);
         return;
      }

      // 2. Simular/Realizar validación de rostro (snapshot)
      // Aquí tomaríamos la foto real del canvas para guardarla como prueba
      this.captureSnapshot(); 

      // 3. Éxito
      this.detectedEmployee.set(emp);
      this.verificationStatus.set('success');

      // 4. Determinar Acción (Entrada/Salida)
      let actionType: 'in' | 'out' = 'in';
      if (this.isWorking(emp.id)) {
          actionType = 'out';
      }

      // 5. Ejecutar Fichada con delay para mostrar feedback visual
      setTimeout(() => {
          this.executeClock(emp.id, actionType);
          setTimeout(() => this.closeVerifyModal(), 2000);
      }, 1500);
  }

  captureSnapshot() {
      // Logic placeholder to grab frame from this.verifyVideo.nativeElement
      // In a real app, this base64 string would be sent to DataService.clockIn
  }

  checkProximity(lat: number, lng: number) {
      const obras = this.dataService.obras();
      let nearest: Obra | null = null;
      let minDst = Infinity;

      obras.forEach(o => {
          if (o.lat && o.lng) {
              const dst = this.dataService.calculateDistance(lat, lng, o.lat, o.lng);
              if (dst < minDst) {
                  minDst = dst;
                  nearest = o;
              }
          }
      });

      if (nearest && minDst < 3000) { 
          this.nearestProject.set({ name: (nearest as Obra).obra, distance: minDst });
      } else {
          this.nearestProject.set(null);
      }
  }

  initMap() {
      if (this.map) { this.map.remove(); this.map = null; }
      const lat = this.currentLat();
      const lng = this.currentLng();
      if (!lat || !lng) return;

      this.map = L.map('verifyMap', { zoomControl: false, attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(this.map); // Dark Map

      // User Dot
      const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color: #3b82f6; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #3b82f6;'></div>",
          iconSize: [12, 12]
      });
      L.marker([lat, lng], { icon: userIcon }).addTo(this.map);
  }
  
  executeClock(legajoId: string, type: 'in' | 'out') {
      const locationName = this.nearestProject() ? this.nearestProject()?.name : 'Ubicación Remota';
      if (type === 'in') {
          this.dataService.clockIn(legajoId, this.currentLat() || 0, this.currentLng() || 0, locationName);
      } else {
          this.dataService.clockOut(legajoId, this.currentLat() || 0, this.currentLng() || 0);
      }
  }
  
  async startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Navegador no compatible con cámara.");
          return;
      }
      try {
          this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          setTimeout(() => {
              if (this.verifyVideo) this.verifyVideo.nativeElement.srcObject = this.stream;
          }, 100);
      } catch (err) { 
          console.error("Camera error", err); 
          alert("Error de Cámara: Verifique permisos del navegador.");
      }
  }
  
  closeVerifyModal() {
      if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
      }
      if (this.map) { this.map.remove(); this.map = null; }
      this.showVerifyModal.set(false);
  }
  
  ngOnDestroy() { this.closeVerifyModal(); }
}
