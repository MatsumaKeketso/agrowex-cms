import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import { firestoreDB } from "./authService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
const _locales = [
  { value: "af_ZA", label: "Afrikaans (South Africa)" },
  { value: "ar_EG", label: "Arabic (Egypt)" },
  { value: "az_AZ", label: "Azerbaijani (Azerbaijan)" },
  { value: "bg_BG", label: "Bulgarian (Bulgaria)" },
  { value: "bn_BD", label: "Bengali (Bangladesh)" },
  { value: "by_BY", label: "Belarusian (Belarus)" },
  { value: "ca_ES", label: "Catalan (Spain)" },
  { value: "cs_CZ", label: "Czech (Czech Republic)" },
  { value: "da_DK", label: "Danish (Denmark)" },
  { value: "de_DE", label: "German (Germany)" },
  { value: "el_GR", label: "Greek (Greece)" },
  { value: "en_GB", label: "English (United Kingdom)" },
  { value: "en_US", label: "English (United States)" },
  { value: "es_ES", label: "Spanish (Spain)" },
  { value: "et_EE", label: "Estonian (Estonia)" },
  { value: "fa_IR", label: "Persian (Iran)" },
  { value: "fi_FI", label: "Finnish (Finland)" },
  { value: "fr_BE", label: "French (Belgium)" },
  { value: "fr_FR", label: "French (France)" },
  { value: "ga_IE", label: "Irish (Ireland)" },
  { value: "gl_ES", label: "Galician (Spain)" },
  { value: "he_IL", label: "Hebrew (Israel)" },
  { value: "hi_IN", label: "Hindi (India)" },
  { value: "hr_HR", label: "Croatian (Croatia)" },
  { value: "hu_HU", label: "Hungarian (Hungary)" },
  { value: "hy_AM", label: "Armenian (Armenia)" },
  { value: "id_ID", label: "Indonesian (Indonesia)" },
  { value: "is_IS", label: "Icelandic (Iceland)" },
  { value: "it_IT", label: "Italian (Italy)" },
  { value: "ja_JP", label: "Japanese (Japan)" },
  { value: "ka_GE", label: "Georgian (Georgia)" },
  { value: "kk_KZ", label: "Kazakh (Kazakhstan)" },
  { value: "km_KH", label: "Khmer (Cambodia)" },
  { value: "kn_IN", label: "Kannada (India)" },
  { value: "ko_KR", label: "Korean (South Korea)" },
  { value: "ku_IQ", label: "Kurdish (Iraq)" },
  { value: "lt_LT", label: "Lithuanian (Lithuania)" },
  { value: "lv_LV", label: "Latvian (Latvia)" },
  { value: "mk_MK", label: "Macedonian (North Macedonia)" },
  { value: "mn_MN", label: "Mongolian (Mongolia)" },
  { value: "ms_MY", label: "Malay (Malaysia)" },
  { value: "nb_NO", label: "Norwegian Bokmål (Norway)" },
  { value: "ne_NP", label: "Nepali (Nepal)" },
  { value: "nl_BE", label: "Dutch (Belgium)" },
  { value: "nl_NL", label: "Dutch (Netherlands)" },
  { value: "pl_PL", label: "Polish (Poland)" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "pt_PT", label: "Portuguese (Portugal)" },
  { value: "ro_RO", label: "Romanian (Romania)" },
  { value: "ru_RU", label: "Russian (Russia)" },
  { value: "sk_SK", label: "Slovak (Slovakia)" },
  { value: "sl_SI", label: "Slovenian (Slovenia)" },
  { value: "sr_RS", label: "Serbian (Serbia)" },
  { value: "sv_SE", label: "Swedish (Sweden)" },
  { value: "ta_IN", label: "Tamil (India)" },
  { value: "th_TH", label: "Thai (Thailand)" },
  { value: "tr_TR", label: "Turkish (Turkey)" },
  { value: "uk_UA", label: "Ukrainian (Ukraine)" },
  { value: "ur_PK", label: "Urdu (Pakistan)" },
  { value: "uz_UZ", label: "Uzbek (Uzbekistan)" },
  { value: "vi_VN", label: "Vietnamese (Vietnam)" },
  { value: "zh_CN", label: "Chinese (Simplified)" },
  { value: "zh_HK", label: "Chinese (Hong Kong)" },
  { value: "zh_TW", label: "Chinese (Taiwan)" },
];
export const storage = getStorage();
export const SystemService = {
  getExchangeRates: async () => {
    (await fetch("https://api.exchangerate-api.com/v4/latest/USD")).json().then(data => {
      const rates = data.rates
      return rates
    }).catch(err => {
      console.log(err);

    })
  },
  setCurrencyList: async () => {
    (await fetch("'https://openexchangerates.org/api/currencies.json'")).json().then(data => {
      const currency = data
      // set to local storage
      localStorage.setItem("currency", currency);
    }).catch(error => {
      console.log(error)
    })
  },
  getCurrencyList: async () => {
    const currency = await localStorage.getItem("currency")
    return currency
  },
  getLocales: async () => {
    return _locales
  },
  setLocale: async (locale) => {
    try {
      // set current locale to local storage
      localStorage.setItem("locale", locale);
      return locale
    } catch (error) {
      console.log(error)
      return error
    }

  },
  currentLocale: async () => {
    const cl = await localStorage.getItem("locale")
    return cl ? cl : "en_US"
  },
  getVariables: () => {

  },
  /**
   * 
   * @param {*} profitability 
   * @param {*} productionPlan 
   * @param {*} offtake 
   * @returns {object} { 
   * Total Production Cost = t_p_c,
   * Total Unit Cost = t_u_c,
   * Target/Required Yield Output = t_r_y_o,
   * Unit Production Cost = u_p_c, 
   * REVENUE = revenue,
   * OVERALL PROFITABILITY = o_p
   * 
   * }
   * 
   */
  calculations: (profitability, productionPlan, offtake) => {
    // Total Production Cost = Sum of all Total Unit Cost per Category on the Production Plan
    // profitability = { 
    //   total_offtake_offer, 
    //   total_cost_of_production,
    //   offtake_gross_profit 
    //  }
    const t_p_c = profitability.total_cost_of_production


    // Total Unit Cost = Unit cost x Quantity Used per Ha x Application Interval x Total # of Ha/Tunnel
    let t_u_c = 0
    productionPlan?.forEach(category => {
      category._steps.forEach(step => {
        step._costing.forEach(cost => {
          if (cost?.include_in_cost) {
            t_u_c = t_u_c + cost.total_unit_cost
          } else {
            t_u_c = t_u_c + 0
          }
        })
      })
    })

    // Target/Required Yield Output = Planned Yield/Output per Production Unit X Production Resource Capacity
    const t_r_y_o = offtake?._production_plan?.yield_output_per_unit * offtake?._production_plan?.prod_res_cap


    // Unit Production Cost = Total Production Cost / Number of Units Required/Offered
    const u_p_c = t_p_c / offtake.quantity

    // REVENUE = Offer Price X Require/Offered Number of Units
    const revenue = offtake.quantity * offtake?._price_details?.offer_price_per_unit

    // OVERALL PROFITABILITY =   Revenue(# of Units X Offer Price) – Production Cost(Total Production Cost) - AGROWEX Licensing Fee(10 % of Gross profit = Revenue - Production Cost)
    const o_p = revenue - t_p_c - (revenue * 0.1)

    return { t_p_c, t_u_c, t_r_y_o, u_p_c, revenue, o_p }


  },
  /**
   * 
   * @param {*} ot 
   * @param {*} plan 
   * @returns {object} {
   * total_offtake_offer,
   * total_cost_of_production,
   * offtake_gross_profit
   * }
   */
  profitabilityCalucation: async (ot, plan) => {
    // Revenue (# of Units X Offer Price) – Production Cost (Total Production Cost) - AGROWEX Licensing Fee (10% of Gross profit = Revenue- Production Cost)
    var tot_cost = 0
    if (plan) {
      plan.forEach(category => {
        category._steps.map((step) => {
          step._costing.map((cost) => {
            tot_cost = tot_cost + cost.amount
          })
        })
      });
      const total_offtake_offer = ot?._commodity_details?.quantity * ot?._price_details?.offer_price_per_unit
      const total_cost_of_production = tot_cost
      const offtake_gross_profit = total_offtake_offer - total_cost_of_production
      return { total_offtake_offer, total_cost_of_production, offtake_gross_profit }
    }
  },
  // // todo update function to pull from db
  getPermissions: async () => {
    const docRef = doc(firestoreDB, "system", "permissions");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), key: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  updatePermissions: async (permissions) => {
    await updateDoc(doc(firestoreDB, 'system', 'permissions'), { ...permissions, updated_at: SystemService.generateTimestamp() });
  },
  uploadFile: (path, fileObject) => {

    const metadata = {
      contentType: fileObject.type
    };
    console.log(`cms-documents/${path}/${fileObject.name}`);

    const storageRef = sRef(storage, `cms-documents/${path}${fileObject.name}`);

    const uploadTask = uploadBytesResumable(storageRef, fileObject, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            break;
        }
      },
      (error) => {

        // A full list of error codes is available at
        switch (error.code) {

          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
          default:
            break;

        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          return downloadURL
        });
      }
    );



  },
  convertTimestampToDateString: (timestamp) => {
    // Create a new Date object using the timestamp
    const date = new Date(timestamp);

    // Array of month names
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"
    ];

    // Extract the day, month, and year from the Date object
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Return the formatted string
    return `${day} ${month}, ${year}`;
  },
  generateTimestamp: () => {
    return Date.now();
  },
  // // todo need to add time string for this formating
  formatTimestamp: (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-GB', options).replace(',', '')
    //  ' at ' + 
    //  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  },
  getDataType: (value) => {
    /**
     * Returns a string representation of the data type of the input value.
     * 
     * @param {any} value - Any JavaScript value
     * @returns {string} String representation of the value's type
     * 
     * Examples:
     * getTypeString(42) // returns "number"
     * getTypeString("hello") // returns "string"
     * getTypeString([1, 2, 3]) // returns "array"
     * getTypeString({a: 1}) // returns "object"
     * getTypeString(true) // returns "boolean"
     * getTypeString(null) // returns "null"
     * getTypeString(undefined) // returns "undefined"
     */

    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      return "array";
    }

    if (value instanceof Date) {
      return "date";
    }

    if (value instanceof RegExp) {
      return "regexp";
    }

    if (typeof value === "object" && value instanceof Map) {
      return "map";
    }

    if (typeof value === "object" && value instanceof Set) {
      return "set";
    }

    if (typeof value === "function") {
      return "function";
    }

    return typeof value;
  }
  ,
  converStringToSentenceCase: (str) => {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  },
  formatCurrency: (value) => {
    const numberised = Number(value).toFixed(2)
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ZAR' }).format(numberised)
    return formatted
  }
}

