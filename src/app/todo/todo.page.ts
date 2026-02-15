import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

import { TodosRepository } from '../features/todos/todos.repository';
import { CategoriesRepository } from '../features/categories/categories.repository';
import { todoCreateSchema } from '../shared/validators/schemas';
import { firstZodErrorMessage } from '../shared/validators/zod-errors';
import { Category } from '../shared/models/category.model';

addIcons({ trashOutline });

@Component({
  selector: 'todo-page',
  templateUrl: 'todo.page.html',
  styleUrls: ['todo.page.scss'],
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
    IonCheckbox,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonNote,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPage {
  todosRepo = inject(TodosRepository);
  private categoriesRepo = inject(CategoriesRepository);
  private toastCtrl = inject(ToastController);

  todos$ = this.todosRepo.todos$;
  categories$ = this.categoriesRepo.categories$;

  title = '';
  selectedCategoryId: string = '';

  async addTodo(): Promise<void> {
    const parsed = todoCreateSchema.safeParse({
      title: this.title,
      categoryId: this.selectedCategoryId,
    });

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
      await this.todosRepo.create(parsed.data);
      this.title = '';
      this.selectedCategoryId = '';
    } catch (e: any) {
      const toast = await this.toastCtrl.create({
        message: e?.message ?? 'No se pudo crear la tarea',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
    }
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  categoryNameById(categories: Category[], id: string | null | undefined): string {
    if (!id) return 'Sin categoría';
    const found = categories.find((c) => c.id === id);
    return found?.name ?? 'Sin categoría';
  }
}
