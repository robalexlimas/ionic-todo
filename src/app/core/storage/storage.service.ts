import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private readyPromise: Promise<void>;

    constructor(private storage: Storage) {
        this.readyPromise = this.storage.create().then(() => void 0);
    }

    async get<T>(key: string, fallback: T): Promise<T> {
        await this.readyPromise;
        const v = await this.storage.get(key);
        return (v ?? fallback) as T;
    }

    async set<T>(key: string, value: T): Promise<void> {
        await this.readyPromise;
        await this.storage.set(key, value);
    }
}