import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

import { CategoriesRepository } from '../features/categories/categories.repository';
import { categoryCreateSchema, categoryUpdateSchema } from '../shared/validators/schemas';
import { firstZodErrorMessage } from '../shared/validators/zod-errors';
import { TodosRepository } from '../features/todos/todos.repository';

addIcons({ trashOutline });

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonList,
    IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  private categoriesRepo = inject(CategoriesRepository);
  private todosRepo = inject(TodosRepository);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  categories$ = this.categoriesRepo.categories$;
  name = '';

  editingId: string = '';
  editName = '';

  startEdit(id: string, currentName: string): void {
    this.editingId = id;
    this.editName = currentName;
  }

  cancelEdit(): void {
    this.editingId = '';
    this.editName = '';
  }

  async saveEdit(id: string): Promise<void> {
    const parsed = categoryUpdateSchema.safeParse({ name: this.editName });

    if (!parsed.success) {
      const toast = await this.toastCtrl.create({
        message: firstZodErrorMessage(parsed.error),
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    try {
      await this.categoriesRepo.update(id, parsed.data);

      this.cancelEdit();
      this.cdr.markForCheck();
    } catch (e: any) {
      const toast = await this.toastCtrl.create({
        message: e?.message ?? 'No se pudo actualizar la categoría',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
    }
  }

  async addCategory(): Promise<void> {
    const parsed = categoryCreateSchema.safeParse({ name: this.name });

    if (!parsed.success) {
      const toast = await this.toastCtrl.create({
        message: firstZodErrorMessage(parsed.error),
        duration: 1600,
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    try {
      await this.categoriesRepo.create(parsed.data);
      this.name = '';
    } catch (e: any) {
      const toast = await this.toastCtrl.create({
        message: e?.message ?? 'No se pudo crear la categoría',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
    }
  }

  async removeCategory(id: string): Promise<void> {
    try {
      await this.categoriesRepo.remove(id);
      await this.todosRepo.clearCategory(id);
    } catch (e: any) {
      const toast = await this.toastCtrl.create({
        message: e?.message ?? 'No se pudo eliminar la categoría',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
    }

  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
