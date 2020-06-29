import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
 
import Backend from 'i18next-xhr-backend';


const languages = ['de', 'en']

i18n
  // learn more: https://github.com/i18next/i18next-xhr-backend
  .use(Backend)
  // connect with React
  .use(initReactI18next)
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
 
    lng: 'de',
    fallbackLng: 'de',
    whitelist: languages,
 
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
});

// eslint-disable-next-line import/no-default-export
export default i18n;