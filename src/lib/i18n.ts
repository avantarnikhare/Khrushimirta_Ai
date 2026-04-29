export type LanguageCode =
  | "hi"
  | "en"
  | "mr"
  | "ta"
  | "te"
  | "gu"
  | "pa"
  | "kn"
  | "bn";

export type CropId =
  | "wheat"
  | "rice"
  | "cotton"
  | "soybean"
  | "sugarcane"
  | "vegetables";

export const DEFAULT_LANGUAGE: LanguageCode = "hi";

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "bn", label: "বাংলা" },
];

export type TranslationDictionary = {
  languageName: string;
  nav: {
    home: string;
    aiAdvisor: string;
    weather: string;
    cropGuide: string;
    about: string;
  };
  header: {
    brandTagline: string;
    languageLabel: string;
    menuLabel: string;
  };
  footer: {
    copyright: string;
    founder: string;
  };
  home: {
    badge: string;
    title: string;
    description: string;
    ctaAdvisor: string;
    ctaWeather: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
    featureCards: Array<{
      title: string;
      desc: string;
      href: string;
      cta: string;
    }>;
    trustTitle: string;
    trustPoints: string[];
    testimonialTitle: string;
    testimonials: Array<{
      quote: string;
      farmer: string;
      region: string;
    }>;
  };
  snapshot: {
    title: string;
    valid: string;
    syncing: string;
    region: string;
    advisory: string;
    weather: string;
    metricsSummary: string;
    loadError: string;
    unavailable: string;
    waitingData: string;
  };
  weatherPage: {
    eyebrow: string;
    title: string;
    description: string;
  };
  weatherDashboard: {
    title: string;
    locationLoading: string;
    updatedLabel: string;
    openWeatherLabel: string;
    defaultLocationLabel: string;
    buttons: {
      useMyLocation: string;
      enterManually: string;
      refreshWeather: string;
      clearDefault: string;
      saveDefault: string;
    };
    placeholders: {
      manualLocation: string;
      suggestionTitle: string;
    };
    status: {
      detectingLocation: string;
      manualSaved: string;
      manualWeather: string;
      gpsLive: string;
      ipFallback: string;
      permissionDenied: string;
      searchingLocation: string;
      selectedLocation: string;
      defaultApplied: string;
      defaultCleared: string;
      gpsAccurate: string;
      locationUnavailable: string;
    };
    labels: {
      temperature: string;
      humidity: string;
      windSpeed: string;
      rainfallChance: string;
    };
    hints: {
      temperature: string;
      humidity: string;
      windSpeed: string;
      rainfallChance: string;
    };
    sections: {
      irrigationInsight: string;
      cropCareInsight: string;
    };
    chart: {
      title: string;
      subtitle: string;
      caption: string;
      ariaLabel: string;
    };
    errors: {
      weatherLoad: string;
      locationRequired: string;
      suggestionLoading: string;
      noDataYet: string;
      networkIssue: string;
      invalidMetrics: string;
    };
  };
  aiPage: {
    eyebrow: string;
    title: string;
    description: string;
  };
  chat: {
    assistantName: string;
    assistantStatusOnline: string;
    sidebarTitle: string;
    newChat: string;
    clearAll: string;
    noThreads: string;
    noThreadsHint: string;
    threadDelete: string;
    onboardingQuestion: string;
    onboardingPlaceholder: string;
    saveName: string;
    welcomeTemplate: string;
    messagePlaceholder: string;
    send: string;
    analyzing: string;
    youLabel: string;
    assistantLabel: string;
    fallbackError: string;
    networkError: string;
    invalidNameError: string;
    quickPromptLabel: string;
    quickPrompts: string[];
    detectedLanguageLabel: string;
    untitledConversation: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
  };
  cropGuide: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    filterLabel: string;
    allSeasons: string;
    noResultTitle: string;
    noResultHint: string;
    labels: {
      season: string;
      water: string;
      fertilizer: string;
      diseases: string;
      bestTip: string;
    };
    seasonFilters: {
      kharif: string;
      rabi: string;
      zaid: string;
    };
    crops: Record<
      CropId,
      {
        name: string;
        season: string;
        water: string;
        fertilizer: string;
        diseases: string;
        tip: string;
      }
    >;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    missionTitle: string;
    missionBody: string;
    visionTitle: string;
    visionBody: string;
    valuesTitle: string;
    values: string[];
  };
  errors: {
    aiLoadFail: string;
    weatherLoadFail: string;
    unexpected: string;
    tryAgain: string;
  };
  loading: {
    syncing: string;
  };
};

