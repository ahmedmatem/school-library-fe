import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { MsalService } from '@azure/msal-angular';

bootstrapApplication(App, appConfig)
  .then(async (appRef) => {
    const msal = appRef.injector.get(MsalService);

    // REQUIRED in newer msal-browser
    await msal.instance.initialize();

    // Process redirect response (loginRedirect)
    await msal.instance.handleRedirectPromise().catch(console.error);
  })
  .catch((err) => console.error(err));
