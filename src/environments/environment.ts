import data from './urls.json'; // Es diferente en la version 13

export const environment = {
  production: false,
  baseHttpUrl: data.localUrl,
  v100: 1.0,
  loginEnable: false,
};

// if (!environment.production) {
//   import('@stagewise/toolbar').then(({ initToolbar }) => {
//     const stagewiseConfig = { plugins: [] };
//     initToolbar(stagewiseConfig);
//   });
// }
