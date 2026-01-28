
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-news-expirations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-100px)] space-y-4">
      
      <!-- Top Header / Tabs -->
      <div class="bg-white border-b border-slate-200 flex justify-between items-center px-6 py-3 shrink-0 rounded-t-xl">
         <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button (click)="activeTab.set('vencimientos')" 
                    [class.bg-white]="activeTab() === 'vencimientos'" 
                    [class.text-slate-800]="activeTab() === 'vencimientos'"
                    [class.shadow-sm]="activeTab() === 'vencimientos'"
                    class="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 transition-all flex items-center gap-2">
               Vencimientos
               @if (expiredCount() > 0) {
                 <span class="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{{ expiredCount() }}</span>
               }
            </button>
            <button (click)="activeTab.set('novedades')" 
                    [class.bg-white]="activeTab() === 'novedades'" 
                    [class.text-slate-800]="activeTab() === 'novedades'"
                    [class.shadow-sm]="activeTab() === 'novedades'"
                    class="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 transition-all">
               Novedades
            </button>
            <button (click)="activeTab.set('calendario')" 
                    [class.bg-white]="activeTab() === 'calendario'" 
                    [class.text-slate-800]="activeTab() === 'calendario'"
                    [class.shadow-sm]="activeTab() === 'calendario'"
                    class="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 transition-all flex items-center gap-2">
               <span class="material-icons-outlined text-sm">calendar_month</span> Calendario
            </button>
         </div>
         
         <div class="flex gap-2">
             <button class="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                <span class="material-icons-outlined text-lg">settings</span> Configuración
             </button>
             <button class="bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-1 px-4 py-1.5 rounded-lg shadow-sm">
                <span class="material-icons-outlined text-lg">add</span> Nuevo Aviso
             </button>
         </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm relative">
        
        <!-- Tab: VENCIMIENTOS -->
        @if (activeTab() === 'vencimientos') {
          <div class="flex flex-col h-full">
             <!-- Filters Toolbar -->
             <div class="px-6 py-3 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50">
                <div class="flex items-center gap-3">
                   <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" [checked]="filterMyAssignments()" (change)="toggleMyAssignments()" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600"/>
                      <label class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                   </div>
                   <span class="text-sm font-medium text-slate-700">Mis Asignaciones</span>
                </div>
                
                <div class="h-6 w-px bg-slate-300"></div>

                <button class="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600">
                   <span class="material-icons-outlined">calendar_today</span> Hoy <span class="material-icons-outlined text-sm">arrow_drop_down</span>
                </button>
                
                <div class="flex-1"></div>
                
                <div class="flex gap-2">
                    <button (click)="activeSubFilter.set('Aplicación')" 
                            [class]="activeSubFilter() === 'Aplicación' ? 'bg-blue-600 text-white font-bold shadow-md border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                            class="px-3 py-1 border rounded text-sm transition-all duration-200">
                        Aplicación
                    </button>
                    <button (click)="activeSubFilter.set('Vencimientos')" 
                            [class]="activeSubFilter() === 'Vencimientos' ? 'bg-blue-600 text-white font-bold shadow-md border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                            class="px-3 py-1 border rounded text-sm transition-all duration-200">
                        Vencimientos
                    </button>
                    <button (click)="activeSubFilter.set('Proyectos')" 
                            [class]="activeSubFilter() === 'Proyectos' ? 'bg-blue-600 text-white font-bold shadow-md border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                            class="px-3 py-1 border rounded text-sm transition-all duration-200">
                        Proyectos
                    </button>
                </div>
             </div>

             <!-- Table -->
             <div class="flex-1 overflow-auto">
                <table class="w-full text-left text-sm text-slate-600">
                   <thead class="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                      <tr>
                         <th class="px-6 py-3 font-bold text-slate-800 border-r border-slate-100 w-32">
                            Clase <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                         <th class="px-6 py-3 font-bold text-slate-800 border-r border-slate-100 w-32">
                            Vencimiento <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                         <th class="px-6 py-3 font-bold text-slate-800 border-r border-slate-100">
                            Detalle <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                         <th class="px-6 py-3 font-bold text-slate-800 border-r border-slate-100">
                            Cliente / Obra <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                         <th class="px-6 py-3 font-bold text-slate-800 border-r border-slate-100 w-40">
                            Estado <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                         <th class="px-6 py-3 font-bold text-slate-800 w-48">
                            Responsable <span class="material-icons-outlined text-xs float-right text-slate-400">arrow_drop_down</span>
                         </th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-100">
                      @if (filteredExpirations().length === 0) {
                        <tr><td colspan="6" class="p-12 text-center text-slate-400">
                           <div class="flex flex-col items-center gap-2">
                             <span class="material-icons-outlined text-3xl">event_busy</span>
                             <span class="font-medium">No hay vencimientos pendientes</span>
                             <span class="text-xs">Los vencimientos de documentación o impuestos aparecerán aquí.</span>
                           </div>
                        </td></tr>
                      }
                      @for (item of filteredExpirations(); track item.id) {
                         <tr class="hover:bg-slate-50 group transition-colors">
                            <td class="px-6 py-3 border-r border-slate-50 font-medium text-slate-700">{{ item.clase }}</td>
                            <td class="px-6 py-3 border-r border-slate-50 font-mono" 
                                [class.text-red-600]="isExpired(item.date)" 
                                [class.font-bold]="isExpired(item.date)">
                                {{ item.date | date:'dd/MM/yyyy' }}
                            </td>
                            <td class="px-6 py-3 border-r border-slate-50">
                               {{ item.detalle }}
                               <div class="text-xs text-slate-400">{{ item.subDetalle }}</div>
                            </td>
                            <td class="px-6 py-3 border-r border-slate-50 font-medium text-indigo-700">{{ item.entidad }}</td>
                            <td class="px-6 py-3 border-r border-slate-50">
                               <div class="flex items-center gap-2">
                                  <div [class]="getStatusColor(item.date)" class="w-3 h-3 rounded-full border border-white shadow-sm"></div>
                                  <span class="text-xs font-bold">{{ isExpired(item.date) ? 'Vencido' : 'Pendiente' }}</span>
                               </div>
                            </td>
                            <td class="px-6 py-3">
                               <div class="flex items-center justify-between">
                                  <span>{{ item.responsable || 'Sin Asignar' }}</span>
                                  <span class="material-icons-outlined text-xs text-slate-300 group-hover:text-slate-500 cursor-pointer">edit</span>
                               </div>
                            </td>
                         </tr>
                      }
                   </tbody>
                </table>
             </div>
          </div>
        }

        <!-- Tab: NOVEDADES -->
        @if (activeTab() === 'novedades') {
           <div class="flex flex-col h-full">
              <div class="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div class="flex gap-4">
                     <button class="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span class="material-icons-outlined text-green-600">grid_on</span> Exportar Excel
                     </button>
                     <div class="h-5 w-px bg-slate-300"></div>
                     <button class="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span class="material-icons-outlined">people</span> Ver por cliente
                     </button>
                  </div>
                  <div class="flex gap-2">
                     <button class="p-1.5 border border-slate-200 rounded hover:bg-slate-100"><span class="material-icons-outlined text-sm">filter_list</span></button>
                     <button class="p-1.5 border border-slate-200 rounded hover:bg-slate-100"><span class="material-icons-outlined text-sm">refresh</span></button>
                     <button class="p-1.5 border border-slate-200 rounded hover:bg-slate-100"><span class="material-icons-outlined text-sm">settings</span></button>
                  </div>
              </div>

              <div class="flex-1 overflow-auto p-6 space-y-4 bg-slate-50">
                 @if (dataService.novedades().length === 0) {
                    <div class="flex flex-col items-center justify-center h-64 text-center">
                       <span class="material-icons-outlined text-5xl text-slate-300 mb-4">notifications_off</span>
                       <h3 class="text-lg font-bold text-slate-700">Sin Novedades Recientes</h3>
                       <p class="text-slate-500 max-w-sm">No se han registrado novedades de personal o de obra en el periodo actual.</p>
                       <button class="mt-4 bg-slate-800 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-700">Cargar Novedad Manual</button>
                    </div>
                 }
                 @for (nov of dataService.novedades(); track nov.id) {
                    <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start gap-4">
                       <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <span class="material-icons-outlined">assignment</span>
                       </div>
                       <div class="flex-1">
                          <div class="flex justify-between items-start">
                             <h4 class="font-bold text-slate-800">{{ nov.tipoNovedad }}</h4>
                             <span class="text-xs text-slate-400">{{ nov.fecha | date:'mediumDate' }}</span>
                          </div>
                          <p class="text-sm text-slate-600 mt-1">
                             Legajo ID: <strong>{{ nov.legajoId }}</strong> - Cantidad: {{ nov.cantidad }}
                          </p>
                          @if (nov.observaciones) {
                             <div class="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-500">
                                "{{ nov.observaciones }}"
                             </div>
                          }
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

        <!-- Tab: CALENDARIO -->
        @if (activeTab() === 'calendario') {
           <div class="flex flex-col h-full bg-slate-50">
              <!-- Calendar Controls -->
              <div class="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                 <div class="flex items-center gap-4">
                    <h3 class="text-xl font-bold text-slate-800 capitalize">{{ currentMonthName() }} {{ currentYear() }}</h3>
                    <div class="flex bg-slate-100 rounded-lg p-0.5">
                       <button (click)="changeMonth(-1)" class="p-1 hover:bg-white rounded shadow-sm transition-all"><span class="material-icons-outlined text-sm">chevron_left</span></button>
                       <button (click)="changeMonth(1)" class="p-1 hover:bg-white rounded shadow-sm transition-all"><span class="material-icons-outlined text-sm">chevron_right</span></button>
                    </div>
                 </div>
                 <div class="flex gap-4 text-xs font-medium">
                    <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-red-500"></div> Vencimientos</div>
                    <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-blue-500"></div> Novedades</div>
                    <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-green-500"></div> Pagos</div>
                 </div>
              </div>

              <!-- Calendar Grid -->
              <div class="flex-1 p-4 overflow-auto">
                 <div class="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                    <!-- Weekday Headers -->
                    @for (day of weekDays; track day) {
                       <div class="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{{ day }}</div>
                    }

                    <!-- Days -->
                    @for (day of calendarDays(); track $index) {
                       <div class="bg-white min-h-[100px] p-2 relative group hover:bg-blue-50/30 transition-colors" [class.bg-slate-50]="!day.inMonth">
                          
                          <div class="flex justify-between items-start">
                             <span class="text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center" 
                                   [class.bg-blue-600]="isToday(day.date)" 
                                   [class.text-white]="isToday(day.date)"
                                   [class.text-slate-400]="!day.inMonth">
                                {{ day.day }}
                             </span>
                          </div>

                          <!-- Events List -->
                          <div class="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                             @for (event of day.events; track event.id) {
                                <div class="text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 font-medium"
                                     [class.bg-red-50]="event.type === 'vencimiento'"
                                     [class.text-red-700]="event.type === 'vencimiento'"
                                     [class.border-red-100]="event.type === 'vencimiento'"
                                     [class.bg-blue-50]="event.type === 'novedad'"
                                     [class.text-blue-700]="event.type === 'novedad'"
                                     [class.border-blue-100]="event.type === 'novedad'"
                                     [title]="event.title">
                                   {{ event.title }}
                                </div>
                             }
                          </div>

                       </div>
                    }
                 </div>
              </div>
           </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked {
      right: 0;
      border-color: #2563eb;
    }
    .toggle-checkbox:checked + .toggle-label {
      background-color: #2563eb;
    }
    .toggle-checkbox {
      right: 0;
      z-index: 10;
      transition: all 0.2s ease-in-out;
    }
    .toggle-label {
      width: 3rem;
    }
    .toggle-checkbox:not(:checked) {
       right: calc(100% - 1.5rem);
    }
  `]
})
export class NewsExpirationsComponent {
  dataService = inject(DataService);
  
  activeTab = signal<'vencimientos' | 'novedades' | 'calendario'>('vencimientos');
  activeSubFilter = signal<'Aplicación' | 'Vencimientos' | 'Proyectos'>('Vencimientos');
  filterMyAssignments = signal(false);
  
  // Calendar Logic
  currentDate = signal(new Date());
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Computed Vencimientos: Only REAL documents with expiration date
  expirationsList = computed(() => {
     const docs = this.dataService.documentos().filter(d => d.fechaVencimiento).map(d => ({
        id: d.id,
        clase: 'Documentación',
        date: d.fechaVencimiento!,
        detalle: d.tipo,
        subDetalle: 'Vencimiento Documental',
        entidad: this.dataService.legajos().find(l => l.id === d.legajoId)?.apellido || 'Sin Asignar',
        responsable: 'RRHH',
        type: 'vencimiento'
     }));

     // Removed fiscalMocks so table starts empty
     return docs.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  filteredExpirations = computed(() => {
     let list = this.expirationsList();
     if (this.filterMyAssignments()) {
        list = list.filter(i => i.responsable === 'RRHH');
     }
     return list;
  });

  expiredCount = computed(() => {
     return this.expirationsList().filter(x => this.isExpired(x.date)).length;
  });

  // Calendar Helpers
  currentMonthName = computed(() => this.currentDate().toLocaleString('es-ES', { month: 'long' }));
  currentYear = computed(() => this.currentDate().getFullYear());

  calendarDays = computed(() => {
     const year = this.currentYear();
     const month = this.currentDate().getMonth();
     
     const firstDayOfMonth = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     
     const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
     
     const days = [];
     
     // Previous month filler
     for (let i = 0; i < startDayOfWeek; i++) {
        days.push({ day: '', date: new Date(year, month, 0 - i), inMonth: false, events: [] });
     }
     
     // Current month
     for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = new Date(year, month, i).toISOString().split('T')[0];
        const dateObj = new Date(year, month, i);
        
        // Find events
        const events = [];
        // Add Expirations
        this.expirationsList().forEach(e => {
           if (e.date === dateStr) events.push({ id: e.id, title: e.detalle, type: 'vencimiento' });
        });
        // Add News
        this.dataService.novedades().forEach(n => {
           if (n.fecha === dateStr) events.push({ id: n.id, title: n.tipoNovedad, type: 'novedad' });
        });

        days.push({ day: i, date: dateObj, inMonth: true, events });
     }

     return days;
  });

  toggleMyAssignments() {
     this.filterMyAssignments.update(v => !v);
  }

  changeMonth(delta: number) {
     this.currentDate.update(d => {
        const newDate = new Date(d);
        newDate.setMonth(d.getMonth() + delta);
        return newDate;
     });
  }

  isExpired(dateStr: string) {
     return new Date(dateStr) < new Date();
  }

  getStatusColor(dateStr: string) {
     if (this.isExpired(dateStr)) return 'bg-red-500';
     return 'bg-yellow-400';
  }

  isToday(date: Date) {
     const today = new Date();
     return date.getDate() === today.getDate() && 
            date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear();
  }
}
