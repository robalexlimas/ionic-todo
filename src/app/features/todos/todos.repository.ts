import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../core/storage/storage.service';
import { Todo } from '../../shared/models/todo.model';
import { todoCreateSchema, todoUpdateSchema } from '../../shared/validators/schemas';
import { uuid } from '../../shared/utils/uuid';

const STORAGE_KEY = 'todos:v1';

@Injectable({ providedIn: 'root' })
export class TodosRepository {
    private readonly _todos$ = new BehaviorSubject<Todo[]>([]);
    readonly todos$ = this._todos$.asObservable();

    private saveTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(private storage: StorageService) { }

    async load(): Promise<void> {
        const list = await this.storage.get<Todo[]>(STORAGE_KEY, []);
        this._todos$.next(list);
    }

    get snapshot(): Todo[] {
        return this._todos$.value;
    }

    async create(input: { title: string; categoryId?: string | null }): Promise<Todo> {
        const parsed = todoCreateSchema.parse(input);
        const now = Date.now();

        const todo: Todo = {
            id: uuid(),
            title: parsed.title,
            completed: false,
            categoryId: parsed.categoryId ?? null,
            createdAt: now,
            updatedAt: now,
        };

        const next = [todo, ...this.snapshot];
        this._todos$.next(next);
        this.scheduleSave(next);
        return todo;
    }

    async update(id: string, input: { title?: string; completed?: boolean; categoryId?: string | null }): Promise<void> {
        const parsed = todoUpdateSchema.parse(input);
        const now = Date.now();

        const next = this.snapshot.map((t) =>
            t.id === id
                ? {
                    ...t,
                    ...parsed,
                    updatedAt: now,
                }
                : t
        );

        this._todos$.next(next);
        this.scheduleSave(next);
    }

    async toggleCompleted(id: string): Promise<void> {
        const current = this.snapshot.find((t) => t.id === id);
        if (!current) return;
        await this.update(id, { completed: !current.completed });
    }

    async remove(id: string): Promise<void> {
        const next = this.snapshot.filter((t) => t.id !== id);
        this._todos$.next(next);
        this.scheduleSave(next);
    }

    async clearCategory(categoryId: string): Promise<void> {
        const next = this.snapshot.map((t) =>
            t.categoryId === categoryId ? { ...t, categoryId: null, updatedAt: Date.now() } : t
        );
        this._todos$.next(next);
        this.scheduleSave(next);
    }

    private scheduleSave(next: Todo[]): void {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(async () => {
            await this.storage.set(STORAGE_KEY, next);
            this.saveTimer = null;
        }, 350);
    }
}