function mergeDictionary(base: unknown, override: unknown): unknown {
  if (Array.isArray(base)) {
    return (override as unknown[]) ?? base;
  }

  if (base && typeof base === "object") {
    const baseRecord = base as Record<string, unknown>;
    const overrideRecord =
      override && typeof override === "object"
        ? (override as Record<string, unknown>)
        : {};
    const next: Record<string, unknown> = { ...baseRecord };

    for (const key of Object.keys(overrideRecord)) {
      const baseValue = baseRecord[key];
      const overrideValue = overrideRecord[key];

      if (overrideValue === undefined) {
        continue;
      }

      if (
        baseValue &&
        typeof baseValue === "object" &&
        !Array.isArray(baseValue) &&
        overrideValue &&
        typeof overrideValue === "object" &&
        !Array.isArray(overrideValue)
      ) {
        next[key] = mergeDictionary(baseValue, overrideValue);
        continue;
      }

      next[key] = overrideValue;
    }

    return next;
  }

  return override ?? base;
}

const EN_TRANSLATIONS: TranslationDictionary = {
  languageName: "English",
  nav: {
    home: "Home",
    aiAdvisor: "AI Advisor",
    weather: "Weather",
    cropGuide: "Crop Guide",
    about: "About",
  },
  header: {
    brandTagline: "Field Intelligence Platform",
    languageLabel: "Language",
    menuLabel: "Menu",
  },
  footer: {
    copyright: "© 2026 KrushiMitra AI",
    founder: "Founder: Avantar Nikhare",
  },
  home: {
    badge: "AI-powered farming intelligence for India",
    title: "Professional farm intelligence for faster, safer field decisions.",
    description:
      "Use one unified workspace to chat with an agriculture expert AI, track hyperlocal weather, and monitor crop readiness from sowing to harvest.",
    ctaAdvisor: "Open AI Advisor",
    ctaWeather: "View Weather Console",
    stats: [
      { value: "24x7", label: "AI advisory availability" },
      { value: "9", label: "Indian language support" },
      { value: "3 min", label: "Average decision response" },
      { value: "1", label: "Unified farming dashboard" },
    ],
    featureCards: [
      {
        title: "AI Chat Advisor",
        desc: "Context-aware crop recommendations with persistent multi-chat memory.",
        href: "/ai-advisor",
        cta: "Launch advisor",
      },
      {
        title: "Weather Intelligence",
        desc: "Actionable humidity, wind, rain, and irrigation planning with trend graphs.",
        href: "/weather",
        cta: "Open weather",
      },
      {
        title: "Crop Knowledge Hub",
        desc: "Filter crop playbooks by season, inputs, and disease risks in one place.",
        href: "/crop-guide",
        cta: "Open guide",
      },
      {
        title: "Platform Vision",
        desc: "Learn how KrushiMitra AI is designed for practical, field-first execution.",
        href: "/about",
        cta: "Read mission",
      },
    ],
    trustTitle: "Why progressive farmers choose KrushiMitra AI",
    trustPoints: [
      "Localized recommendations designed around Indian farming conditions.",
      "Fast, practical responses for pests, irrigation, fertilizers, and crop stress.",
      "Mobile-first workflows for in-field usage and low-friction adoption.",
    ],
    testimonialTitle: "Farmers using AI-led planning",
    testimonials: [
      {
        quote:
          "We reduced unnecessary irrigation cycles because alerts now align with our local forecast windows.",
        farmer: "Meera Patil",
        region: "Nashik, Maharashtra",
      },
      {
        quote:
          "The advisor helps my team verify pest actions quickly before we spend on sprays.",
        farmer: "Harjit Singh",
        region: "Ludhiana, Punjab",
      },
      {
        quote:
          "Crop guidance and weather in one dashboard saves us daily coordination time.",
        farmer: "Rafiq Mondal",
        region: "Nadia, West Bengal",
      },
    ],
  },
  snapshot: {
    title: "Live Snapshot",
    valid: "Valid Feed",
    syncing: "Syncing",
    region: "Region",
    advisory: "Advisory",
    weather: "Weather",
    metricsSummary: "{temp}°C, humidity {humidity}%, wind {wind} km/h, rain chance {rain}%",
    loadError: "Live snapshot unavailable.",
    unavailable: "Unable to load live weather now.",
    waitingData: "Waiting for valid weather data.",
  },
  weatherPage: {
    eyebrow: "Weather Intelligence",
    title: "Forecast with farm-ready recommendations",
    description:
      "Detect local weather instantly and get practical insights for irrigation, spraying, and crop care planning.",
  },
  weatherDashboard: {
    title: "Farmer Weather Dashboard",
    locationLoading: "Loading weather...",
    updatedLabel: "Updated",
    openWeatherLabel: "OpenWeather live icon",
    defaultLocationLabel: "Default location",
    buttons: {
      useMyLocation: "Use My Location",
      enterManually: "Enter Location Manually",
      refreshWeather: "Refresh Weather",
      clearDefault: "Clear Default Location",
      saveDefault: "Search and Save Default",
    },
    placeholders: {
      manualLocation: "Enter village, city, or district (e.g. Nagpur, Maharashtra)",
      suggestionTitle: "Location options",
    },
    status: {
      detectingLocation: "Detecting your farm location...",
      manualSaved: "Manual location saved as default and weather updated.",
      manualWeather: "Weather for manually entered location.",
      gpsLive: "Live weather from your current location",
      ipFallback: "Approximate weather based on network location",
      permissionDenied: "Location permission denied. Showing approximate weather.",
      searchingLocation: "Searching weather for entered location...",
      selectedLocation: "Searching selected location...",
      defaultApplied: "Using saved default location.",
      defaultCleared: "Default location cleared. Switching to current location.",
      gpsAccurate: "Using GPS location for accurate farm weather.",
      locationUnavailable: "Location access unavailable. Showing approximate weather.",
    },
    labels: {
      temperature: "Temperature",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      rainfallChance: "Rainfall Chance",
    },
    hints: {
      temperature: "Use this to schedule irrigation windows",
      humidity: "High humidity can increase fungal risk",
      windSpeed: "Avoid spraying when wind is too high",
      rainfallChance: "Plan irrigation and nutrient application",
    },
    sections: {
      irrigationInsight: "Irrigation Insight",
      cropCareInsight: "Crop Care Insight",
    },
    chart: {
      title: "24h Weather Trend Graph",
      subtitle: "Temperature line with rainfall bars",
      caption:
        "Rainfall bars support irrigation planning while temperature trend helps monitor crop stress.",
      ariaLabel: "Temperature and rainfall trend",
    },
    errors: {
      weatherLoad: "Unable to load weather now. Please retry.",
      locationRequired: "Please enter a location name.",
      suggestionLoading: "Finding location options...",
      noDataYet: "Fetching conditions",
      networkIssue: "Network issue while loading weather. Please try again.",
      invalidMetrics: "Waiting for valid weather data.",
    },
  },
  aiPage: {
    eyebrow: "AI Advisor",
    title: "Ask farming questions in natural language",
    description:
      "Get actionable recommendations for crop health, fertilizer timing, pest control, and irrigation plans tailored to your farm context.",
  },
  chat: {
    assistantName: "KrushiMitra AI",
    assistantStatusOnline: "Advisor online",
    sidebarTitle: "Conversations",
    newChat: "New Chat",
    clearAll: "Clear All",
    noThreads: "No conversations yet",
    noThreadsHint: "Start a new chat to plan your next farm decision.",
    threadDelete: "Delete conversation",
    onboardingQuestion: "What is your name?",
    onboardingPlaceholder: "Enter your name",
    saveName: "Save Name",
    welcomeTemplate: "Hello {name}, I am KrushiMitra AI. How can I help your farm today?",
    messagePlaceholder: "Ask about crops, pests, fertilizer, irrigation...",
    send: "Send",
    analyzing: "Analyzing your question...",
    youLabel: "Farmer",
    assistantLabel: "Advisor",
    fallbackError: "I could not answer right now. Please try again in a moment.",
    networkError: "Network issue detected. Please check your connection and retry.",
    invalidNameError: "Please enter a valid name.",
    quickPromptLabel: "Try asking",
    quickPrompts: [
      "Which crop should I grow this season?",
      "How can I prevent pest attacks naturally?",
      "Best fertilizer schedule for wheat?",
    ],
    detectedLanguageLabel: "Detected language",
    untitledConversation: "New conversation",
    justNow: "Just now",
    minutesAgo: "{value}m ago",
    hoursAgo: "{value}h ago",
  },
  cropGuide: {
    eyebrow: "Crop Guide",
    title: "Crop planning library from sowing to harvest",
    description:
      "Compare season-wise crop requirements, water plans, fertilizer strategy, and disease prevention in one searchable guide.",
    searchPlaceholder: "Search crop, disease, or farming tip...",
    filterLabel: "Season",
    allSeasons: "All Seasons",
    noResultTitle: "No crops matched your search",
    noResultHint: "Try a different crop name or switch season filter.",
    labels: {
      season: "Season",
      water: "Water",
      fertilizer: "Fertilizer",
      diseases: "Disease Watch",
      bestTip: "Best Practice",
    },
    seasonFilters: {
      kharif: "Kharif",
      rabi: "Rabi",
      zaid: "Zaid",
    },
    crops: {
      wheat: {
        name: "Wheat",
        season: "Rabi",
        water: "4-6 irrigations, critical at crown root initiation and grain filling",
        fertilizer: "Balanced NPK with split nitrogen application",
        diseases: "Rust, smut, and aphids during humid spells",
        tip: "Use certified seed and avoid late sowing to protect yield.",
      },
      rice: {
        name: "Rice",
        season: "Kharif",
        water: "Maintain shallow standing water and proper drainage after rain",
        fertilizer: "Nitrogen in 3 splits with potassium support",
        diseases: "Blast, bacterial leaf blight, stem borer",
        tip: "Adopt line transplanting to improve aeration and reduce disease pressure.",
      },
      cotton: {
        name: "Cotton",
        season: "Kharif",
        water: "Irrigate at square and boll development stages",
        fertilizer: "Higher potassium and micronutrient foliar sprays",
        diseases: "Pink bollworm, whitefly, leaf curl virus",
        tip: "Use pheromone traps and weekly scouting for early pest control.",
      },
      soybean: {
        name: "Soybean",
        season: "Kharif",
        water: "Light irrigation during flowering and pod filling if rainfall is low",
        fertilizer: "Starter nitrogen with phosphorus and sulfur",
        diseases: "Yellow mosaic virus, rust, girdle beetle",
        tip: "Ensure field drainage to avoid root rot in heavy rainfall weeks.",
      },
      sugarcane: {
        name: "Sugarcane",
        season: "Zaid",
        water: "Frequent irrigation in summer with mulching support",
        fertilizer: "Heavy feeder crop, split nitrogen + organic manure",
        diseases: "Red rot, early shoot borer, pyrilla",
        tip: "Use trench planting and trash mulching to conserve moisture.",
      },
      vegetables: {
        name: "Vegetables",
        season: "Year-round",
        water: "Frequent light irrigation based on crop stage",
        fertilizer: "Compost + soluble NPK through fertigation",
        diseases: "Downy mildew, damping off, sucking pests",
        tip: "Rotate crops and maintain sanitation to reduce recurring infections.",
      },
    },
  },
  about: {
    eyebrow: "About KrushiMitra AI",
    title: "Building trusted AI for Indian agriculture",
    description:
      "KrushiMitra AI is a professional agriculture intelligence platform that combines advisory chat, weather insight, and crop strategy into one reliable field companion.",
    missionTitle: "Mission",
    missionBody:
      "Empower every farmer with practical, data-backed recommendations that improve productivity, reduce risk, and support resilient farming decisions.",
    visionTitle: "Vision",
    visionBody:
      "Make AI-led agriculture planning accessible for every Indian farm, from smallholders to progressive producer networks.",
    valuesTitle: "Core Product Values",
    values: [
      "Practical recommendations over generic advice",
      "Farmer-first language and mobile usability",
      "Reliable weather and crop intelligence in one platform",
      "Continuous feedback-led product improvement",
    ],
  },
  errors: {
    aiLoadFail: "Chat page failed to load.",
    weatherLoadFail: "Weather dashboard failed to load.",
    unexpected: "Unexpected error occurred.",
    tryAgain: "Try Again",
  },
  loading: {
    syncing: "Syncing live data...",
  },
};

