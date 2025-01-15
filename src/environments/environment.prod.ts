import data from './urls.json'; // Es diferente en la version 13

export const environment = {
  production: false,
  baseHttpUrl: data.prodUrl,
  v100: 1.0,
  loginEnable: false,
};
