import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { categoryCreateSchema } from '../shared/validators/schemas';
import { firstZodErrorMessage } from '../shared/validators/zod-errors';
import { TodosRepository } from '../features/todos/todos.repository';

addIcons({ trashOutline });

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
export class Tab2Page {
  private categoriesRepo = inject(CategoriesRepository);
  private todosRepo = inject(TodosRepository);
  private toastCtrl = inject(ToastController);

  categories$ = this.categoriesRepo.categories$;
  name = '';

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

    await this.categoriesRepo.create(parsed.data);
    this.name = '';
  }

  async removeCategory(id: string): Promise<void> {
    await this.categoriesRepo.remove(id);
    await this.todosRepo.clearCategory(id); // integridad: tasks sin categoría
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
