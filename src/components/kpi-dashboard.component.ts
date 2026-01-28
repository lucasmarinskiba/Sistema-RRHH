
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-kpi-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
         <div>
            <h2 class="text-2xl font-bold text-slate-800">KPIs & Analytics</h2>
            <p class="text-sm text-slate-500">Tablero de control de rendimiento operativo y financiero.</p>
         </div>
         <div class="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button (click)="period.set('mensual')" [class]="period() === 'mensual' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'" class="px-4 py-1.5 rounded text-xs transition-colors">Mensual</button>
             <button (click)="period.set('trimestral')" [class]="period() === 'trimestral' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'" class="px-4 py-1.5 rounded text-xs transition-colors">Trimestral</button>
             <button (click)="period.set('anual')" [class]="period() === 'anual' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'" class="px-4 py-1.5 rounded text-xs transition-colors">Anual</button>
         </div>
      </div>

      <!-- Top High-Level Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         
         <!-- Metric 1: Headcount & Efficiency -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
               <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuerza Laboral Activa</p>
                  <h3 class="text-3xl font-black text-slate-800 mt-1">{{ dataService.activeEmployeesCount() }}</h3>
               </div>
               <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <span class="material-icons-outlined">groups</span>
               </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
               <span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <span class="material-icons-outlined text-[10px]">trending_up</span> +5%
               </span>
               <span class="text-slate-400">vs mes anterior</span>
            </div>
            <!-- Decorative chart line -->
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
         </div>

         <!-- Metric 2: Payroll Cost -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
               <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Costo Nómina (Est.)</p>
                  <h3 class="text-3xl font-black text-slate-800 mt-1">{{ totalPayroll() | currency:'USD':'symbol':'1.0-0' }}</h3>
               </div>
               <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <span class="material-icons-outlined">attach_money</span>
               </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
               <span class="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <span class="material-icons-outlined text-[10px]">trending_flat</span> 0%
               </span>
               <span class="text-slate-400">Estable</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
         </div>

         <!-- Metric 3: Absenteeism Rate -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
               <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Ausentismo</p>
                  <h3 class="text-3xl font-black text-slate-800 mt-1">{{ absenteeismRate() }}%</h3>
               </div>
               <div class="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <span class="material-icons-outlined">person_off</span>
               </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
               @if (absenteeismRate() > 5) {
                  <span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                     <span class="material-icons-outlined text-[10px]">warning</span> Alto
                  </span>
               } @else {
                  <span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                     <span class="material-icons-outlined text-[10px]">check</span> Saludable
                  </span>
               }
               <span class="text-slate-400">Meta: < 5%</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-300"></div>
         </div>

         <!-- Metric 4: Active Sites -->
         <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
               <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Obras Activas</p>
                  <h3 class="text-3xl font-black text-slate-800 mt-1">{{ activeProjectsCount() }}</h3>
               </div>
               <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <span class="material-icons-outlined">apartment</span>
               </div>
            </div>
            <div class="flex items-center gap-2 text-xs">
               <span class="text-slate-500 font-medium">{{ totalProjectsCount() }} proyectos totales</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-300"></div>
         </div>
      </div>

      <!-- Detail Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <!-- Chart 1: Employee Distribution by Sector (Donut Style via CSS) -->
         <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <span class="material-icons-outlined text-indigo-500">pie_chart</span> Distribución por Sector
            </h3>
            
            <div class="flex items-center justify-center py-4">
               <!-- Simple CSS Conic Gradient for Pie Chart Simulation -->
               <div class="w-40 h-40 rounded-full relative" 
                    [style.background]="getSectorGradient()">
                  <div class="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                     <span class="text-2xl font-black text-slate-800">{{ dataService.legajos().length }}</span>
                     <span class="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                  </div>
               </div>
            </div>

            <div class="mt-6 space-y-3">
               @for (sec of sectorStats(); track sec.name) {
                  <div class="flex items-center justify-between text-sm">
                     <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="sec.color"></div>
                        <span class="text-slate-600 font-medium">{{ sec.name }}</span>
                     </div>
                     <span class="font-bold text-slate-800">{{ sec.count }} <span class="text-xs text-slate-400 font-normal">({{ sec.percent }}%)</span></span>
                  </div>
               }
            </div>
         </div>

         <!-- Chart 2: Overtime vs Regular Hours (Bar Chart) -->
         <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
             <div class="flex justify-between items-center mb-6">
               <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <span class="material-icons-outlined text-orange-500">bar_chart</span> Horas Extras vs Regulares
               </h3>
               <button class="text-xs text-blue-600 hover:underline font-medium">Ver detalle detallado</button>
            </div>

            <div class="flex-1 flex items-end gap-4 h-64 border-b border-slate-200 pb-2 relative">
               <!-- Y Axis Grid lines (Fake) -->
               <div class="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs text-slate-300">
                  <div class="border-t border-dashed border-slate-100 w-full pt-1">100%</div>
                  <div class="border-t border-dashed border-slate-100 w-full pt-1">75%</div>
                  <div class="border-t border-dashed border-slate-100 w-full pt-1">50%</div>
                  <div class="border-t border-dashed border-slate-100 w-full pt-1">25%</div>
                  <div>0%</div>
               </div>

               <!-- Bars -->
               @for (month of mockMonthlyStats; track month.label) {
                  <div class="flex-1 flex flex-col justify-end h-full z-10 group cursor-pointer">
                     <div class="flex flex-col w-full gap-0.5 rounded-t-md overflow-hidden relative">
                         <!-- Regular Hours -->
                         <div class="bg-blue-200 w-full transition-all duration-500 relative group-hover:bg-blue-300" [style.height.%]="month.regularPct">
                           <div class="opacity-0 group-hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-800">{{ month.regularHrs }}h</div>
                         </div>
                         <!-- Overtime Hours -->
                         <div class="bg-orange-400 w-full transition-all duration-500 relative group-hover:bg-orange-500" [style.height.%]="month.overtimePct">
                           <div class="opacity-0 group-hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white shadow-sm">{{ month.overtimeHrs }}h</div>
                         </div>
                     </div>
                     <span class="text-xs text-slate-500 font-medium text-center mt-2">{{ month.label }}</span>
                  </div>
               }
            </div>
            
            <div class="flex justify-center gap-6 mt-4 text-xs font-medium">
               <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-200 rounded"></div>
                  <span class="text-slate-600">Jornada Normal</span>
               </div>
               <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-orange-400 rounded"></div>
                  <span class="text-slate-600">Horas Extras (50% / 100%)</span>
               </div>
            </div>
         </div>
      </div>

      <!-- Bottom Row: Alerts & Safety -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         <!-- Safety KPIs -->
         <div class="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
            <div class="absolute top-0 right-0 p-8 opacity-10">
               <span class="material-icons-outlined text-9xl">health_and_safety</span>
            </div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
               <span class="material-icons-outlined text-green-400">shield</span> Seguridad e Higiene
            </h3>
            <div class="grid grid-cols-2 gap-6 relative z-10">
               <div>
                  <div class="text-4xl font-black text-green-400">45</div>
                  <div class="text-xs text-slate-400 uppercase font-bold mt-1">Días sin Accidentes</div>
               </div>
               <div>
                  <div class="text-4xl font-black text-white">92%</div>
                  <div class="text-xs text-slate-400 uppercase font-bold mt-1">Uso de EPP Auditado</div>
               </div>
               <div class="col-span-2 pt-4 border-t border-slate-700">
                  <div class="flex justify-between text-sm mb-1">
                     <span class="text-slate-300">Capacitaciones de Seguridad</span>
                     <span class="font-bold">12 / 15 Completadas</span>
                  </div>
                  <div class="w-full bg-slate-700 rounded-full h-2">
                     <div class="bg-green-500 h-2 rounded-full" style="width: 80%"></div>
                  </div>
               </div>
            </div>
         </div>

         <!-- Document Compliance -->
         <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <span class="material-icons-outlined text-red-500">rule</span> Cumplimiento Documental
            </h3>
            
            <div class="space-y-4">
               <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div class="flex items-center gap-3">
                     <div class="bg-white p-2 rounded shadow-sm text-slate-600">
                        <span class="material-icons-outlined">folder_shared</span>
                     </div>
                     <div>
                        <p class="text-sm font-bold text-slate-700">Legajos Completos</p>
                        <p class="text-xs text-slate-500">Documentación de alta y DNI</p>
                     </div>
                  </div>
                  <span class="text-lg font-bold text-green-600">98%</span>
               </div>

               <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div class="flex items-center gap-3">
                     <div class="bg-white p-2 rounded shadow-sm text-slate-600">
                        <span class="material-icons-outlined">medical_services</span>
                     </div>
                     <div>
                        <p class="text-sm font-bold text-slate-700">Aptos Médicos Vigentes</p>
                        <p class="text-xs text-slate-500">Exámenes preocupacionales/periódicos</p>
                     </div>
                  </div>
                  <span class="text-lg font-bold text-yellow-600">85%</span>
               </div>
               
               <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div class="flex items-center gap-3">
                     <div class="bg-white p-2 rounded shadow-sm text-slate-600">
                        <span class="material-icons-outlined">verified</span>
                     </div>
                     <div>
                        <p class="text-sm font-bold text-slate-700">Recibos Firmados</p>
                        <p class="text-xs text-slate-500">Último período liquidado</p>
                     </div>
                  </div>
                  <span class="text-lg font-bold text-blue-600">{{ dataService.payrollProgress() }}%</span>
               </div>
            </div>

         </div>

      </div>

    </div>
  `
})
export class KpiDashboardComponent {
  dataService = inject(DataService);
  period = signal<'mensual' | 'trimestral' | 'anual'>('mensual');

  // Computed Metrics
  totalPayroll = computed(() => {
     return this.dataService.legajos().reduce((acc, curr) => acc + (curr.basicoJornal || 0), 0);
  });

  totalProjectsCount = computed(() => this.dataService.obras().length);
  
  activeProjectsCount = computed(() => 
    this.dataService.obras().filter(o => !o.estado || o.estado === 'Activa').length
  );

  absenteeismRate = computed(() => {
     // Mock logic: Calculate based on "Ausencia" novedades vs Total Employees * 22 days
     const totalWorkingDays = this.dataService.legajos().length * 22; 
     if (totalWorkingDays === 0) return 0;
     
     const absences = this.dataService.novedades()
         .filter(n => n.tipoNovedad.includes('Ausencia') || n.tipoNovedad.includes('Enfermedad'))
         .reduce((acc, curr) => acc + curr.cantidad, 0); // Assuming cantidad is days for these types
     
     return Math.round((absences / totalWorkingDays) * 100);
  });

  sectorStats = computed(() => {
     const legajos = this.dataService.legajos();
     const total = legajos.length;
     if (total === 0) return [];
     
     const counts: {[key:string]: number} = {};
     legajos.forEach(l => {
         const s = l.sector || 'Sin Sector';
         counts[s] = (counts[s] || 0) + 1;
     });

     const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']; // Tailwind colors
     
     return Object.keys(counts).map((key, index) => ({
         name: key,
         count: counts[key],
         percent: Math.round((counts[key] / total) * 100),
         color: colors[index % colors.length]
     })).sort((a,b) => b.count - a.count);
  });

  // Helper for CSS Conic Gradient
  getSectorGradient() {
     const stats = this.sectorStats();
     if (stats.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)'; // Empty gray

     let gradient = 'conic-gradient(';
     let currentDeg = 0;
     
     stats.forEach((s, i) => {
         const deg = (s.percent / 100) * 360;
         gradient += `${s.color} ${currentDeg}deg ${currentDeg + deg}deg`;
         currentDeg += deg;
         if (i < stats.length - 1) gradient += ', ';
     });
     
     gradient += ')';
     return gradient;
  }

  // Mock Data for Charts (Simulated History)
  mockMonthlyStats = [
     { label: 'Ene', regularHrs: 160, overtimeHrs: 12, regularPct: 80, overtimePct: 15 },
     { label: 'Feb', regularHrs: 155, overtimeHrs: 25, regularPct: 75, overtimePct: 25 },
     { label: 'Mar', regularHrs: 170, overtimeHrs: 10, regularPct: 85, overtimePct: 10 },
     { label: 'Abr', regularHrs: 165, overtimeHrs: 18, regularPct: 80, overtimePct: 20 },
     { label: 'May', regularHrs: 176, overtimeHrs: 5, regularPct: 90, overtimePct: 5 },
     { label: 'Jun', regularHrs: 160, overtimeHrs: 30, regularPct: 70, overtimePct: 30 },
  ];
}
