import _I18N from 'react-native-i18n'
import en from './locales/en'
import zh_Hans from './locales/zh_Hans'

_I18N.fallbacks = true

_I18N.translations = {
  en: en,
  'zh-CN': zh_Hans, // 国产机型-中国大陆
  'zh-HK': zh_Hans, // 国产机型-中国香港
  'zh-TW': zh_Hans, // 国产机型-中国台湾
  'zh-Hans': zh_Hans, // 国外机型-汉语简体
  'zh-Hant': zh_Hans // 国外机型-汉语繁体
}

class I18N {
  getLang = (key: string, defaultResult = '') => {
    return _I18N.t(key, { defaultValue: defaultResult })
  }

  formatLang = (key: string, ...values: string[]) => {
    const txt = _I18N.t(key)
    return txt ? txt.replace(/{(\d*)}+/g, (p, t) => values[parseInt(t, 10)] || '') : ''
  }

  getDpLang = (dpCode: string, dpValue?: any) => {
    let dpVal;
    switch (typeof dpValue) {
      case "boolean":
        dpVal = dpValue ? "on": "off"
        break;
      default:
        // dpVal = dpValue
        break;
    }
    if(typeof dpValue === 'undefined'){
      return _I18N.t(`dp_${dpCode}`, { defaultValue: "" })
    }
    return _I18N.t(`dp_${dpCode}_${dpVal}`, { defaultValue: "" })
  }

  getFaultString = (
    dpcode: string,
    fault: number,
    scheam: any,
    sign = ','
  ): string => {
    const schema = scheam[dpcode] as any;
    if (schema === undefined) {
      return '';
    }
    const faultValues: string[] = [];
    schema.label.forEach((val, index) => {
      faultValues[index] = val;
    });

    let errArray = '';
    let defaulList = '';
    if (fault !== undefined) {
      defaulList = fault.toString(2);
    }
    const errList = defaulList.split('').reverse().join('');
    for (let i = 0; i < errList.length; i++) {
      if (errList.substring(i, i + 1) === '1') {
        if (errArray && sign) {
          errArray += sign;
        }
        errArray = `${errArray + faultValues[i]} `;
      }
    }
    return errArray;
  }
}

export default I18N