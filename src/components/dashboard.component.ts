
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- Company Identity Header (PRIMORDIAL: Nombre de la Empresa) -->
      <div class="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
         <!-- Decorative Background Elements -->
         <div class="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-slate-800 to-transparent skew-x-12 transform origin-bottom-right opacity-50"></div>
         <div class="absolute -right-10 -bottom-10 text-white/5 group-hover:text-white/10 transition-colors duration-500">
            <span class="material-icons-outlined text-[180px]">apartment</span>
         </div>
         
         <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div class="space-y-4 max-w-2xl">
               <div class="flex items-center gap-3">
                  <div class="bg-yellow-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                     <span class="material-icons-outlined text-xs">business</span>
                     CONSTRUCTORA REGISTRADA
                  </div>
                  <div class="text-green-400 text-xs font-bold tracking-wide flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-green-900/30">
                     <span class="material-icons-outlined text-xs">verified_user</span>
                     BASE DE DATOS SEGURA
                  </div>
               </div>
               
               <!-- NOMBRE DE LA EMPRESA PRIMORDIAL -->
               <div>
                  <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                     {{ dataService.empresa()?.nombre || 'Mi Constructora' }}
                  </h1>
                  <p class="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
                     <span class="material-icons-outlined text-sm text-yellow-500">location_on</span>
                     {{ dataService.empresa()?.direccion || 'Dirección Principal' }}, {{ dataService.empresa()?.localidad || 'Argentina' }}
                  </p>
               </div>
               
               <div class="flex flex-wrap items-center gap-4 text-slate-300 text-sm pt-2">
                  <div class="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                     <span class="material-icons-outlined text-sm text-slate-400">fingerprint</span>
                     <span class="font-mono text-xs text-slate-400">ID EMPRESA:</span>
                     <span class="font-mono font-bold text-white">{{ dataService.empresa()?.id }}</span>
                  </div>
                  <div class="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                     <span class="material-icons-outlined text-sm text-slate-400">dns</span>
                     <span class="font-mono text-xs text-slate-400">ESTADO:</span>
                     <span class="font-bold text-green-400 flex items-center gap-1">
                        ONLINE <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     </span>
                  </div>
               </div>
            </div>

            <!-- Date Widget -->
            <div class="text-right hidden lg:block">
               <div class="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Última Sincronización</div>
               <div class="text-white font-mono text-xl">{{ today | date:'medium' }}</div>
            </div>
         </div>
      </div>

      <!-- CLICKABLE WIDGETS / ACCESOS DIRECTOS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Widget Empleados -->
          <div routerLink="/employees" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-400 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
              <div class="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Empleados</p>
                  <p class="text-2xl font-bold text-slate-800">{{ dataService.legajos().length }}</p>
                  <p class="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                     <span class="material-icons-outlined text-[10px]">cloud_done</span> Gestionar Personal
                  </p>
              </div>
              <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
                  <span class="material-icons-outlined">people</span>
              </div>
          </div>

          <!-- Widget Obras -->
          <div routerLink="/projects" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-orange-400 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
              <div class="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-orange-600 transition-colors">Obras Activas</p>
                  <p class="text-2xl font-bold text-slate-800">{{ dataService.obras().length }}</p>
                  <p class="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                     <span class="material-icons-outlined text-[10px]">cloud_done</span> Ver Mapa
                  </p>
              </div>
              <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
                  <span class="material-icons-outlined">apartment</span>
              </div>
          </div>

          <!-- Widget Documentos -->
          <div routerLink="/documents" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-purple-400 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
              <div class="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-purple-600 transition-colors">Documentos</p>
                  <p class="text-2xl font-bold text-slate-800">{{ dataService.documentos().length }}</p>
                  <p class="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                     <span class="material-icons-outlined text-[10px]">lock</span> Cargar / Auditar
                  </p>
              </div>
              <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
                  <span class="material-icons-outlined">folder</span>
              </div>
          </div>

          <!-- Widget Payroll -->
          <div routerLink="/payroll" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-400 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
              <div class="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">Recibos Firmados</p>
                  <p class="text-2xl font-bold text-slate-800">{{ dataService.payrollProgress() }}%</p>
                  <p class="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                     <span class="material-icons-outlined text-[10px]">verified</span> Liquidaciones
                  </p>
              </div>
              <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
                  <span class="material-icons-outlined">draw</span>
              </div>
          </div>
      </div>

      <!-- Responsables / Autorizaciones (Full Width Now) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 class="font-bold text-slate-700 flex items-center gap-2">
             <span class="material-icons-outlined text-slate-400">admin_panel_settings</span>
             Equipo de Gestión de {{ dataService.empresa()?.nombre }}
           </h3>
         </div>
         <div class="p-6">
           <p class="text-sm text-slate-500 mb-4">Usuarios habilitados para autorizar movimientos y firmar documentos en esta empresa.</p>
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @if (dataService.companyUsers().length === 0) {
                 <p class="text-sm text-slate-400 italic">No hay información de responsables.</p>
              }
              @for (user of dataService.companyUsers(); track user.id) {
                 <div class="flex items-center gap-4 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-sm">
                       {{ user.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1">
                       <p class="font-bold text-slate-800">{{ user.nombre }}</p>
                       <p class="text-xs text-slate-500">{{ user.usuario }}</p>
                    </div>
                    <div class="text-right">
                       <span class="inline-block px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded font-medium mb-1">
                         {{ user.cargo || 'Admin' }}
                       </span>
                       @if (user.verificado) {
                         <div class="flex items-center justify-end gap-1">
                            <span class="material-icons-outlined text-[10px] text-green-600">verified</span>
                            <span class="text-[10px] text-green-600 font-bold">Verificado</span>
                         </div>
                       }
                    </div>
                 </div>
              }
           </div>
         </div>
      </div>

    </div>
  `
})
export class DashboardComponent {
  dataService = inject(DataService);
  today = new Date();
}
