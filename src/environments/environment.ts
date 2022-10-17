// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: 'https://aroma.visilant.org/openmrs/ws/rest/v1',
  baseURLCoreApp : 'https://aroma.visilant.org/openmrs/coreapps/diagnoses',
  baseURLLegacy: 'https://aroma.visilant.org/openmrs',
  mindmapURL: 'http://aroma.visilant.org:3004/api',
  azureImage: 'https://aroma.visilant.org:3006/api/v1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