const HI_TRANSLATIONS = mergeDictionary(EN_TRANSLATIONS, {
  languageName: "हिन्दी",
  nav: {
    home: "होम",
    aiAdvisor: "एआई सलाहकार",
    weather: "मौसम",
    cropGuide: "फसल गाइड",
    about: "परिचय",
  },
  header: {
    brandTagline: "फार्म इंटेलिजेंस प्लेटफॉर्म",
    languageLabel: "भाषा",
    menuLabel: "मेनू",
  },
  home: {
    badge: "भारत के लिए एआई-संचालित कृषि बुद्धिमत्ता",
    title: "तेज और सुरक्षित खेती निर्णयों के लिए प्रोफेशनल फार्म इंटेलिजेंस।",
    description:
      "एक ही प्लेटफॉर्म पर कृषि एआई सलाहकार से चैट करें, स्थानीय मौसम ट्रैक करें, और बुवाई से कटाई तक फसल तैयारी समझें।",
    ctaAdvisor: "एआई सलाहकार खोलें",
    ctaWeather: "मौसम कंसोल देखें",
    trustTitle: "प्रगतिशील किसान KrushiMitra AI क्यों चुनते हैं",
    testimonialTitle: "एआई आधारित योजना अपनाने वाले किसान",
    trustPoints: [
      "भारतीय खेती की परिस्थितियों के लिए स्थानीय सिफारिशें।",
      "कीट, सिंचाई, उर्वरक और फसल तनाव पर तेज और उपयोगी सलाह।",
      "खेत में उपयोग के लिए मोबाइल-प्रथम कार्यप्रवाह।",
    ],
  },
  snapshot: {
    title: "लाइव स्नैपशॉट",
    valid: "मान्य फीड",
    syncing: "सिंक हो रहा है",
    region: "क्षेत्र",
    advisory: "सलाह",
    weather: "मौसम",
    loadError: "लाइव स्नैपशॉट उपलब्ध नहीं है।",
    unavailable: "अभी लाइव मौसम लोड नहीं हो सका।",
    waitingData: "मान्य मौसम डेटा का इंतजार है।",
  },
  weatherPage: {
    eyebrow: "मौसम बुद्धिमत्ता",
    title: "फसल-तैयार सिफारिशों के साथ पूर्वानुमान",
    description:
      "स्थानीय मौसम तुरंत जानें और सिंचाई, स्प्रे और फसल देखभाल के लिए व्यावहारिक सुझाव पाएं।",
  },
  weatherDashboard: {
    title: "किसान मौसम डैशबोर्ड",
    locationLoading: "मौसम लोड हो रहा है...",
    updatedLabel: "अपडेट",
    defaultLocationLabel: "डिफॉल्ट स्थान",
    buttons: {
      useMyLocation: "मेरा स्थान उपयोग करें",
      enterManually: "स्थान मैन्युअली दर्ज करें",
      refreshWeather: "मौसम रीफ्रेश करें",
      clearDefault: "डिफॉल्ट स्थान हटाएं",
      saveDefault: "खोजें और डिफॉल्ट सेव करें",
    },
    placeholders: {
      manualLocation: "गांव, शहर या जिला लिखें (उदा. नागपुर, महाराष्ट्र)",
      suggestionTitle: "स्थान विकल्प",
    },
    status: {
      detectingLocation: "आपका खेत स्थान पता किया जा रहा है...",
      manualSaved: "मैन्युअल स्थान डिफॉल्ट रूप में सेव कर दिया गया है।",
      manualWeather: "दर्ज किए गए स्थान का मौसम दिखाया जा रहा है।",
      gpsLive: "आपके वर्तमान स्थान का लाइव मौसम",
      ipFallback: "नेटवर्क स्थान के आधार पर अनुमानित मौसम",
      permissionDenied: "लोकेशन अनुमति नहीं मिली, अनुमानित मौसम दिख रहा है।",
      searchingLocation: "दर्ज स्थान का मौसम खोजा जा रहा है...",
      selectedLocation: "चयनित स्थान खोजा जा रहा है...",
      defaultApplied: "सहेजा हुआ डिफॉल्ट स्थान उपयोग हो रहा है।",
      defaultCleared: "डिफॉल्ट स्थान हटाया गया। वर्तमान स्थान पर स्विच हो रहा है।",
      gpsAccurate: "सटीक मौसम के लिए GPS स्थान उपयोग हो रहा है।",
      locationUnavailable: "लोकेशन उपलब्ध नहीं, अनुमानित मौसम दिखाया जा रहा है।",
    },
    labels: {
      temperature: "तापमान",
      humidity: "आर्द्रता",
      windSpeed: "हवा की गति",
      rainfallChance: "वर्षा संभावना",
    },
    sections: {
      irrigationInsight: "सिंचाई सलाह",
      cropCareInsight: "फसल देखभाल सलाह",
    },
    chart: {
      title: "24 घंटे मौसम ट्रेंड ग्राफ",
      subtitle: "वर्षा बार के साथ तापमान लाइन",
      caption: "वर्षा बार सिंचाई योजना में मदद करते हैं और तापमान ट्रेंड फसल तनाव दिखाता है।",
    },
    errors: {
      weatherLoad: "अभी मौसम लोड नहीं हो सका। कृपया फिर प्रयास करें।",
      locationRequired: "कृपया स्थान का नाम दर्ज करें।",
      suggestionLoading: "स्थान विकल्प खोजे जा रहे हैं...",
      networkIssue: "मौसम लोड करते समय नेटवर्क समस्या आई।",
      invalidMetrics: "मान्य मौसम डेटा का इंतजार है।",
    },
  },
  aiPage: {
    eyebrow: "एआई सलाहकार",
    title: "प्राकृतिक भाषा में खेती से जुड़े प्रश्न पूछें",
    description:
      "फसल स्वास्थ्य, उर्वरक समय, कीट नियंत्रण और सिंचाई योजना पर व्यावहारिक सिफारिशें पाएं।",
  },
  chat: {
    assistantStatusOnline: "सलाहकार ऑनलाइन",
    sidebarTitle: "बातचीत",
    newChat: "नई चैट",
    clearAll: "सभी साफ करें",
    noThreads: "अभी कोई बातचीत नहीं",
    noThreadsHint: "अपना अगला खेती निर्णय शुरू करने के लिए नई चैट बनाएं।",
    onboardingQuestion: "आपका नाम क्या है?",
    onboardingPlaceholder: "अपना नाम लिखें",
    saveName: "नाम सेव करें",
    welcomeTemplate: "नमस्ते {name}, मैं कृषिमित्र AI हूं। आज आपकी खेती में कैसे मदद कर सकता हूं?",
    messagePlaceholder: "फसल, कीट, उर्वरक, सिंचाई के बारे में पूछें...",
    send: "भेजें",
    analyzing: "आपके प्रश्न का विश्लेषण किया जा रहा है...",
    youLabel: "किसान",
    assistantLabel: "सलाहकार",
    fallbackError: "अभी उत्तर नहीं दे पाया। कृपया थोड़ी देर बाद फिर प्रयास करें।",
    networkError: "नेटवर्क समस्या है। कृपया कनेक्शन जांचें और फिर प्रयास करें।",
    invalidNameError: "कृपया सही नाम दर्ज करें।",
    quickPromptLabel: "यह पूछकर देखें",
    quickPrompts: [
      "इस मौसम में कौन सी फसल लगाऊं?",
      "कीट हमलों को प्राकृतिक तरीके से कैसे रोकें?",
      "गेहूं के लिए उर्वरक का अच्छा शेड्यूल क्या है?",
    ],
    detectedLanguageLabel: "पहचानी गई भाषा",
    untitledConversation: "नई बातचीत",
    justNow: "अभी",
    minutesAgo: "{value}मि पहले",
    hoursAgo: "{value}घं पहले",
  },
  cropGuide: {
    eyebrow: "फसल गाइड",
    title: "बुवाई से कटाई तक फसल योजना लाइब्रेरी",
    description:
      "मौसम अनुसार फसल आवश्यकताएं, पानी योजना, उर्वरक रणनीति और रोग रोकथाम को एक खोजयोग्य गाइड में देखें।",
    searchPlaceholder: "फसल, रोग या कृषि टिप खोजें...",
    filterLabel: "मौसम",
    allSeasons: "सभी मौसम",
    noResultTitle: "आपकी खोज से कोई फसल नहीं मिली",
    noResultHint: "दूसरा फसल नाम खोजें या मौसम फिल्टर बदलें।",
    labels: {
      season: "मौसम",
      water: "पानी",
      fertilizer: "उर्वरक",
      diseases: "रोग जोखिम",
      bestTip: "बेहतर अभ्यास",
    },
  },
  about: {
    eyebrow: "KrushiMitra AI के बारे में",
    title: "भारतीय कृषि के लिए भरोसेमंद एआई बनाना",
    description:
      "KrushiMitra AI एक प्रोफेशनल कृषि इंटेलिजेंस प्लेटफॉर्म है जो सलाहकारी चैट, मौसम और फसल रणनीति को एक साथ लाता है।",
    missionTitle: "मिशन",
    missionBody:
      "हर किसान को व्यावहारिक और डेटा-आधारित सुझाव देना ताकि उत्पादकता बढ़े और जोखिम कम हो।",
    visionTitle: "विजन",
    visionBody:
      "भारत के हर खेत के लिए एआई आधारित कृषि योजना को सुलभ बनाना।",
    valuesTitle: "मुख्य उत्पाद मूल्य",
    values: [
      "सामान्य सलाह के बजाय व्यावहारिक सिफारिशें",
      "किसान-प्रथम भाषा और मोबाइल उपयोगिता",
      "एक प्लेटफॉर्म में विश्वसनीय मौसम और फसल जानकारी",
      "फीडबैक आधारित निरंतर सुधार",
    ],
  },
  errors: {
    aiLoadFail: "चैट पेज लोड नहीं हो सका।",
    weatherLoadFail: "मौसम डैशबोर्ड लोड नहीं हो सका।",
    unexpected: "अनपेक्षित त्रुटि हुई।",
    tryAgain: "फिर प्रयास करें",
  },
  loading: {
    syncing: "लाइव डेटा सिंक हो रहा है...",
  },
}) as TranslationDictionary;

