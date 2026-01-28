
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

/** Custom validator to check if password and confirmPassword match */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { mismatch: true };
};

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Contenedor principal scrollable para pantallas pequeñas -->
    <div class="h-screen w-full bg-slate-900 overflow-y-auto custom-scrollbar">
      
      <!-- Fondo decorativo fijo -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 opacity-10"></div>
      </div>

      <!-- Wrapper Flex para centrado vertical (min-h-full permite scroll si es muy alto) -->
      <div class="min-h-full flex items-center justify-center p-4 relative z-10">
        
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-4">
          <div class="p-6 md:p-8">
            <div class="text-center mb-6">
              <span class="material-icons-outlined text-4xl md:text-5xl text-yellow-500 mb-2">construction</span>
              <h1 class="text-xl md:text-2xl font-bold text-slate-800">ConstructoraHR</h1>
              <p class="text-sm md:text-base text-slate-500">Sistema de Gestión Integral</p>
            </div>

            <!-- Tabs (Only show if not in verify mode) -->
            @if (viewState() !== 'verify_sent') {
              <div class="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                <button (click)="viewState.set('login'); errorMessage.set('')" [class.bg-white]="viewState() === 'login'" [class.shadow-sm]="viewState() === 'login'" class="flex-1 py-2 text-sm font-medium rounded-md transition-all">Iniciar Sesión</button>
                <button (click)="viewState.set('register'); errorMessage.set('')" [class.bg-white]="viewState() === 'register'" [class.shadow-sm]="viewState() === 'register'" class="flex-1 py-2 text-sm font-medium rounded-md transition-all">Registrar Cuenta</button>
              </div>
            }

            @if (errorMessage()) {
               <div class="bg-red-50 text-red-600 text-xs md:text-sm p-3 rounded-lg mb-4 border border-red-100 flex items-center gap-2">
                  <span class="material-icons-outlined text-base">error_outline</span> {{ errorMessage() }}
               </div>
            }
            @if (infoMessage()) {
              <div class="bg-blue-50 text-blue-700 text-xs md:text-sm p-3 rounded-lg mb-4 border border-blue-100 flex items-center gap-2">
                  <span class="material-icons-outlined text-base">info</span> {{ infoMessage() }}
               </div>
            }

            @switch (viewState()) {
              @case ('login') {
                <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
                  <div>
                    <label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                    <input formControlName="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                  </div>
                  <div>
                    <label class="block text-xs md:text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                    <input formControlName="password" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                  </div>
                  <button type="submit" [disabled]="loginForm.invalid" class="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm md:text-base">Ingresar</button>
                </form>
              }
              @case ('register') {
                <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-3">
                   <div>
                    <label class="block text-xs font-medium text-slate-700 mb-0.5">Nombre de la Empresa</label>
                    <input formControlName="companyName" type="text" placeholder="Ej: Constructora del Sur SA" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-700 mb-0.5">Nombre Completo (Admin)</label>
                    <input formControlName="fullName" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-700 mb-0.5">Email Corporativo</label>
                    <input formControlName="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-slate-700 mb-0.5">Contraseña</label>
                      <input formControlName="password" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-700 mb-0.5">Repetir</label>
                      <input formControlName="confirmPassword" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm">
                    </div>
                  </div>
                  @if (registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched) {
                    <p class="text-xs text-red-500">Las contraseñas no coinciden.</p>
                  }
                  <button type="submit" [disabled]="registerForm.invalid || isLoading()" class="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center text-sm md:text-base">
                    @if(isLoading()){ <span class="material-icons-outlined animate-spin text-sm">refresh</span> } @else { Crear Cuenta }
                  </button>
                </form>
              }
              @case ('verify_sent') {
                <div class="text-center space-y-4 py-4">
                  <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                     <span class="material-icons-outlined text-3xl">mark_email_read</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-800">Verificación Requerida</h3>
                  <p class="text-sm text-slate-600">
                    Hemos enviado un código a <span class="font-bold text-slate-800">{{ pendingEmail() }}</span>.
                  </p>
                  
                  <div class="py-4">
                    <label class="block text-sm font-medium text-slate-700 mb-1 text-left">Código de Verificación</label>
                    <div class="relative">
                      <input [formControl]="codeControl" type="text" placeholder="123456" maxlength="6" class="w-full text-center text-2xl tracking-widest px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                      
                      <!-- Botón mágico para saltar el bloqueo de email -->
                      <button type="button" (click)="autoFillCode()" class="absolute right-2 top-2 bottom-2 px-3 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100 transition-colors" title="Usar si el email no llega">
                        SIMULAR RECEPCIÓN
                      </button>
                    </div>
                  </div>
                  
                  <button (click)="validateCode()" [disabled]="codeControl.invalid || codeControl.value?.length !== 6" class="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                     Verificar Cuenta
                  </button>

                   <!-- DEBUG PANEL (Hidden if user uses the button above mostly, but kept for context) -->
                   @if (!codeControl.value) {
                      <p class="text-xs text-slate-400 mt-4">¿Problemas con el correo? Use el botón "Simular Recepción" dentro de la casilla.</p>
                   }

                   <div class="pt-4 flex flex-col items-center">
                       <button (click)="viewState.set('login')" class="text-blue-600 text-sm hover:underline">Volver al inicio</button>
                   </div>
                </div>
              }
            }
          </div>
          <div class="px-6 md:px-8 py-4 bg-slate-50 text-center border-t border-slate-100">
            <p class="text-xs text-slate-400">© 2026 ConstructoraHR System</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  dataService = inject(DataService);
  private router: Router = inject(Router);
  fb = inject(FormBuilder);

  // States: 'login' | 'register' | 'verify_sent'
  viewState = signal<'login' | 'register' | 'verify_sent'>('login');
  errorMessage = signal('');
  infoMessage = signal('');
  pendingEmail = signal('');
  isLoading = signal(false);

  // Compute the code dynamically for the UI to display it
  debugCode = computed(() => {
    return this.dataService.getVerificationCodeDebug(this.pendingEmail()) || '';
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    companyName: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });
  
  codeControl = this.fb.control('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]);

  onLogin() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    
    // Obtener resultado detallado
    const result = this.dataService.login(email!, password!);
    
    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      // Mostrar mensaje específico según el error
      if (result.error === 'email') {
          this.errorMessage.set('El correo electrónico ingresado no existe.');
      } else if (result.error === 'password') {
          this.errorMessage.set('La contraseña es incorrecta.');
      } else if (result.error === 'unverified') {
          this.errorMessage.set('Su cuenta no está verificada. Revise su correo.');
          this.pendingEmail.set(email!);
          this.viewState.set('verify_sent'); // Opcional: llevarlo a verificar
      } else {
          this.errorMessage.set('Error desconocido al iniciar sesión.');
      }
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.infoMessage.set('');
    
    const { companyName, fullName, email, password } = this.registerForm.value;
    
    // Register without immediate login
    const success = await this.dataService.register(fullName!, email!, password!, companyName!);
    
    this.isLoading.set(false);

    if (success) {
      this.pendingEmail.set(email!);
      this.viewState.set('verify_sent');
      this.infoMessage.set(`Cuenta creada. Verifique su identidad.`);
    } else {
      this.errorMessage.set('Error crítico al iniciar registro.');
    }
  }

  autoFillCode() {
    const code = this.debugCode();
    if (code) {
      this.codeControl.setValue(code);
      this.infoMessage.set('Código autocompletado (Modo Simulación)');
    }
  }

  validateCode() {
    const code = this.codeControl.value;
    if (!code) return;
    
    const success = this.dataService.validateCodeAndLogin(this.pendingEmail(), code);
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Código incorrecto. Intente nuevamente.');
    }
  }
}
