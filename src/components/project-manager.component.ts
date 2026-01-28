
import { Component, inject, signal, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService, Obra } from '../services/data.service';
import { GeminiService } from '../services/gemini.service';

declare const L: any;

@Component({
  selector: 'app-project-manager',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
       <!-- Header -->
       <div class="flex justify-between items-center">
         <div>
            <h2 class="text-2xl font-bold text-slate-800">Obras y Proyectos</h2>
            <p class="text-sm text-slate-500" *ngIf="dataService.empresa() as emp">
               Empresa: <strong>{{ emp.nombre }}</strong>
            </p>
         </div>
         <div class="flex gap-2">
            <!-- Botón Configurar Empresa -->
            <button type="button" (click)="openCompanyModal()" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-medium cursor-pointer transition-colors active:bg-slate-100">
               <span class="material-icons-outlined text-orange-500">business</span> Configurar Empresa
            </button>
            
            <!-- Botón Nueva Obra -->
            <button type="button" (click)="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 cursor-pointer transition-colors active:bg-indigo-800">
               <span class="material-icons-outlined">add_business</span> Nueva Obra
            </button>
         </div>
       </div>
       
       <!-- Main Map View -->
       <div class="bg-white p-2 rounded-xl shadow-sm border border-slate-200 h-80 z-0 relative">
           <div id="mainMap" class="w-full h-full rounded-lg z-0"></div>
           
           <!-- Interactive Legend -->
           <div class="absolute bottom-4 left-4 bg-white/95 p-2 rounded shadow-md text-xs z-[1000] flex gap-3 border border-slate-200 backdrop-blur-sm">
              <button (click)="flyToCompany()" class="flex items-center gap-1 hover:bg-orange-50 px-2 py-1 rounded transition-colors cursor-pointer" title="Ir a Sede Central">
                 <span class="material-icons-outlined text-orange-500 text-sm">star</span>
                 <span class="font-bold text-slate-700">Sede Central</span>
              </button>
              <div class="w-px bg-slate-200 h-4 self-center"></div>
              <button (click)="flyToProjects()" class="flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer" title="Ver todas las obras">
                 <div class="w-3 h-3 bg-red-600 rounded-full border border-white shadow-sm"></div>
                 <span class="font-bold text-slate-700">Obras Activas</span>
              </button>
           </div>
       </div>

       <!-- Project List -->
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         @if (dataService.obras().length === 0) {
           <div class="col-span-full py-12 text-center bg-slate-50 border border-slate-200 rounded-xl border-dashed">
              <span class="material-icons-outlined text-4xl text-slate-300 mb-2">apartment</span>
              <p class="text-slate-500">No hay obras activas.</p>
           </div>
         }
         @for (obra of dataService.obras(); track obra.id) {
           <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
             
             <!-- Status Badge -->
             <div class="flex justify-between items-start mb-4">
               <div class="p-3 bg-orange-100 text-orange-600 rounded-lg">
                 <span class="material-icons-outlined">apartment</span>
               </div>
               <span [class]="getStatusColor(obra.estado)" class="text-xs px-2 py-1 rounded-full font-bold">
                  {{ obra.estado || 'Activa' }}
               </span>
             </div>
             
             <h3 class="text-lg font-bold text-slate-800 mb-1">{{ obra.obra }}</h3>
             
             <div class="space-y-1 mb-4">
                <p class="text-sm text-slate-500 flex items-start gap-1">
                  <span class="material-icons-outlined text-xs mt-0.5">location_on</span> 
                  <span>
                    {{ obra.direccion || 'Sin dirección' }} 
                    <br>
                    <span class="text-xs text-slate-400">{{ obra.localidad }}, {{ obra.provincia }}</span>
                  </span>
                </p>
             </div>

             <div class="pt-4 border-t border-slate-100 text-sm flex justify-between items-center">
                <div>
                   <span class="text-slate-500 text-xs block">Personal Asignado</span>
                   <span class="font-medium text-slate-700 text-lg">
                     {{ getEmployeeCount(obra.id) }}
                   </span>
                </div>
                <div class="flex gap-2">
                   <button (click)="deleteObra(obra, $event)" class="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 p-2 rounded-full transition-colors z-10 relative cursor-pointer shadow-sm" title="Eliminar Obra">
                      <span class="material-icons-outlined">delete</span>
                   </button>
                   <button (click)="editObra(obra)" class="bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 p-2 rounded-full transition-colors z-10 relative cursor-pointer shadow-sm">
                      <span class="material-icons-outlined">edit</span>
                   </button>
                </div>
             </div>
           </div>
         }
       </div>

       <!-- Modal Obra -->
       @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 class="text-xl font-bold text-slate-800">{{ isEditing() ? 'Editar Obra' : 'Nueva Obra' }}</h3>
              <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
            </div>
            
            <form [formGroup]="projectForm" (ngSubmit)="save()" class="p-6 space-y-4 overflow-y-auto">
              
              <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nombre de la Obra</label>
                    <input formControlName="obra" type="text" placeholder="Ej: Edificio Torre Norte" class="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select formControlName="estado" class="w-full border-slate-300 rounded-lg shadow-sm">
                       <option value="Activa">Activa</option>
                       <option value="Pausada">Pausada</option>
                       <option value="Finalizada">Finalizada</option>
                    </select>
                 </div>
              </div>

              <!-- Location Section with Map Integration -->
              <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                 <h4 class="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span class="material-icons-outlined text-indigo-500">map</span> Ubicación Geográfica
                 </h4>
                 
                 <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-xs font-medium text-slate-500 mb-1">Localidad (PRIORITARIO)</label>
                        <input formControlName="localidad" type="text" placeholder="Ej: Santa Fe" class="w-full border-slate-300 rounded text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold bg-white border-l-4 border-l-indigo-400">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-500 mb-1">Provincia</label>
                        <select formControlName="provincia" class="w-full border-slate-300 rounded text-sm">
                           <option value="Buenos Aires">Buenos Aires</option>
                           <option value="CABA">CABA</option>
                           <option value="Santa Fe">Santa Fe</option>
                           <option value="Córdoba">Córdoba</option>
                           <!-- ... more provinces ... -->
                        </select>
                    </div>
                 </div>

                 <!-- Unified Address Field -->
                 <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">Dirección (Calle y Número)</label>
                    <input formControlName="direccion" type="text" placeholder="Ej: San Martin 1709" class="w-full border-slate-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500">
                 </div>

                 <!-- Button to sync Address -> Map -->
                 <button type="button" (click)="geocodeAddress()" class="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-bold shadow-sm hover:bg-indigo-100 flex justify-center items-center gap-1 transition-colors">
                     <span class="material-icons-outlined text-sm">search</span> Buscar en Mapa (Prioriza Localidad)
                 </button>

                 <!-- Picker Map -->
                 <div class="h-56 w-full rounded border border-slate-300 relative z-0 shadow-inner">
                    <div id="pickerMap" class="w-full h-full rounded z-0"></div>
                 </div>
                 
                 <!-- AI Location Analysis Button -->
                 <button type="button" (click)="analyzeLocation()" [disabled]="isAnalyzing()" class="w-full mt-2 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded text-xs font-bold shadow hover:opacity-90 flex justify-center items-center gap-2">
                    <span class="material-icons-outlined text-sm">smart_toy</span> 
                    {{ isAnalyzing() ? 'Analizando zona con Gemini...' : 'Analizar Zona con IA' }}
                 </button>
                 
                 @if (aiLocationReport()) {
                    <div class="mt-2 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 italic">
                       <strong>Reporte de Zona (IA):</strong> {{ aiLocationReport() }}
                    </div>
                 }
              </div>

              <div>
                 <label class="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                 <input formControlName="fechaInicio" type="date" class="w-full border-slate-300 rounded-lg shadow-sm">
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" (click)="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" [disabled]="projectForm.invalid" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }

       <!-- Modal Configuración Empresa (Existing Code) -->
       @if (showCompanyModal()) {
        <div class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
               <div class="flex items-center gap-2">
                   <span class="material-icons-outlined text-orange-500">business</span>
                   <h3 class="text-xl font-bold text-slate-800">Datos de la Empresa</h3>
               </div>
              <button (click)="closeCompanyModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
            </div>
            
            <form [formGroup]="companyForm" (ngSubmit)="saveCompany()" class="p-6 space-y-4 overflow-y-auto">
               <div>
                 <label class="block text-sm font-medium text-slate-700 mb-1">Razón Social / Nombre</label>
                 <input formControlName="nombre" type="text" class="w-full border-slate-300 rounded-lg shadow-sm focus:ring-orange-500">
               </div>
               
               <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Localidad (PRIORITARIO)</label>
                    <input formControlName="localidad" type="text" placeholder="Ej: Santa Fe" class="w-full border-slate-300 rounded-lg shadow-sm focus:ring-orange-500 font-bold bg-white border-l-4 border-l-orange-400">
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Dirección (Calle/Nro)</label>
                    <input formControlName="direccion" type="text" placeholder="Ej: San Martin 1709" class="w-full border-slate-300 rounded-lg shadow-sm focus:ring-orange-500">
                 </div>
               </div>
               
                <!-- Picker Map Empresa -->
                 <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label class="block text-xs font-bold text-slate-600 mb-2">Ubicación Sede Central (Pinche Estrella)</label>
                    <button type="button" (click)="geocodeCompany()" class="w-full mb-3 py-2 bg-orange-50 border border-orange-200 text-orange-800 rounded text-xs font-bold hover:bg-orange-100 flex justify-center items-center gap-2">
                        <span class="material-icons-outlined text-sm">search</span> Buscar en Mapa
                    </button>
                    <div class="h-40 w-full rounded border border-slate-300 relative z-0 shadow-inner">
                        <div id="companyMap" class="w-full h-full rounded z-0"></div>
                    </div>
                 </div>

               <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                 <button type="button" (click)="closeCompanyModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                 <button type="submit" [disabled]="companyForm.invalid" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-bold">Guardar Datos</button>
               </div>
            </form>
          </div>
        </div>
       }
    </div>
  `
})
export class ProjectManagerComponent implements AfterViewInit, OnDestroy {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);
  fb = inject(FormBuilder);

  showModal = signal(false);
  showCompanyModal = signal(false);
  isEditing = signal(false);
  currentId: string | null = null;
  
  // AI State
  isAnalyzing = signal(false);
  aiLocationReport = signal('');
  
  // Maps Instances
  mainMap: any;
  pickerMap: any;
  companyMap: any;
  
  pickerMarker: any;
  companyMarker: any;
  mainMarkers: any[] = [];

  // Custom Icons (Existing)
  redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  starIcon = L.divIcon({
     className: 'custom-div-icon',
     html: "<div style='background-color: #fbbf24; border: 2px solid #d97706; border-radius: 50%; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);'><span class='material-icons-outlined' style='color: white; font-size: 20px;'>star</span></div>",
     iconSize: [32, 32],
     iconAnchor: [16, 16]
  });

  projectForm = this.fb.group({
     obra: ['', Validators.required],
     direccion: ['', Validators.required],
     localidad: ['', Validators.required], 
     provincia: ['Buenos Aires'],
     fechaInicio: [new Date().toISOString().split('T')[0]],
     estado: ['Activa'],
     lat: [0],
     lng: [0]
  });

  companyForm = this.fb.group({
     nombre: ['', Validators.required],
     direccion: ['', Validators.required],
     localidad: ['', Validators.required],
     lat: [-34.60],
     lng: [-58.38]
  });

  constructor() {
    effect(() => {
        const ob = this.dataService.obras();
        const em = this.dataService.empresa();
        this.refreshMainMapMarkers();
    });
  }

  ngAfterViewInit() {
    this.initMainMap();
  }
  
  ngOnDestroy() {
    if (this.mainMap) { this.mainMap.remove(); }
    if (this.pickerMap) { this.pickerMap.remove(); }
    if (this.companyMap) { this.companyMap.remove(); }
  }

  initMainMap() {
    const startLat = -34.6037;
    const startLng = -58.3816;
    
    this.mainMap = L.map('mainMap').setView([startLat, startLng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM' }).addTo(this.mainMap);
    this.refreshMainMapMarkers();
  }

  refreshMainMapMarkers() {
     if (!this.mainMap) return;
     this.mainMarkers.forEach(m => this.mainMap.removeLayer(m));
     this.mainMarkers = [];

     const bounds = L.latLngBounds([]);
     const emp = this.dataService.empresa();
     
     if (emp && emp.lat && emp.lng) {
         const hqMarker = L.marker([emp.lat, emp.lng], { icon: this.starIcon })
           .addTo(this.mainMap)
           .bindPopup(`<b>${emp.nombre}</b><br><span style="font-size:10px; color:#666;">SEDE CENTRAL</span>`);
         this.mainMarkers.push(hqMarker);
         bounds.extend([emp.lat, emp.lng]);
     }

     const obras = this.dataService.obras();
     obras.forEach(obra => {
        if (obra.lat && obra.lng) {
            const marker = L.marker([obra.lat, obra.lng], { icon: this.redIcon })
              .addTo(this.mainMap)
              .bindPopup(`<b>${obra.obra}</b><br>${obra.direccion || ''}`);
            this.mainMarkers.push(marker);
            bounds.extend([obra.lat, obra.lng]);
        }
     });

     if (obras.length > 0 || (emp && emp.lat)) {
        this.mainMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
     }
  }

  flyToCompany() {
      const emp = this.dataService.empresa();
      if (emp && emp.lat && emp.lng) this.mainMap.flyTo([emp.lat, emp.lng], 14, { duration: 1.5 });
  }

  flyToProjects() {
      const obras = this.dataService.obras();
      if (obras.length === 0) return;
      const bounds = L.latLngBounds([]);
      obras.forEach(o => { if (o.lat && o.lng) bounds.extend([o.lat, o.lng]); });
      this.mainMap.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1.5 });
  }

  openCompanyModal() {
      const emp = this.dataService.empresa();
      this.companyForm.patchValue({
          nombre: emp?.nombre || '',
          direccion: emp?.direccion || '',
          localidad: emp?.localidad || '',
          lat: emp?.lat || -34.6037,
          lng: emp?.lng || -58.3816
      });
      this.showCompanyModal.set(true);
      setTimeout(() => this.initCompanyMap(), 100);
  }

  closeCompanyModal() {
      this.showCompanyModal.set(false);
      if (this.companyMap) { this.companyMap.remove(); this.companyMap = null; }
  }

  initCompanyMap() {
      if (this.companyMap) { this.companyMap.remove(); this.companyMap = null; }
      const element = document.getElementById('companyMap');
      if (!element) return;
      const lat = this.companyForm.get('lat')?.value || -34.60;
      const lng = this.companyForm.get('lng')?.value || -58.38;
      this.companyMap = L.map('companyMap').setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.companyMap);
      this.companyMarker = L.marker([lat, lng], { draggable: true, icon: this.starIcon }).addTo(this.companyMap);
      this.companyMarker.on('dragend', (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          this.companyForm.patchValue({ lat, lng });
      });
      this.companyMap.on('click', (e: any) => {
          this.companyMarker.setLatLng(e.latlng);
          this.companyForm.patchValue({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      setTimeout(() => { this.companyMap.invalidateSize(); }, 200);
  }

  async geocodeGeneric(form: FormGroup, mapInstance: any, markerInstance: any) {
     const val = form.value;
     if (!val.localidad || !val.direccion) { alert("Ingrese Dirección y Localidad"); return; }
     const params = new URLSearchParams({ street: val.direccion, city: val.localidad, state: val.provincia || '', country: 'Argentina', format: 'json', limit: '1' });
     try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
        const data = await res.json();
        if (data && data.length > 0) {
            this.updateMap(form, mapInstance, markerInstance, data[0].lat, data[0].lon);
        } else {
            alert('Dirección no encontrada. Verifique la localidad.');
        }
     } catch (e) { alert("Error de conexión mapa."); }
  }

  updateMap(form: FormGroup, map: any, marker: any, lat: any, lng: any) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      form.patchValue({ lat: latNum, lng: lngNum });
      if (map && marker) {
          marker.setLatLng([latNum, lngNum]);
          map.setView([latNum, lngNum], 16);
      }
  }
  
  geocodeAddress() { this.geocodeGeneric(this.projectForm, this.pickerMap, this.pickerMarker); }
  geocodeCompany() { this.geocodeGeneric(this.companyForm, this.companyMap, this.companyMarker); }

  async analyzeLocation() {
      const val = this.projectForm.value;
      if (!val.direccion || !val.localidad) {
          alert('Ingrese dirección y localidad primero.');
          return;
      }
      this.isAnalyzing.set(true);
      const report = await this.geminiService.analyzeLocationContext(val.direccion, val.localidad);
      this.aiLocationReport.set(report);
      this.isAnalyzing.set(false);
  }

  saveCompany() {
      if (this.companyForm.invalid) return;
      let emp = this.dataService.empresa();
      const user = this.dataService.currentUser();
      if (!emp && user) emp = { id: user.empresaId, nombre: '', direccion: '', localidad: '' };
      if (!emp) return;
      const val = this.companyForm.value;
      this.dataService.updateEmpresa({ ...emp, nombre: val.nombre!, direccion: val.direccion || '', localidad: val.localidad || '', lat: val.lat!, lng: val.lng! });
      this.closeCompanyModal();
  }

  openModal() {
     this.isEditing.set(false);
     this.aiLocationReport.set('');
     this.projectForm.reset({ provincia: 'Buenos Aires', fechaInicio: new Date().toISOString().split('T')[0], estado: 'Activa', lat: -34.6037, lng: -58.3816 });
     this.showModal.set(true);
     setTimeout(() => this.initPickerMap(), 100);
  }

  editObra(obra: Obra) {
     this.isEditing.set(true);
     this.aiLocationReport.set('');
     this.currentId = obra.id;
     this.projectForm.patchValue({ ...obra });
     this.showModal.set(true);
     setTimeout(() => this.initPickerMap(), 100);
  }

  async deleteObra(obra: Obra, event?: Event) {
     if (event) event.stopPropagation();
     if(confirm(`Eliminar Obra ${obra.obra}?`)) await this.dataService.deleteObra(obra.id);
  }

  initPickerMap() {
     if (this.pickerMap) this.pickerMap.remove();
     const currentLat = this.projectForm.get('lat')?.value || -34.6037;
     const currentLng = this.projectForm.get('lng')?.value || -58.3816;
     this.pickerMap = L.map('pickerMap').setView([currentLat, currentLng], 13);
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.pickerMap);
     this.pickerMarker = L.marker([currentLat, currentLng], { draggable: true, icon: this.redIcon }).addTo(this.pickerMap);
     this.pickerMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.projectForm.patchValue({ lat: pos.lat, lng: pos.lng });
     });
     this.pickerMap.on('click', (e: any) => {
        this.pickerMarker.setLatLng(e.latlng);
        this.projectForm.patchValue({ lat: e.latlng.lat, lng: e.latlng.lng });
     });
  }

  getEmployeeCount(obraId: string) { return this.dataService.legajos().filter(e => e.obraId === obraId).length; }
  
  getStatusColor(status?: string) {
     if (status === 'Activa') return 'bg-green-100 text-green-700';
     if (status === 'Pausada') return 'bg-yellow-100 text-yellow-700';
     return 'bg-slate-100 text-slate-700';
  }
}