function makeRegionalVariant(
  languageName: string,
  labels: {
    home: string;
    aiAdvisor: string;
    weather: string;
    cropGuide: string;
    about: string;
    language: string;
    menu: string;
    badge: string;
    aiTitle: string;
    weatherTitle: string;
    cropTitle: string;
    aboutTitle: string;
    onboardingQuestion: string;
    placeholder: string;
    send: string;
  },
  quickPrompts: string[],
): TranslationDictionary {
  return mergeDictionary(EN_TRANSLATIONS, {
    languageName,
    nav: {
      home: labels.home,
      aiAdvisor: labels.aiAdvisor,
      weather: labels.weather,
      cropGuide: labels.cropGuide,
      about: labels.about,
    },
    header: {
      languageLabel: labels.language,
      menuLabel: labels.menu,
    },
    home: {
      badge: labels.badge,
    },
    weatherPage: {
      title: labels.weatherTitle,
    },
    aiPage: {
      title: labels.aiTitle,
    },
    cropGuide: {
      title: labels.cropTitle,
    },
    about: {
      title: labels.aboutTitle,
    },
    chat: {
      onboardingQuestion: labels.onboardingQuestion,
      messagePlaceholder: labels.placeholder,
      send: labels.send,
      quickPrompts,
    },
  }) as TranslationDictionary;
}

