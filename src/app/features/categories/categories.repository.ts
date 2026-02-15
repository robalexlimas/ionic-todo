import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../core/storage/storage.service';
import { Category } from '../../shared/models/category.model';
import { categoryCreateSchema, categoryUpdateSchema } from '../../shared/validators/schemas';
import { uuid } from '../../shared/utils/uuid';

const STORAGE_KEY = 'categories:v1';
const SAVE_DEBOUNCE_MS = 350;

@Injectable({ providedIn: 'root' })
export class CategoriesRepository {
    private storage = inject(StorageService);

    private _categories$ = new BehaviorSubject<Category[]>([]);
    categories$ = this._categories$.asObservable();

    private saveTimer: ReturnType<typeof setTimeout> | null = null;

    get snapshot(): Category[] {
        return this._categories$.getValue();
    }

    async load(): Promise<void> {
        const stored = await this.storage.get<Category[]>(STORAGE_KEY, []);
        if (Array.isArray(stored)) {
            this._categories$.next(stored);
        }
    }

    private scheduleSave(next: Category[]): void {
        if (this.saveTimer) clearTimeout(this.saveTimer);

        this.saveTimer = setTimeout(() => {
            void this.storage.set(STORAGE_KEY, next);
            this.saveTimer = null;
        }, SAVE_DEBOUNCE_MS);
    }

    async create(input: { name: string; color?: string }): Promise<Category> {
        const parsed = categoryCreateSchema.parse(input);
        const now = Date.now();

        const nameLower = parsed.name.toLowerCase();
        const exists = this.snapshot.some((c) => c.name.toLowerCase() === nameLower);
        if (exists) throw new Error('Ya existe una categoría con ese nombre');

        const category: Category = {
            id: uuid(),
            name: parsed.name,
            color: parsed.color,
            createdAt: now,
            updatedAt: now,
        };

        const next = [category, ...this.snapshot];
        this._categories$.next(next);
        this.scheduleSave(next);

        return category;
    }

    async update(id: string, input: { name?: string; color?: string }): Promise<void> {
        const parsed = categoryUpdateSchema.parse(input);
        const now = Date.now();

        if (parsed.name) {
            const nameLower = parsed.name.toLowerCase();
            const exists = this.snapshot.some(
                (c) => c.id !== id && c.name.toLowerCase() === nameLower
            );
            if (exists) throw new Error('Ya existe una categoría con ese nombre');
        }

        const next = this.snapshot.map((c) =>
            c.id === id ? { ...c, ...parsed, updatedAt: now } : c
        );

        this._categories$.next(next);
        this.scheduleSave(next);
    }

    async remove(id: string): Promise<void> {
        const next = this.snapshot.filter((c) => c.id !== id);
        this._categories$.next(next);
        this.scheduleSave(next);
    }
}
