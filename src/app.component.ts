
import { Component, signal, inject, effect, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { DataService } from './services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    @if (dataService.currentUser()) {
      <div class="flex h-screen bg-slate-100">
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
          <div class="p-6 border-b border-slate-700 bg-slate-950/30">
            <!-- Dynamic Company Name in Sidebar -->
            <h1 class="text-lg font-bold flex items-center gap-2 truncate text-white mb-1" title="{{ dataService.empresa()?.nombre }}">
              <span class="material-icons-outlined text-yellow-500">business</span>
              <span class="truncate">{{ dataService.empresa()?.nombre || 'ConstructoraHR' }}</span>
            </h1>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest pl-8">Sistema de Gestión</p>
          </div>

          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">dashboard</span> Dashboard
            </a>
            <a routerLink="/employees" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">people</span> Personal
            </a>
            <a routerLink="/projects" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">apartment</span> Obras
            </a>
            <a routerLink="/documents" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">folder</span> Documentación
            </a>
            <a routerLink="/attendance" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">schedule</span> Asistencia
            </a>
            <a routerLink="/payroll" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">receipt_long</span> Recibos y Sueldos
            </a>
            
            <div class="my-2 border-t border-slate-800"></div>
            
            <a routerLink="/kpis" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group">
              <span class="material-icons-outlined group-hover:text-green-400 transition-colors">insights</span> KPIs & Analytics
            </a>
            <a routerLink="/alerts" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">notifications_active</span> Novedades
            </a>
            <a routerLink="/audit" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-900/50" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <span class="material-icons-outlined">history</span> Auditoría
            </a>
          </nav>

          <div class="p-4 border-t border-slate-700 bg-slate-950/20">
            <button (click)="toggleAiPanel()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-white/10">
              <span class="material-icons-outlined">smart_toy</span> AI Assistant
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-auto relative">
          <header class="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-30">
            <div class="flex items-center gap-2">
               <h2 class="text-lg font-bold text-slate-700">Gestión de Obra</h2>
               <span class="text-slate-300 text-sm">|</span>
               <span class="text-sm text-slate-500 font-medium">{{ dataService.empresa()?.nombre }}</span>
            </div>
            
            <div class="flex items-center gap-4">
              
              <!-- Info Usuario -->
              <div class="text-right hidden md:block">
                 <p class="text-sm font-bold text-slate-800">{{ dataService.currentUser()?.nombre }}</p>
                 <p class="text-xs text-slate-500">ID: {{ dataService.currentUser()?.empresaId }}</p>
              </div>

              <!-- Notificaciones -->
              <div class="relative">
                <button (click)="toggleNotifications()" class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none">
                  <span class="material-icons-outlined">notifications</span>
                  @if (unreadCount() > 0) {
                    <span class="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                    </span>
                  }
                </button>

                <!-- Dropdown Notificaciones -->
                @if (showNotifications()) {
                  <div class="fixed inset-0 z-40 bg-transparent cursor-default" (click)="toggleNotifications()"></div>
                  <div class="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div class="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                      <h3 class="text-sm font-bold text-slate-700">Notificaciones</h3>
                      <button (click)="markAllRead()" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Marcar leídas</button>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                       @if (recentLogs().length === 0) {
                         <div class="p-6 text-center text-slate-400 text-xs">
                            No hay actividad reciente.
                         </div>
                       }
                       @for (log of recentLogs(); track log.id) {
                         <div class="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors group">
                            <div class="flex items-start gap-3">
                               <div [class]="getIconColor(log.accion)" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <span class="material-icons-outlined text-sm text-white">{{ getIconForAction(log.accion) }}</span>
                               </div>
                               <div>
                                  <p class="text-xs font-bold text-slate-700">
                                    {{ log.accion }}
                                    @if (log.usuarioId === dataService.currentUser()?.id) {
                                      <span class="text-[10px] bg-slate-200 text-slate-600 px-1 rounded ml-1">Tú</span>
                                    }
                                  </p>
                                  <p class="text-xs text-slate-500 leading-snug">{{ log.detalles }}</p>
                                  <p class="text-[10px] text-slate-400 mt-1">{{ log.fecha | date:'short' }}</p>
                               </div>
                            </div>
                         </div>
                       }
                    </div>
                    <div class="p-2 bg-slate-50 text-center border-t border-slate-100">
                       <a routerLink="/audit" (click)="toggleNotifications()" class="text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer">Ver historial completo</a>
                    </div>
                  </div>
                }
              </div>

              <!-- Avatar / Logout -->
              <div (click)="dataService.logout()" class="cursor-pointer w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border-2 border-white shadow-sm hover:bg-red-100 hover:text-red-700 transition-colors" title="Cerrar Sesión">
                {{ getInitials(dataService.currentUser()?.nombre) }}
              </div>
            </div>
          </header>

          <div class="p-8">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- AI Panel -->
        @if (showAiPanel()) {
          <div class="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transform transition-transform duration-300">
            <div class="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h3 class="font-bold flex items-center gap-2"><span class="material-icons-outlined">psychology</span> HR Assistant</h3>
              <button (click)="toggleAiPanel()" class="hover:bg-indigo-700 p-1 rounded"><span class="material-icons-outlined">close</span></button>
            </div>
            
            <div class="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              @for (msg of chatMessages(); track $index) {
                <div [class]="msg.role === 'user' ? 'bg-indigo-100 ml-8' : 'bg-white border border-slate-200 mr-8'" class="p-3 rounded-lg text-sm shadow-sm relative">
                  <strong>{{ msg.role === 'user' ? 'Tú' : 'Gemini' }}:</strong>
                  <p class="whitespace-pre-wrap mt-1">{{ msg.text }}</p>
                  
                  <!-- Grounding Sources (Map/Web) -->
                  @if (msg.role === 'ai' && msg.sources && msg.sources.length > 0) {
                     <div class="mt-3 pt-2 border-t border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                           <span class="material-icons-outlined text-xs">public</span> FUENTES DE INFORMACIÓN
                        </p>
                        <div class="flex flex-wrap gap-1">
                           @for (source of msg.sources; track $index) {
                              <a [href]="source.uri" target="_blank" class="text-[10px] bg-slate-100 text-blue-600 px-2 py-1 rounded hover:underline truncate max-w-full block">
                                 {{ source.title }}
                              </a>
                           }
                        </div>
                     </div>
                  }
                </div>
              }
              @if (isLoading()) {
                <div class="flex justify-center p-2"><span class="animate-spin material-icons-outlined text-indigo-500">refresh</span></div>
              }
            </div>
            
            <div class="p-4 border-t bg-white shrink-0">
              <div class="flex gap-2">
                <input [(ngModel)]="currentMessage" (keyup.enter)="sendMessage()" type="text" placeholder="Pregunta sobre LCT, ubicaciones..." class="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                <button (click)="sendMessage()" class="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"><span class="material-icons-outlined">send</span></button>
              </div>
              <button (click)="generateSchema()" class="mt-2 text-xs text-indigo-600 hover:underline w-full text-center">Generar SQL/Modelos para Backend</button>
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- Full Page Router Outlet for Login -->
       <router-outlet></router-outlet>
    }
  `
})
export class AppComponent {
  showAiPanel = signal(false);
  
  // Notification States
  showNotifications = signal(false);
  lastViewedCount = signal(0); // Cantidad de notificaciones vistas
  
  currentMessage = '';
  chatMessages = signal<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([
    { role: 'ai', text: 'Hola. Soy tu asistente de Recursos Humanos y Jefe de Obra para una empresa constructora argentina. ' +
                             'Responde consultas sobre leyes laborales (LCT), UOCRA, materiales y ubicaciones geográficas. ' +
                             'Usa Google Search para buscar direcciones, corralones cercanos o normativas vigentes si es necesario.' }
  ]);
  isLoading = signal(false);

  public dataService = inject(DataService);
  private geminiService = inject(GeminiService);
  private router: Router = inject(Router);

  // Computados para Notificaciones
  recentLogs = computed(() => {
    return this.dataService.auditLogs().slice().reverse().slice(0, 10);
  });

  unreadCount = computed(() => {
    const total = this.dataService.auditLogs().length;
    const unread = total - this.lastViewedCount();
    return unread > 0 ? unread : 0;
  });

  constructor() {
    effect(() => {
       if (!this.dataService.currentUser()) {
         this.router.navigate(['/auth']);
       } else {
         this.lastViewedCount.set(this.dataService.auditLogs().length);
       }
    });
  }

  toggleAiPanel() {
    this.showAiPanel.update(v => !v);
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.markAllRead();
    }
  }

  markAllRead() {
    this.lastViewedCount.set(this.dataService.auditLogs().length);
  }

  getInitials(name?: string) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  getIconForAction(action: string): string {
    if (action.includes('Login')) return 'login';
    if (action.includes('Alta')) return 'add_circle';
    if (action.includes('Modificación')) return 'edit';
    if (action.includes('Firma')) return 'verified_user';
    if (action.includes('Verificación')) return 'how_to_reg';
    return 'info';
  }

  getIconColor(action: string): string {
    if (action.includes('Login')) return 'bg-blue-400';
    if (action.includes('Alta')) return 'bg-green-500';
    if (action.includes('Modificación')) return 'bg-orange-400';
    if (action.includes('Firma')) return 'bg-purple-500';
    return 'bg-slate-400';
  }

  // AI Logic
  async sendMessage() {
    if (!this.currentMessage.trim()) return;
    
    const userMsg = this.currentMessage;
    this.chatMessages.update(msgs => [...msgs, { role: 'user', text: userMsg }]);
    this.currentMessage = '';
    this.isLoading.set(true);

    const result = await this.geminiService.chatWithHR(userMsg);
    
    this.chatMessages.update(msgs => [...msgs, { 
        role: 'ai', 
        text: result.text,
        sources: result.sources 
    }]);
    this.isLoading.set(false);
  }

  async generateSchema() {
     this.chatMessages.update(msgs => [...msgs, { role: 'user', text: "Generar Schema SQL" }]);
     this.isLoading.set(true);
     const schema = await this.geminiService.generateSqlSchema();
     this.chatMessages.update(msgs => [...msgs, { role: 'ai', text: "Aquí tienes el esquema solicitado:\n\n" + schema }]);
     this.isLoading.set(false);
  }
}
