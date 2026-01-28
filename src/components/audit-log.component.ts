
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
       <div class="flex justify-between items-center">
         <div>
            <h2 class="text-2xl font-bold text-slate-800">Registro de Cambios y Auditoría</h2>
            <p class="text-slate-500">Historial completo de acciones y herramientas de Base de Datos.</p>
         </div>
         <div class="flex gap-2">
            <button (click)="downloadSql()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm flex items-center gap-2">
               <span class="material-icons-outlined">code</span> Exportar SQL
            </button>
            <button (click)="resetDb()" class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg shadow-sm text-sm flex items-center gap-2 border border-red-200">
               <span class="material-icons-outlined">delete_forever</span> Resetear DB
            </button>
         </div>
       </div>

       <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                Actividad Reciente
             </div>
             <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-white border-b border-slate-100 text-slate-500">
                   <tr>
                      <th class="px-6 py-3">Fecha</th>
                      <th class="px-6 py-3">Usuario</th>
                      <th class="px-6 py-3">Acción</th>
                      <th class="px-6 py-3">Detalles</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                   @if (dataService.auditLogs().length === 0) {
                      <tr>
                         <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                            No hay registros de actividad aún.
                         </td>
                      </tr>
                   }
                   @for (log of dataService.auditLogs(); track log.id) {
                      <tr class="hover:bg-slate-50">
                         <td class="px-6 py-3 text-slate-500 font-mono text-xs">{{ log.fecha | date:'short' }}</td>
                         <td class="px-6 py-3">
                            <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">ID: {{ log.usuarioId }}</span>
                         </td>
                         <td class="px-6 py-3 font-medium text-slate-800">{{ log.accion }}</td>
                         <td class="px-6 py-3 truncate max-w-xs" [title]="log.detalles">{{ log.detalles }}</td>
                      </tr>
                   }
                </tbody>
             </table>
          </div>

          <div class="md:col-span-1 space-y-6">
             <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                   <span class="material-icons-outlined text-green-600">dns</span> Estado de Base de Datos
                </h3>
                <div class="space-y-3 text-sm">
                   <div class="flex justify-between p-2 bg-slate-50 rounded">
                      <span class="text-slate-600">Tipo de Almacenamiento</span>
                      <span class="font-bold text-indigo-600">Local (Persistente)</span>
                   </div>
                   <div class="flex justify-between p-2 bg-slate-50 rounded">
                      <span class="text-slate-600">Registros Totales</span>
                      <span class="font-bold text-slate-800">{{ dataService.auditLogs().length + dataService.legajos().length + dataService.obras().length }}</span>
                   </div>
                   <div class="flex justify-between p-2 bg-slate-50 rounded">
                      <span class="text-slate-600">Última Sincronización</span>
                      <span class="font-bold text-slate-800">Ahora</span>
                   </div>
                </div>
                <div class="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                   <strong>Nota:</strong> Esta base de datos vive en su navegador. Use "Exportar SQL" para obtener un backup compatible con PostgreSQL/MySQL.
                </div>
             </div>
          </div>
       </div>
    </div>
  `
})
export class AuditLogComponent {
  dataService = inject(DataService);

  resetDb() {
    if (confirm('PELIGRO: Esto borrará TODOS los datos de la empresa y cerrará sesión. ¿Está seguro?')) {
      this.dataService.resetDb();
    }
  }

  downloadSql() {
     const sql = this.dataService.exportToSQL();
     const blob = new Blob([sql], { type: 'text/sql' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `backup_constructora_${new Date().getTime()}.sql`;
     a.click();
     window.URL.revokeObjectURL(url);
  }
}