const MR_TRANSLATIONS = makeRegionalVariant(
  "मराठी",
  {
    home: "मुख्यपृष्ठ",
    aiAdvisor: "एआय सल्लागार",
    weather: "हवामान",
    cropGuide: "पीक मार्गदर्शक",
    about: "माहिती",
    language: "भाषा",
    menu: "मेनू",
    badge: "भारतीय शेतीसाठी AI आधारित मार्गदर्शन",
    aiTitle: "नैसर्गिक भाषेत शेतीचे प्रश्न विचारा",
    weatherTitle: "शेतीसाठी योग्य हवामान अंदाज",
    cropTitle: "पेरणीपासून कापणीपर्यंत पीक नियोजन",
    aboutTitle: "भारतीय शेतीसाठी विश्वासार्ह AI निर्माण",
    onboardingQuestion: "तुमचे नाव काय आहे?",
    placeholder: "पीक, कीड, खत, सिंचन याबद्दल विचारा...",
    send: "पाठवा",
  },
  [
    "या हंगामात कोणते पीक घ्यावे?",
    "कीड हल्ले कसे रोखावेत?",
    "गव्हासाठी खताचे वेळापत्रक काय असावे?",
  ],
);

const TA_TRANSLATIONS = makeRegionalVariant(
  "தமிழ்",
  {
    home: "முகப்பு",
    aiAdvisor: "AI ஆலோசகர்",
    weather: "வானிலை",
    cropGuide: "பயிர் வழிகாட்டி",
    about: "எங்களை பற்றி",
    language: "மொழி",
    menu: "மெனு",
    badge: "இந்திய விவசாயத்திற்கு AI நுண்ணறிவு",
    aiTitle: "இயல்பான மொழியில் விவசாய கேள்விகள் கேளுங்கள்",
    weatherTitle: "விவசாயத்திற்கு தயாரான வானிலை பரிந்துரைகள்",
    cropTitle: "விதைத்தல் முதல் அறுவடை வரை பயிர் திட்டம்",
    aboutTitle: "இந்திய விவசாயத்திற்கு நம்பகமான AI உருவாக்கம்",
    onboardingQuestion: "உங்கள் பெயர் என்ன?",
    placeholder: "பயிர், பூச்சி, உரம், நீர்ப்பாசனம் பற்றி கேளுங்கள்...",
    send: "அனுப்பு",
  },
  [
    "இந்த சீசனில் எந்த பயிர் வளர்க்க வேண்டும்?",
    "பூச்சி தாக்குதலை எப்படி தடுப்பது?",
    "கோதுமைக்கு உர அட்டவணை என்ன?",
  ],
);

