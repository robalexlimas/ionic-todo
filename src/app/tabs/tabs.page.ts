import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { folderOutline, optionsOutline, settingsOutline } from 'ionicons/icons';
import { AsyncPipe, NgIf } from '@angular/common';
import { map } from 'rxjs';

import { RemoteConfigService } from '../core/firebase/remote-config.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, NgIf, AsyncPipe],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  private rc = inject(RemoteConfigService);
  ffCategories$ = this.rc.flags$.pipe(map((f) => f.ff_categories));

  constructor() {
    addIcons({ folderOutline, optionsOutline, settingsOutline });
  }
}
