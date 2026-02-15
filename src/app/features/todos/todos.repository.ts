import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../core/storage/storage.service';
import { Todo } from '../../shared/models/todo.model';
import { todoCreateSchema, todoUpdateSchema } from '../../shared/validators/schemas';
import { uuid } from '../../shared/utils/uuid';

const STORAGE_KEY = 'todos:v1';
const SAVE_DEBOUNCE_MS = 350;

@Injectable({ providedIn: 'root' })
export class TodosRepository {
    private storage = inject(StorageService);

    private _todos$ = new BehaviorSubject<Todo[]>([]);
    todos$ = this._todos$.asObservable();

    private saveTimer: ReturnType<typeof setTimeout> | null = null;

    get snapshot(): Todo[] {
        return this._todos$.getValue();
    }

    async load(): Promise<void> {
        const stored = await this.storage.get<Todo[]>(STORAGE_KEY, []);
        if (Array.isArray(stored)) {
            this._todos$.next(stored);
        }
    }

    private scheduleSave(next: Todo[]): void {
        if (this.saveTimer) clearTimeout(this.saveTimer);

        this.saveTimer = setTimeout(() => {
            void this.storage.set(STORAGE_KEY, next);
            this.saveTimer = null;
        }, SAVE_DEBOUNCE_MS);
    }

    async create(input: { title: string; categoryId?: string | null }): Promise<Todo> {
        const parsed = todoCreateSchema.parse(input);
        const now = Date.now();
        const titleLower = parsed.title.toLowerCase();
        const exists = this.snapshot.some(
            (t) =>
                t.title.toLowerCase() === titleLower &&
                (t.categoryId ?? null) === (parsed.categoryId ?? null)
        );

        if (exists) throw new Error('Ya existe una tarea igual en esa categoría');

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

    async update(
        id: string,
        input: { title?: string; completed?: boolean; categoryId?: string | null }
    ): Promise<void> {
        const idx = this.snapshot.findIndex((t) => t.id === id);
        if (idx === -1) return;

        const parsed = todoUpdateSchema.parse(input);
        const now = Date.now();

        const next = [...this.snapshot];
        next[idx] = { ...next[idx], ...parsed, updatedAt: now };

        this._todos$.next(next);
        this.scheduleSave(next);
    }

    async toggleCompleted(id: string): Promise<void> {
        const t = this.snapshot.find((x) => x.id === id);
        if (!t) return;
        await this.update(id, { completed: !t.completed });
    }

    async remove(id: string): Promise<void> {
        const next = this.snapshot.filter((t) => t.id !== id);
        this._todos$.next(next);
        this.scheduleSave(next);
    }

    async clearCategory(categoryId: string): Promise<void> {
        const now = Date.now();
        const next = this.snapshot.map((t) =>
            t.categoryId === categoryId ? { ...t, categoryId: null, updatedAt: now } : t
        );
        this._todos$.next(next);
        this.scheduleSave(next);
    }
}