const TE_TRANSLATIONS = makeRegionalVariant(
  "తెలుగు",
  {
    home: "హోమ్",
    aiAdvisor: "AI సలహాదారు",
    weather: "వాతావరణం",
    cropGuide: "పంట మార్గదర్శిని",
    about: "గురించి",
    language: "భాష",
    menu: "మెను",
    badge: "భారతీయ వ్యవసాయానికి AI ఆధారిత మార్గదర్శనం",
    aiTitle: "సహజ భాషలో వ్యవసాయ ప్రశ్నలు అడగండి",
    weatherTitle: "వ్యవసాయానికి అనువైన వాతావరణ సూచనలు",
    cropTitle: "విత్తనాల నుంచి కోత వరకు పంట ప్రణాళిక",
    aboutTitle: "భారతీయ వ్యవసాయానికి నమ్మకమైన AI నిర్మాణం",
    onboardingQuestion: "మీ పేరు ఏమిటి?",
    placeholder: "పంటలు, పురుగులు, ఎరువులు, నీటిపారుదల గురించి అడగండి...",
    send: "పంపండి",
  },
  [
    "ఈ సీజన్‌లో ఏ పంట వేయాలి?",
    "పురుగు దాడులను ఎలా నివారించాలి?",
    "గోధుమకు ఎరువు షెడ్యూల్ ఏమిటి?",
  ],
);

