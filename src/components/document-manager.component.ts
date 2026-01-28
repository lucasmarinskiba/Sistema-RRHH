
import { Component, inject, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-document-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
         <h2 class="text-2xl font-bold text-slate-800">Gestión Documental</h2>
         <div class="flex gap-2">
             @if (dataService.dbStatus() === 'local') {
                <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-200 font-bold">Modo Local</span>
             }
             <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Base de Datos: {{ dataService.dbStatus() }}</span>
         </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form Section -->
        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold text-slate-700 mb-4">Cargar Documento / Formulario</h3>
            
            @if (showCamera()) {
               <!-- Camera UI -->
               <div class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                  <video #video autoplay playsinline class="w-full h-full object-cover"></video>
                  <div class="absolute bottom-8 flex gap-4 z-50">
                     <button (click)="capturePhoto()" class="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-lg flex items-center justify-center">
                        <div class="w-12 h-12 bg-red-500 rounded-full"></div>
                     </button>
                     <button (click)="stopCamera()" class="absolute right-[-80px] top-4 bg-black/50 text-white p-2 rounded-full backdrop-blur">
                        <span class="material-icons-outlined">close</span>
                     </button>
                  </div>
               </div>
            }

            <form [formGroup]="docForm" (ngSubmit)="save()" class="space-y-4">
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Legajo (Empleado)</label>
                @if (dataService.legajos().length === 0) {
                  <p class="text-sm text-red-500 mb-2">Debe registrar empleados primero.</p>
                } @else {
                  <select formControlName="legajoId" class="w-full border-slate-300 rounded-lg text-sm shadow-sm">
                     @for (emp of dataService.legajos(); track emp.id) {
                       <option [value]="emp.id">#{{emp.nroLegajo}} - {{ emp.apellido }}, {{ emp.nombre }}</option>
                     }
                  </select>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
                <select formControlName="tipo" class="w-full border-slate-300 rounded-lg text-sm shadow-sm">
                  <optgroup label="Ingreso y Alta">
                     <option value="Alta">Formulario de Alta</option>
                     <option value="EntregaEPP">Entrega Ropa de Trabajo (EPP)</option>
                  </optgroup>
                  <optgroup label="Novedades Médicas/ART">
                     <option value="CertificadoMedico">Certificado Médico / Enfermedad</option>
                     <option value="FormularioART">Denuncia/Formulario ART</option>
                  </optgroup>
                  <optgroup label="Gestión">
                     <option value="ModificacionObra">Modificación de Obra</option>
                     <option value="PlanillaHoraria">Planilla Horaria / Descansos</option>
                     <option value="Baja">Formulario de Baja</option>
                  </optgroup>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Fecha Vencimiento (Opcional)</label>
                <input formControlName="fechaVencimiento" type="date" class="w-full border-slate-300 rounded-lg text-sm shadow-sm">
              </div>

              <!-- Upload Area -->
              <div class="space-y-3">
                 <!-- File Input -->
                 <input type="file" (change)="onFileSelected($event)" class="hidden" id="fileUpload" accept="image/*,application/pdf">
                 
                 <div class="grid grid-cols-2 gap-2">
                    <label for="fileUpload" class="cursor-pointer border border-dashed border-indigo-200 bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100 transition-colors">
                        <span class="material-icons-outlined text-indigo-500 text-2xl">upload_file</span>
                        <span class="block text-xs text-indigo-700 font-medium mt-1">Subir Archivo/PDF</span>
                    </label>

                    <button type="button" (click)="startCamera()" class="cursor-pointer border border-dashed border-slate-200 bg-slate-50 rounded-lg p-4 text-center hover:bg-slate-100 transition-colors">
                        <span class="material-icons-outlined text-slate-500 text-2xl">photo_camera</span>
                        <span class="block text-xs text-slate-700 font-medium mt-1">Tomar Foto</span>
                    </button>
                 </div>
                 
                 @if (previewImage()) {
                   <div class="relative group bg-slate-100 rounded-lg overflow-hidden h-24 flex items-center justify-center border border-slate-200">
                      @if (previewImage()!.startsWith('data:image')) {
                         <img [src]="previewImage()" class="max-h-full max-w-full object-contain">
                      } @else {
                         <span class="flex flex-col items-center text-slate-500">
                           <span class="material-icons-outlined">picture_as_pdf</span>
                           <span class="text-xs">PDF Cargado</span>
                         </span>
                      }
                      
                      @if (previewImage()!.startsWith('data:image')) {
                          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" (click)="analyzeDoc()" [disabled]="isAnalyzing()" class="bg-white text-indigo-600 text-xs px-3 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                <span class="material-icons-outlined text-sm">auto_awesome</span> 
                                {{ isAnalyzing() ? 'Analizando...' : 'Analizar con IA' }}
                              </button>
                          </div>
                      }
                   </div>
                 }
              </div>

              @if (analysisResult()) {
                <div class="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 animate-pulse">
                  <div class="flex items-center gap-1 mb-1 font-bold">
                     <span class="material-icons-outlined text-sm">smart_toy</span> Gemini Vision
                  </div>
                  {{ analysisResult() }}
                </div>
              }

              <button type="submit" [disabled]="docForm.invalid || dataService.legajos().length === 0" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                 <span class="material-icons-outlined text-sm">save</span> Guardar Documento
              </button>
            </form>
          </div>
        </div>

        <!-- List Section -->
        <div class="lg:col-span-2 space-y-4">
           @if (dataService.documentos().length === 0) {
             <div class="p-8 text-center bg-white border border-slate-200 rounded-xl">
               <span class="material-icons-outlined text-4xl text-slate-300 mb-2">folder_off</span>
               <p class="text-slate-500">No hay documentos cargados.</p>
             </div>
           }
           @for (doc of dataService.documentos(); track doc.id) {
             <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50">
                <div class="flex items-center gap-4">
                   <div [class]="getColorForType(doc.tipo)" class="w-10 h-10 rounded flex items-center justify-center shrink-0">
                      <span class="material-icons-outlined">{{ getIconForType(doc.tipo) }}</span>
                   </div>
                   <div>
                      <h4 class="font-medium text-slate-800">
                        {{ doc.tipo }} 
                        <span class="text-xs text-slate-400 font-normal ml-2">({{ doc.fechaCarga | date }})</span>
                      </h4>
                      <p class="text-xs text-slate-500">Legajo ID: {{ doc.legajoId }}</p>
                      @if (doc.observaciones) {
                        <p class="text-xs text-slate-600 italic mt-1">"{{ doc.observaciones }}"</p>
                      }
                   </div>
                </div>
                <div class="text-right flex flex-col items-end gap-2">
                   @if (doc.fechaVencimiento) {
                     <div>
                       <p class="text-xs text-slate-500">Vencimiento</p>
                       <p class="text-sm font-bold" [class.text-red-600]="isExpired(doc.fechaVencimiento)">{{ doc.fechaVencimiento | date }}</p>
                     </div>
                   }
                   
                   @if (doc.contenido) {
                      <button (click)="viewDocument(doc.contenido)" class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-200 flex items-center gap-1">
                        <span class="material-icons-outlined text-sm">visibility</span> Ver Archivo
                      </button>
                   }
                </div>
             </div>
           }
        </div>
      </div>
    </div>
  `
})
export class DocumentManagerComponent implements OnDestroy {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);
  fb = inject(FormBuilder);
  
  previewImage = signal<string | null>(null);
  analysisResult = signal<string | null>(null);
  isAnalyzing = signal(false);

  // Camera Logic
  showCamera = signal(false);
  videoStream: MediaStream | null = null;
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;

  docForm = this.fb.group({
    legajoId: [null as string | null, Validators.required],
    tipo: ['Alta', Validators.required],
    fechaVencimiento: [''],
    rutaArchivo: ['']
  });

  getIconForType(type: string) {
     switch(type) {
         case 'Alta': return 'person_add';
         case 'Baja': return 'person_remove';
         case 'CertificadoMedico': return 'medical_services';
         case 'FormularioART': return 'health_and_safety';
         case 'ModificacionObra': return 'transfer_within_a_station';
         case 'PlanillaHoraria': return 'schedule';
         case 'EntregaEPP': return 'engineering';
         default: return 'description';
     }
  }

  getColorForType(type: string) {
      if (type === 'Baja') return 'bg-red-100 text-red-600';
      if (type === 'Alta') return 'bg-green-100 text-green-600';
      if (type === 'ModificacionObra') return 'bg-orange-100 text-orange-600';
      return 'bg-blue-100 text-blue-600';
  }

  async startCamera() {
    this.showCamera.set(true);
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setTimeout(() => {
        if (this.videoElement) {
           this.videoElement.nativeElement.srcObject = this.videoStream;
        }
      }, 100);
    } catch (e) {
      console.error(e);
      alert('No se pudo acceder a la cámara. Verifique los permisos.');
      this.showCamera.set(false);
    }
  }

  capturePhoto() {
    if (!this.videoElement || !this.videoStream) return;
    
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    
    // Optimización para Firestore
    const maxWidth = 800;
    const scale = maxWidth / video.videoWidth;
    canvas.width = maxWidth;
    canvas.height = video.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
    this.previewImage.set(dataUrl);
    this.docForm.patchValue({ rutaArchivo: 'foto_camara_' + Date.now() + '.jpg' });
    
    this.stopCamera();
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.showCamera.set(false);
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result as string;

        if (file.type === 'application/pdf') {
             if (result.length > 900000) {
                 alert('El PDF es demasiado grande para este demo.');
                 return;
             }
             this.previewImage.set(result);
             this.docForm.patchValue({ rutaArchivo: file.name });
        } else {
             const img = new Image();
             img.src = result;
             img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const maxWidth = 800;
                if (width > maxWidth) {
                  height = height * (maxWidth / width);
                  width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                this.previewImage.set(compressedBase64);
                this.docForm.patchValue({ rutaArchivo: file.name });
             };
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Ahora llama al método real de Gemini Vision
  async analyzeDoc() {
    const img = this.previewImage();
    if (!img || !img.startsWith('data:image')) return;
    this.isAnalyzing.set(true);
    
    const text = await this.geminiService.analyzeDocument(
        img, 
        'Analiza este documento administrativo de obra. Extrae en texto plano: Tipo de documento (Certificado Médico, Alta, etc.), Fecha, y un breve resumen del contenido.'
    );
    
    this.analysisResult.set(text);
    this.isAnalyzing.set(false);
  }

  save() {
    if (this.docForm.invalid) return;
    const val = this.docForm.value;
    
    this.dataService.addDocumento({
      legajoId: val.legajoId!,
      tipo: val.tipo as any,
      fechaCarga: new Date().toISOString().split('T')[0],
      fechaVencimiento: val.fechaVencimiento || undefined,
      rutaArchivo: val.rutaArchivo || '',
      observaciones: this.analysisResult() || '',
      contenido: this.previewImage() || undefined
    });
    
    this.docForm.reset({ tipo: 'Alta' });
    this.previewImage.set(null);
    this.analysisResult.set(null);
  }

  isExpired(dateStr?: string) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  viewDocument(base64: string) {
    const win = window.open("");
    if (win) {
       if (base64.startsWith('data:application/pdf')) {
           win.document.write(`<embed width="100%" height="100%" src="${base64}" type="application/pdf">`);
       } else {
           win.document.write(`<div style="display:flex;justify-content:center;background:#f0f0f0;height:100vh;align-items:center;"><img src="${base64}" style="max-width: 90%; max-height: 90vh; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`);
       }
       win.document.title = "Vista Previa de Documento";
    }
  }
}
