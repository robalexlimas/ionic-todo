import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
    fetchAndActivate,
    getRemoteConfig,
    getValue,
    RemoteConfig,
} from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

export type AppFlags = {
    ff_categories: boolean;
};

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
    private rc!: RemoteConfig;

    private flagsSubject = new BehaviorSubject<AppFlags>({ ff_categories: true });
    flags$ = this.flagsSubject.asObservable();

    async init(): Promise<void> {
        const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);

        this.rc = getRemoteConfig(app);
        this.rc.settings.minimumFetchIntervalMillis = 0;
        this.rc.defaultConfig = { ff_categories: true };

        await this.refresh();
    }

    async refresh(): Promise<void> {
        await fetchAndActivate(this.rc);

        this.flagsSubject.next({
            ff_categories: getValue(this.rc, 'ff_categories').asBoolean(),
        });
    }
}