const GU_TRANSLATIONS = makeRegionalVariant(
  "ગુજરાતી",
  {
    home: "હોમ",
    aiAdvisor: "AI સલાહકાર",
    weather: "હવામાન",
    cropGuide: "પાક માર્ગદર્શિકા",
    about: "વિશે",
    language: "ભાષા",
    menu: "મેનુ",
    badge: "ભારતીય ખેતી માટે AI આધારિત માર્ગદર્શન",
    aiTitle: "કુદરતી ભાષામાં ખેતીના પ્રશ્નો પૂછો",
    weatherTitle: "ખેતી માટે તૈયાર હવામાન ભલામણો",
    cropTitle: "વાવણીથી કાપણી સુધી પાક આયોજન",
    aboutTitle: "ભારતીય ખેતી માટે વિશ્વસનીય AI નિર્માણ",
    onboardingQuestion: "તમારું નામ શું છે?",
    placeholder: "પાક, જીવાત, ખાતર, સિંચાઈ વિશે પૂછો...",
    send: "મોકલો",
  },
  [
    "આ સિઝનમાં કયો પાક વાવું?",
    "જીવાત હુમલાને કેવી રીતે રોકું?",
    "ગહું માટે ખાતર શેડ્યૂલ શું છે?",
  ],
);

const PA_TRANSLATIONS = makeRegionalVariant(
  "ਪੰਜਾਬੀ",
  {
    home: "ਮੁੱਖ ਪੰਨਾ",
    aiAdvisor: "AI ਸਲਾਹਕਾਰ",
    weather: "ਮੌਸਮ",
    cropGuide: "ਫਸਲ ਗਾਈਡ",
    about: "ਬਾਰੇ",
    language: "ਭਾਸ਼ਾ",
    menu: "ਮੇਨੂ",
    badge: "ਭਾਰਤੀ ਖੇਤੀ ਲਈ AI ਆਧਾਰਿਤ ਮਦਦ",
    aiTitle: "ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਖੇਤੀ ਦੇ ਸਵਾਲ ਪੁੱਛੋ",
    weatherTitle: "ਫਾਰਮ ਲਈ ਤਿਆਰ ਮੌਸਮੀ ਸਿਫਾਰਸ਼ਾਂ",
    cropTitle: "ਬਿਜਾਈ ਤੋਂ ਕਟਾਈ ਤੱਕ ਫਸਲ ਯੋਜਨਾ",
    aboutTitle: "ਭਾਰਤੀ ਖੇਤੀ ਲਈ ਭਰੋਸੇਯੋਗ AI ਬਣਾਉਣਾ",
    onboardingQuestion: "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?",
    placeholder: "ਫਸਲ, ਕੀਟ, ਖਾਦ, ਸਿੰਚਾਈ ਬਾਰੇ ਪੁੱਛੋ...",
    send: "ਭੇਜੋ",
  },
  [
    "ਇਸ ਸੀਜ਼ਨ ਵਿੱਚ ਕਿਹੜੀ ਫਸਲ ਬੋਵਾਂ?",
    "ਕੀਟ ਹਮਲੇ ਕਿਵੇਂ ਰੋਕੀਏ?",
    "ਗੇਂਹੂੰ ਲਈ ਖਾਦ ਦਾ ਸ਼ਡਿਊਲ ਕੀ ਹੈ?",
  ],
);

