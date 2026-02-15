import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TodosRepository } from './features/todos/todos.repository';
import { CategoriesRepository } from './features/categories/categories.repository';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private todosRepo = inject(TodosRepository);
  private categoriesRepo = inject(CategoriesRepository);

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await Promise.all([this.todosRepo.load(), this.categoriesRepo.load()]);
  }
}
