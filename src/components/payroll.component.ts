
import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Novedad, ReciboSueldo } from '../services/data.service';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6 h-[calc(100vh-140px)] flex flex-col">
       
       <!-- Header Section -->
       <div class="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
         <div>
            <h2 class="text-2xl font-bold text-slate-800">Recibos y Sueldos</h2>
            <p class="text-sm text-slate-500">Gestión de liquidaciones, control de firmas y novedades.</p>
         </div>
         
         <div class="bg-slate-100 p-1 rounded-lg flex shadow-inner">
            <button (click)="activeTab.set('recibos')" [class.bg-white]="activeTab() === 'recibos'" [class.text-indigo-600]="activeTab() === 'recibos'" [class.shadow-sm]="activeTab() === 'recibos'" class="px-6 py-2 rounded-md text-sm font-bold transition-all text-slate-500 flex items-center gap-2">
               <span class="material-icons-outlined">receipt_long</span> Recibos y Firmas
            </button>
            <button (click)="activeTab.set('novedades')" [class.bg-white]="activeTab() === 'novedades'" [class.text-indigo-600]="activeTab() === 'novedades'" [class.shadow-sm]="activeTab() === 'novedades'" class="px-6 py-2 rounded-md text-sm font-bold transition-all text-slate-500 flex items-center gap-2">
               <span class="material-icons-outlined">edit_note</span> Novedades
            </button>
         </div>
       </div>

       <!-- TAB: NOVEDADES (Existing Logic Preserved) -->
       @if (activeTab() === 'novedades') {
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-full">
            <!-- Formulario Novedades -->
            <div class="lg:col-span-1 overflow-y-auto custom-scrollbar">
               <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 class="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Cargar Novedad</h3>
                  <form [formGroup]="novedadForm" (ngSubmit)="saveNovedad()" class="space-y-4">
                     <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Empleado</label>
                        <select formControlName="legajoId" class="w-full border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500">
                           @for (emp of dataService.legajos(); track emp.id) {
                              <option [value]="emp.id">{{ emp.apellido }}, {{ emp.nombre }} ({{ emp.nroLegajo }})</option>
                           }
                        </select>
                     </div>
                     <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Tipo de Novedad</label>
                        <select formControlName="tipoNovedad" class="w-full border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500">
                           @for (tipo of dataService.tipoNovedades(); track tipo.id) {
                              <option [value]="tipo.tipoNovedad">{{ tipo.tipoNovedad }}</option>
                           }
                        </select>
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
                           <input formControlName="fecha" type="date" class="w-full border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500">
                        </div>
                        <div>
                           <label class="block text-xs font-bold text-slate-700 mb-1">Cantidad (Hs/Días)</label>
                           <input formControlName="cantidad" type="number" class="w-full border-slate-300 rounded-lg text-sm shadow-sm focus:ring-indigo-500">
                        </div>
                     </div>
                     <button type="submit" [disabled]="novedadForm.invalid" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition-colors text-sm">
                        <span class="material-icons-outlined text-sm align-middle mr-1">save</span> Guardar Novedad
                     </button>
                  </form>
               </div>
            </div>

            <!-- Lista Novedades -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
               <div class="px-6 py-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-50 flex justify-between items-center">
                  <span>Novedades del Mes</span>
                  <span class="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{{ dataService.novedades().length }} registros</span>
               </div>
               <div class="flex-1 overflow-y-auto custom-scrollbar">
                  <table class="w-full text-left text-sm text-slate-600">
                     <thead class="bg-white border-b border-slate-100 text-slate-500 sticky top-0 z-10">
                        <tr>
                           <th class="px-6 py-3 bg-slate-50/90 backdrop-blur">Fecha</th>
                           <th class="px-6 py-3 bg-slate-50/90 backdrop-blur">Empleado</th>
                           <th class="px-6 py-3 bg-slate-50/90 backdrop-blur">Concepto</th>
                           <th class="px-6 py-3 bg-slate-50/90 backdrop-blur">Cant.</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-slate-100">
                        @if (dataService.novedades().length === 0) {
                           <tr>
                              <td colspan="4" class="px-6 py-12 text-center text-slate-400">
                                 <div class="flex flex-col items-center">
                                    <span class="material-icons-outlined text-4xl mb-2 text-slate-300">event_note</span>
                                    No hay novedades cargadas en este período.
                                 </div>
                              </td>
                           </tr>
                        }
                        @for (nov of dataService.novedades(); track nov.id) {
                           <tr class="hover:bg-slate-50 transition-colors">
                              <td class="px-6 py-3 font-mono text-xs">{{ nov.fecha | date:'dd/MM' }}</td>
                              <td class="px-6 py-3 font-bold text-slate-800">{{ getEmployeeName(nov.legajoId) }}</td>
                              <td class="px-6 py-3"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium border border-indigo-100">{{ nov.tipoNovedad }}</span></td>
                              <td class="px-6 py-3 font-bold">{{ nov.cantidad }}</td>
                           </tr>
                        }
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
       }

       <!-- TAB: RECIBOS (ENHANCED) -->
       @if (activeTab() === 'recibos') {
          <div class="flex flex-col h-full space-y-4">
             
             <!-- 1. Stats Summary Dashboard -->
             <div class="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <span class="text-xs font-bold text-slate-400 uppercase">Total Liquidado</span>
                   <div class="flex items-end justify-between">
                      <span class="text-2xl font-bold text-slate-800">{{ stats().totalAmount | currency }}</span>
                      <span class="material-icons-outlined text-green-500 bg-green-50 p-1 rounded-lg">payments</span>
                   </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <span class="text-xs font-bold text-slate-400 uppercase">Recibos Emitidos</span>
                   <div class="flex items-end justify-between">
                      <span class="text-2xl font-bold text-slate-800">{{ filteredRecibos().length }}</span>
                      <span class="material-icons-outlined text-blue-500 bg-blue-50 p-1 rounded-lg">description</span>
                   </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <span class="text-xs font-bold text-slate-400 uppercase">Pendientes Firma</span>
                   <div class="flex items-end justify-between">
                      <span class="text-2xl font-bold text-orange-600">{{ stats().pendingCount }}</span>
                      <span class="material-icons-outlined text-orange-500 bg-orange-50 p-1 rounded-lg">draw</span>
                   </div>
                </div>
                <!-- Quick Generator Mini-Form -->
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center gap-2">
                   <span class="text-xs font-bold text-slate-500 flex items-center gap-1"><span class="material-icons-outlined text-sm">bolt</span> Generación Rápida</span>
                   <form [formGroup]="reciboForm" (ngSubmit)="generateRecibo()" class="flex gap-2">
                      <select formControlName="legajoId" class="w-full text-xs rounded border-slate-300 py-1">
                          <option [value]="null">Seleccionar Empleado...</option>
                          @for (emp of dataService.legajos(); track emp.id) {
                            <option [value]="emp.id">{{ emp.apellido }}</option>
                          }
                      </select>
                      <button type="submit" [disabled]="reciboForm.invalid" class="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 shadow-sm">
                         <span class="material-icons-outlined text-lg">add</span>
                      </button>
                   </form>
                   <input [formControl]="reciboForm.controls.monto" type="number" placeholder="Monto Neto" class="w-full text-xs rounded border-slate-300 py-1">
                </div>
             </div>

             <!-- 2. Advanced Tools & Filters Toolbar -->
             <div class="bg-white p-2 rounded-xl shadow-sm border border-slate-200 shrink-0 flex flex-wrap items-center gap-4">
                
                <!-- Period Selector -->
                <div class="flex items-center gap-2 border-r border-slate-200 pr-4">
                   <span class="text-xs font-bold text-slate-500 uppercase">Período:</span>
                   <input type="month" [(ngModel)]="selectedPeriod" class="border-slate-300 rounded text-sm py-1 font-bold text-slate-700 focus:ring-indigo-500">
                </div>

                <!-- Search -->
                <div class="relative flex-1 min-w-[200px]">
                   <span class="material-icons-outlined absolute left-2 top-1.5 text-slate-400 text-lg">search</span>
                   <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por Apellido, Legajo o CUIL..." class="w-full pl-8 pr-4 py-1.5 border border-slate-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <!-- Status Filter -->
                <div class="flex bg-slate-100 p-1 rounded-lg">
                   <button (click)="filterState.set('Todos')" [class]="filterState() === 'Todos' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 rounded text-xs font-bold transition-all">Todos</button>
                   <button (click)="filterState.set('Pendiente')" [class]="filterState() === 'Pendiente' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 rounded text-xs font-bold transition-all">Pendientes</button>
                   <button (click)="filterState.set('Firmado')" [class]="filterState() === 'Firmado' ? 'bg-white shadow text-green-600' : 'text-slate-500 hover:text-slate-700'" class="px-3 py-1 rounded text-xs font-bold transition-all">Firmados</button>
                </div>

                <!-- View Toggle -->
                <div class="flex border border-slate-200 rounded-lg overflow-hidden">
                   <button (click)="viewMode.set('table')" [class]="viewMode() === 'table' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500'" class="p-1.5 hover:bg-slate-50 transition-colors" title="Vista Tabla">
                      <span class="material-icons-outlined text-lg">table_rows</span>
                   </button>
                   <div class="w-px bg-slate-200"></div>
                   <button (click)="viewMode.set('grid')" [class]="viewMode() === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500'" class="p-1.5 hover:bg-slate-50 transition-colors" title="Vista Tarjetas">
                      <span class="material-icons-outlined text-lg">grid_view</span>
                   </button>
                </div>
             </div>

             <!-- 3. Main Content Area -->
             <div class="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-xl border border-slate-200 shadow-sm relative">
                
                @if (filteredRecibos().length === 0) {
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                       <span class="material-icons-outlined text-5xl mb-2 text-slate-200">filter_list_off</span>
                       <p>No hay recibos que coincidan con los filtros.</p>
                       <button (click)="clearFilters()" class="mt-4 text-indigo-600 font-bold hover:underline text-sm">Limpiar Filtros</button>
                    </div>
                }

                <!-- TABLE VIEW -->
                @if (viewMode() === 'table' && filteredRecibos().length > 0) {
                   <table class="w-full text-left text-sm text-slate-600">
                      <thead class="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                         <tr>
                            <th class="p-3 w-10 text-center">
                               <input type="checkbox" (change)="toggleAllSelection($event)" [checked]="isAllSelected()" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                            </th>
                            <th class="p-3">Período</th>
                            <th class="p-3">Legajo / Empleado</th>
                            <th class="p-3">Concepto</th>
                            <th class="p-3 text-right">Monto Neto</th>
                            <th class="p-3 text-center">Estado Firma</th>
                            <th class="p-3 text-right">Acciones</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                         @for (recibo of filteredRecibos(); track recibo.id) {
                            <tr class="hover:bg-slate-50 transition-colors group" [class.bg-indigo-50]="selectedIds.has(recibo.id)">
                               <td class="p-3 text-center">
                                  <input type="checkbox" [checked]="selectedIds.has(recibo.id)" (change)="toggleSelection(recibo.id)" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                               </td>
                               <td class="p-3 font-mono text-xs">{{ recibo.periodo }}</td>
                               <td class="p-3">
                                  <div class="flex flex-col">
                                     <span class="font-bold text-slate-800">{{ getEmployeeName(recibo.legajoId) }}</span>
                                     <span class="text-xs text-slate-400">ID: {{ recibo.legajoId }}</span>
                                  </div>
                               </td>
                               <td class="p-3 text-xs">Haberes Mensuales</td>
                               <td class="p-3 text-right font-mono font-medium text-slate-800">{{ recibo.monto | currency }}</td>
                               <td class="p-3 text-center">
                                  <span [class]="recibo.estado === 'Firmado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'" class="px-2 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1">
                                    <span class="material-icons-outlined text-[10px]">{{ recibo.estado === 'Firmado' ? 'verified' : 'pending' }}</span>
                                    {{ recibo.estado }}
                                  </span>
                               </td>
                               <td class="p-3 text-right">
                                  <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button class="p-1 text-slate-400 hover:text-blue-600" title="Ver PDF"><span class="material-icons-outlined">visibility</span></button>
                                     <button class="p-1 text-slate-400 hover:text-indigo-600" title="Descargar"><span class="material-icons-outlined">download</span></button>
                                     @if (recibo.estado === 'Pendiente') {
                                        <button (click)="openSignatureModal(recibo.id)" class="p-1 text-orange-400 hover:text-orange-600" title="Firmar"><span class="material-icons-outlined">draw</span></button>
                                     }
                                  </div>
                               </td>
                            </tr>
                         }
                      </tbody>
                   </table>
                }

                <!-- GRID VIEW -->
                @if (viewMode() === 'grid' && filteredRecibos().length > 0) {
                   <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      @for (recibo of filteredRecibos(); track recibo.id) {
                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden hover:shadow-md transition-all group flex flex-col">
                           <div [class]="recibo.estado === 'Firmado' ? 'bg-green-500' : 'bg-orange-500'" class="h-1 w-full"></div>
                           <div class="p-4 flex-1">
                              <div class="flex justify-between items-start mb-2">
                                 <span class="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{{ recibo.periodo }}</span>
                                 <input type="checkbox" [checked]="selectedIds.has(recibo.id)" (change)="toggleSelection(recibo.id)" class="rounded border-slate-300 text-indigo-600">
                              </div>
                              <h4 class="font-bold text-slate-800 truncate" title="{{ getEmployeeName(recibo.legajoId) }}">{{ getEmployeeName(recibo.legajoId) }}</h4>
                              <p class="text-2xl font-bold text-slate-700 mt-2">{{ recibo.monto | currency }}</p>
                              
                              @if (recibo.estado === 'Firmado') {
                                 <div class="mt-3 flex items-start gap-2 text-green-700 bg-green-50 p-2 rounded border border-green-100 relative overflow-hidden">
                                    <span class="material-icons-outlined text-base z-10">verified</span>
                                    <div class="flex-1 overflow-hidden z-10">
                                       <div class="text-[10px] leading-tight">
                                           <span class="font-bold block">FIRMADO DIGITALMENTE</span>
                                           <span class="font-mono text-green-600 truncate block">{{ recibo.firmaHash }}</span>
                                       </div>
                                       @if (recibo.firmaImagen) {
                                          <img [src]="recibo.firmaImagen" class="mt-1 h-8 max-w-full mix-blend-multiply border-t border-green-200 pt-1">
                                       }
                                    </div>
                                    <!-- Sello de agua decorativo -->
                                    <span class="material-icons-outlined absolute -right-2 -bottom-2 text-5xl text-green-200/50 pointer-events-none">verified_user</span>
                                 </div>
                              } @else {
                                 <div class="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded border border-orange-100">
                                    <span class="material-icons-outlined">hourglass_empty</span>
                                    <span class="text-xs font-bold">PENDIENTE DE FIRMA</span>
                                 </div>
                              }
                           </div>
                           <div class="bg-slate-50 p-2 border-t border-slate-100 flex justify-between items-center">
                              <button class="text-slate-500 hover:text-indigo-600 text-xs font-bold flex items-center gap-1">
                                 <span class="material-icons-outlined text-sm">visibility</span> Ver
                              </button>
                              @if (recibo.estado === 'Pendiente') {
                                 <button (click)="openSignatureModal(recibo.id)" class="text-orange-600 hover:text-orange-800 text-xs font-bold flex items-center gap-1">
                                    <span class="material-icons-outlined text-sm">draw</span> Firmar
                                 </button>
                              }
                           </div>
                        </div>
                      }
                   </div>
                }
             </div>

             <!-- Bulk Actions Floating Bar -->
             @if (selectedIds.size > 0) {
                <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
                   <span class="font-bold text-sm">{{ selectedIds.size }} seleccionados</span>
                   <div class="h-4 w-px bg-slate-600"></div>
                   <button (click)="bulkSign()" class="flex items-center gap-2 hover:text-green-400 transition-colors text-sm font-medium">
                      <span class="material-icons-outlined">draw</span> Firmar Lote
                   </button>
                   <button (click)="bulkDownload()" class="flex items-center gap-2 hover:text-blue-400 transition-colors text-sm font-medium">
                      <span class="material-icons-outlined">download</span> Descargar
                   </button>
                   <button (click)="selectedIds.clear()" class="ml-2 hover:text-red-400"><span class="material-icons-outlined">close</span></button>
                </div>
             }
             
             <!-- SIGNATURE MODAL (UPDATED VISUALS) -->
             @if (showSignatureModal()) {
                <div class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                   <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col transform transition-all scale-100">
                      
                      <!-- Header Friendly -->
                      <div class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                         <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                               <span class="material-icons-outlined">history_edu</span>
                            </div>
                            <div>
                               <h3 class="font-bold text-slate-800">Firma Digital</h3>
                               <p class="text-xs text-slate-500">Dibuje su firma en el recuadro como en papel.</p>
                            </div>
                         </div>
                         <button (click)="closeSignatureModal()" class="text-slate-400 hover:text-slate-600"><span class="material-icons-outlined">close</span></button>
                      </div>
                      
                      <div class="p-6 flex flex-col items-center bg-white relative">
                         <!-- Canvas Container with Paper Effect -->
                         <div class="w-full max-w-[400px] border-2 border-dashed border-slate-300 rounded-lg shadow-inner relative cursor-crosshair touch-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            <canvas #sigPad width="400" height="200" 
                                    class="w-full h-auto rounded-lg"
                                    (mousedown)="startDrawing($event)" 
                                    (mousemove)="draw($event)" 
                                    (mouseup)="stopDrawing()" 
                                    (mouseleave)="stopDrawing()"
                                    (touchstart)="startDrawing($event)"
                                    (touchmove)="draw($event)"
                                    (touchend)="stopDrawing()"></canvas>
                            
                            <!-- Visual Guide (Renglón) -->
                            <div class="absolute bottom-10 left-10 right-10 h-px bg-slate-300 pointer-events-none flex items-end">
                                <span class="text-slate-400 text-2xl font-serif absolute -left-6 -bottom-3 select-none">x</span>
                            </div>
                            <div class="absolute top-2 right-2 text-[10px] text-slate-300 pointer-events-none">Panel Táctil</div>
                         </div>
                         
                         <p class="text-xs text-slate-400 mt-3 flex items-center gap-1">
                            <span class="material-icons-outlined text-sm">touch_app</span> 
                            Use su dedo (móvil) o mouse (PC) para firmar.
                         </p>
                      </div>

                      <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                         <button (click)="clearSignature()" class="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 px-3 py-2 rounded hover:bg-red-50 transition-colors">
                            <span class="material-icons-outlined text-sm">cleaning_services</span> Limpiar
                         </button>
                         <div class="flex gap-2">
                             <button (click)="closeSignatureModal()" class="text-slate-500 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                             <button (click)="saveSignature()" [disabled]="isCanvasBlank()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
                                <span class="material-icons-outlined text-sm">check_circle</span> Confirmar Firma
                             </button>
                         </div>
                      </div>
                   </div>
                </div>
             }

          </div>
       }
    </div>
  `
})
export class PayrollComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  activeTab = signal<'novedades' | 'recibos'>('recibos');
  
  // View State
  viewMode = signal<'table' | 'grid'>('table');
  filterState = signal<'Todos' | 'Pendiente' | 'Firmado'>('Todos');
  searchTerm = signal('');
  selectedPeriod = signal(new Date().toISOString().substring(0,7)); // YYYY-MM
  
  // Selection State
  selectedIds = new Set<string>();

  // Signature State
  showSignatureModal = signal(false);
  currentSigningId = signal<string | null>(null);
  @ViewChild('sigPad') sigPad!: ElementRef<HTMLCanvasElement>;
  private cx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  
  // Derived State (Computed)
  filteredRecibos = computed(() => {
     let all = this.dataService.recibos();
     
     // 1. Filter by Period
     if (this.selectedPeriod()) {
        all = all.filter(r => r.periodo === this.selectedPeriod());
     }

     // 2. Filter by State
     const state = this.filterState();
     if (state !== 'Todos') {
        all = all.filter(r => r.estado === state);
     }

     // 3. Filter by Search
     const term = this.searchTerm().toLowerCase();
     if (term) {
        all = all.filter(r => {
           const emp = this.dataService.legajos().find(e => e.id === r.legajoId);
           const name = emp ? (emp.apellido + ' ' + emp.nombre).toLowerCase() : '';
           const legajo = emp ? emp.nroLegajo.toLowerCase() : '';
           return name.includes(term) || legajo.includes(term);
        });
     }

     return all;
  });

  stats = computed(() => {
     const data = this.filteredRecibos();
     const totalAmount = data.reduce((sum, r) => sum + r.monto, 0);
     const pendingCount = data.filter(r => r.estado === 'Pendiente').length;
     return { totalAmount, pendingCount };
  });

  isAllSelected = computed(() => {
     const visible = this.filteredRecibos();
     return visible.length > 0 && visible.every(r => this.selectedIds.has(r.id));
  });

  // Forms
  novedadForm = this.fb.group({
     legajoId: ['', Validators.required],
     tipoNovedad: ['', Validators.required],
     fecha: [new Date().toISOString().split('T')[0], Validators.required],
     cantidad: [1, [Validators.required, Validators.min(0.5)]]
  });

  reciboForm = this.fb.group({
     legajoId: [null, Validators.required],
     periodo: [this.selectedPeriod()],
     monto: [null as number | null, Validators.required]
  });

  // Actions
  getEmployeeName(id: string) {
    const emp = this.dataService.legajos().find(e => e.id === id);
    return emp ? `${emp.apellido}, ${emp.nombre}` : 'Desconocido';
  }

  saveNovedad() {
     if (this.novedadForm.invalid) return;
     const val = this.novedadForm.value;
     this.dataService.addNovedad({
        legajoId: val.legajoId!,
        tipoNovedad: val.tipoNovedad!,
        fecha: val.fecha!,
        cantidad: val.cantidad!
     });
     this.novedadForm.reset({ fecha: new Date().toISOString().split('T')[0], cantidad: 1 });
  }

  generateRecibo() {
     if (this.reciboForm.invalid) return;
     const val = this.reciboForm.value;
     // Use selected period from main filter if form one is empty, or default
     const p = this.selectedPeriod() || new Date().toISOString().substring(0,7);
     
     this.dataService.generateRecibo(val.legajoId!, p, val.monto!);
     this.reciboForm.patchValue({ monto: null });
  }

  // Bulk Actions
  toggleSelection(id: string) {
     if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
     } else {
        this.selectedIds.add(id);
     }
     this.selectedIds = new Set(this.selectedIds); 
  }

  toggleAllSelection(event: any) {
     const checked = event.target.checked;
     if (checked) {
        this.filteredRecibos().forEach(r => this.selectedIds.add(r.id));
     } else {
        this.selectedIds.clear();
     }
     this.selectedIds = new Set(this.selectedIds);
  }

  bulkSign() {
     if (confirm(`¿Firmar digitalmente ${this.selectedIds.size} recibos seleccionados con Certificado Automático?`)) {
        this.selectedIds.forEach(id => {
           this.dataService.signRecibo(id);
        });
        this.selectedIds.clear();
     }
  }

  bulkDownload() {
     alert(`Simulando descarga de ZIP con ${this.selectedIds.size} recibos en PDF...`);
     this.selectedIds.clear();
  }

  clearFilters() {
     this.searchTerm.set('');
     this.filterState.set('Todos');
  }

  // --- SIGNATURE PAD LOGIC ---

  openSignatureModal(reciboId: string) {
     this.currentSigningId.set(reciboId);
     this.showSignatureModal.set(true);
     // Wait for DOM
     setTimeout(() => {
        const canvasEl = this.sigPad.nativeElement;
        
        // Ajustar resolución para pantallas de alta densidad (Retina)
        // Esto hace que la firma se vea nítida y no pixelada
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvasEl.width = 400 * ratio;
        canvasEl.height = 200 * ratio;
        
        this.cx = canvasEl.getContext('2d');
        if (this.cx) {
            this.cx.scale(ratio, ratio); // Escalar el contexto
            this.cx.lineWidth = 3; // Trazo un poco más grueso para que parezca tinta
            this.cx.lineCap = 'round';
            this.cx.lineJoin = 'round';
            this.cx.strokeStyle = '#1e293b'; // Color tinta (Slate-800)
        }
     }, 100);
  }

  closeSignatureModal() {
     this.showSignatureModal.set(false);
     this.currentSigningId.set(null);
     this.isDrawing = false;
  }

  private getPosition(event: any) {
     const canvasEl = this.sigPad.nativeElement;
     const rect = canvasEl.getBoundingClientRect();
     
     let clientX, clientY;
     if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
     } else {
        clientX = event.clientX;
        clientY = event.clientY;
     }
     
     // Calcular posición relativa considerando el escalado CSS vs Canvas real
     const scaleX = canvasEl.width / (rect.width * (window.devicePixelRatio || 1));
     const scaleY = canvasEl.height / (rect.height * (window.devicePixelRatio || 1));

     return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
     };
  }

  startDrawing(event: any) {
     event.preventDefault();
     this.isDrawing = true;
     const pos = this.getPosition(event);
     this.cx?.beginPath();
     this.cx?.moveTo(pos.x, pos.y);
  }

  draw(event: any) {
     event.preventDefault(); // Prevent scrolling on touch
     if (!this.isDrawing || !this.cx) return;
     const pos = this.getPosition(event);
     this.cx.lineTo(pos.x, pos.y);
     this.cx.stroke();
  }

  stopDrawing() {
     if (this.isDrawing) {
        this.cx?.closePath();
        this.isDrawing = false;
     }
  }

  clearSignature() {
     const canvas = this.sigPad.nativeElement;
     // Limpiar usando las dimensiones reales
     this.cx?.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
  }

  isCanvasBlank(): boolean {
     if (!this.sigPad) return true;
     const canvas = this.sigPad.nativeElement;
     const blank = document.createElement('canvas');
     blank.width = canvas.width;
     blank.height = canvas.height;
     return canvas.toDataURL() === blank.toDataURL();
  }

  saveSignature() {
     const id = this.currentSigningId();
     if (id && !this.isCanvasBlank()) {
         const dataUrl = this.sigPad.nativeElement.toDataURL();
         this.dataService.signRecibo(id, dataUrl);
         this.closeSignatureModal();
     }
  }
}