const KN_TRANSLATIONS = makeRegionalVariant(
  "ಕನ್ನಡ",
  {
    home: "ಮುಖಪುಟ",
    aiAdvisor: "AI ಸಲಹೆಗಾರ",
    weather: "ಹವಾಮಾನ",
    cropGuide: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ",
    about: "ಬಗ್ಗೆ",
    language: "ಭಾಷೆ",
    menu: "ಮೆನು",
    badge: "ಭಾರತೀಯ ಕೃಷಿಗಾಗಿ AI ಆಧಾರಿತ ಮಾರ್ಗದರ್ಶನ",
    aiTitle: "ಸ್ವಾಭಾವಿಕ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ",
    weatherTitle: "ಕೃಷಿಗೆ ಸಿದ್ಧವಾದ ಹವಾಮಾನ ಸಲಹೆಗಳು",
    cropTitle: "ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲುವರೆಗೆ ಬೆಳೆ ಯೋಜನೆ",
    aboutTitle: "ಭಾರತೀಯ ಕೃಷಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ AI ನಿರ್ಮಾಣ",
    onboardingQuestion: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
    placeholder: "ಬೆಳೆ, ಕೀಟ, ಗೊಬ್ಬರ, ನೀರಾವರಿ ಕುರಿತು ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
  },
  [
    "ಈ ಹಂಗಾಮಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಸಬೇಕು?",
    "ಕೀಟ ದಾಳಿಯನ್ನು ಹೇಗೆ ತಡೆಯಬೇಕು?",
    "ಗೋಧಿಗೆ ಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ ಏನು?",
  ],
);

const BN_TRANSLATIONS = makeRegionalVariant(
  "বাংলা",
  {
    home: "হোম",
    aiAdvisor: "AI পরামর্শদাতা",
    weather: "আবহাওয়া",
    cropGuide: "ফসল গাইড",
    about: "সম্পর্কে",
    language: "ভাষা",
    menu: "মেনু",
    badge: "ভারতীয় কৃষির জন্য AI চালিত সহায়তা",
    aiTitle: "স্বাভাবিক ভাষায় কৃষি প্রশ্ন করুন",
    weatherTitle: "খামার উপযোগী আবহাওয়া পরামর্শ",
    cropTitle: "বপন থেকে ফসল কাটার পরিকল্পনা",
    aboutTitle: "ভারতীয় কৃষির জন্য নির্ভরযোগ্য AI নির্মাণ",
    onboardingQuestion: "আপনার নাম কী?",
    placeholder: "ফসল, পোকা, সার, সেচ সম্পর্কে জিজ্ঞাসা করুন...",
    send: "পাঠান",
  },
  [
    "এই মৌসুমে কোন ফসল চাষ করব?",
    "পোকা আক্রমণ কীভাবে রোধ করব?",
    "গমের জন্য সার সময়সূচি কী?",
  ],
);

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  hi: HI_TRANSLATIONS,
  en: EN_TRANSLATIONS,
  mr: MR_TRANSLATIONS,
  ta: TA_TRANSLATIONS,
  te: TE_TRANSLATIONS,
  gu: GU_TRANSLATIONS,
  pa: PA_TRANSLATIONS,
  kn: KN_TRANSLATIONS,
  bn: BN_TRANSLATIONS,
};

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && value in TRANSLATIONS;
}

const LANGUAGE_PREFIX_MAP: Record<string, LanguageCode> = {
  hi: "hi",
  en: "en",
  mr: "mr",
  ta: "ta",
  te: "te",
  gu: "gu",
  pa: "pa",
  kn: "kn",
  bn: "bn",
};

export function detectPreferredLanguage(
  browserLanguages: readonly string[] | undefined,
): LanguageCode {
  if (!browserLanguages || browserLanguages.length === 0) {
    return DEFAULT_LANGUAGE;
  }

  for (const rawLanguage of browserLanguages) {
    const normalized = rawLanguage.toLowerCase();
    const prefix = normalized.split("-")[0] ?? normalized;
    const match = LANGUAGE_PREFIX_MAP[prefix];
    if (match) {
      return match;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function interpolate(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{(.*?)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined ? "" : String(value);
  });
}
