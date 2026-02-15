import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../core/storage/storage.service';
import { Category } from '../../shared/models/category.model';
import { categoryCreateSchema, categoryUpdateSchema } from '../../shared/validators/schemas';
import { uuid } from '../../shared/utils/uuid';

const STORAGE_KEY = 'categories:v1';

@Injectable({ providedIn: 'root' })
export class CategoriesRepository {
    private readonly _categories$ = new BehaviorSubject<Category[]>([]);
    readonly categories$ = this._categories$.asObservable();

    constructor(private storage: StorageService) { }

    async load(): Promise<void> {
        const list = await this.storage.get<Category[]>(STORAGE_KEY, []);
        this._categories$.next(list);
    }

    get snapshot(): Category[] {
        return this._categories$.value;
    }

    async create(input: { name: string; color?: string }): Promise<Category> {
        const parsed = categoryCreateSchema.parse(input);

        const nameLower = parsed.name.toLowerCase();
        const exists = this.snapshot.some((c) => c.name.toLowerCase() === nameLower);
        if (exists) {
            throw new Error('Ya existe una categoría con ese nombre');
        }

        const now = Date.now();

        const category: Category = {
            id: uuid(),
            name: parsed.name,
            color: parsed.color,
            createdAt: now,
            updatedAt: now,
        };

        const next = [category, ...this.snapshot];
        this._categories$.next(next);
        await this.storage.set(STORAGE_KEY, next);
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
            c.id === id
                ? {
                    ...c,
                    ...parsed,
                    updatedAt: now,
                }
                : c
        );

        this._categories$.next(next);
        await this.storage.set(STORAGE_KEY, next);
    }

    async remove(id: string): Promise<void> {
        const next = this.snapshot.filter((c) => c.id !== id);
        this._categories$.next(next);
        await this.storage.set(STORAGE_KEY, next);
    }
}
