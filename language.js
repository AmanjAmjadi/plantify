// language.js - Language support for Plantify

// Available languages
const languages = {
    en: 'English',
    fa: 'فارسی'
};

// Default language
let currentLanguage = localStorage.getItem('plantify-language') || 'en';

// All translations
const translations = {
    en: {
        // Navigation
        identify: "Identify",
        search: "Search",
        myGarden: "My Garden",
        care: "Care",
        account: "Account",
        
        // Header
        appTitle: "Plantify",
        poweredBy: "Powered by Gemini AI",
        
        // Identify Tab
        identifyTitle: "Identify Your Plant",
        identifyDesc: "Take a photo or upload an image of a plant to identify it",
        takePhoto: "Take Photo",
        uploadImage: "Upload Image",
        identifyingPlant: "Identifying your plant with Gemini AI...",
        addToGarden: "Add to My Garden",
        searchInstead: "Search Instead",
        
        // Search Tab
        searchTitle: "Search Plants",
        searchDesc: "Find plants by name or characteristics",
        searchPlaceholder: "Search for plants...",
        searchingPlants: "Searching plants...",
        
        // Garden Tab
        gardenTitle: "My Garden",
        gardenDesc: "Your collection of saved plants",
        emptyGarden: "Your garden is empty. Add plants by identifying or searching for them.",
        
        // Care Tab
        careTitle: "Plant Care",
        careDesc: "Upcoming care tasks for your plants",
        emptyCare: "No care tasks scheduled. Add plants to your garden to see care schedules.",
        
        // Account Tab
        accountTitle: "Your Account",
        accountDesc: "Manage your account and sync settings",
        signInRegister: "Sign In or Register",
        signInDesc: "Sign in to sync your garden across devices",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        register: "Register",
        orContinueWith: "Or continue with",
        google: "Google",
        dataSync: "Data Sync",
        syncedText: "Your garden data is securely stored and synced across all your devices.",
        syncNow: "Sync Now",
        apiKey: "Gemini API Key",
        apiKeyDesc: "You can use your own Gemini API key for plant identification.",
        saveKey: "Save Key",
        useDefaultKey: "Use Default Key",
        customApiActive: "Custom API key is active",
        getFreeKey: "Get your free Gemini API key",
        exportData: "Export Garden Data",
        clearData: "Clear Local Data",
        signOut: "Sign Out",
        
        // Plant Detail Modal
        careSchedule: "Care Schedule",
        water: "Water",
        sunlight: "Sunlight",
        waterNow: "Water Now",
        remove: "Remove",
        
        // Diagnosis Tab
        diagnoseTitle: "Diagnose Plant Disease",
        diagnoseDesc: "Take a photo or upload an image of an affected plant to diagnose the issue",
        diagnosing: "Diagnosing plant disease with Gemini AI...",
        cause: "Cause:",
        treatment: "Treatment:",
        prevention: "Prevention:",
        
        // Misc
        loading: "Loading...",
        noInternet: "No internet connection",
        tryAgain: "Try again",
        synced: "Synced",
        changeLanguage: "Change Language"
    },
    fa: {
        // Navigation
        identify: "شناسایی",
        search: "جستجو",
        myGarden: "باغچه من",
        care: "مراقبت",
        account: "حساب کاربری",
        
        // Header
        appTitle: "پلنتیفای",
        poweredBy: "با قدرت جمینای",
        
        // Identify Tab
        identifyTitle: "شناسایی گیاه شما",
        identifyDesc: "عکس بگیرید یا تصویری از گیاه آپلود کنید تا آن را شناسایی کنیم",
        takePhoto: "گرفتن عکس",
        uploadImage: "آپلود تصویر",
        identifyingPlant: "در حال شناسایی گیاه شما با هوش مصنوعی جمینای...",
        addToGarden: "افزودن به باغچه من",
        searchInstead: "جستجو به جای آن",
        
        // Search Tab
        searchTitle: "جستجوی گیاهان",
        searchDesc: "گیاهان را با نام یا ویژگی‌های آنها پیدا کنید",
        searchPlaceholder: "جستجوی گیاهان...",
        searchingPlants: "در حال جستجوی گیاهان...",
        
        // Garden Tab
        gardenTitle: "باغچه من",
        gardenDesc: "مجموعه گیاهان ذخیره شده شما",
        emptyGarden: "باغچه شما خالی است. با شناسایی یا جستجوی گیاهان، آنها را اضافه کنید.",
        
        // Care Tab
        careTitle: "مراقبت از گیاه",
        careDesc: "وظایف مراقبتی آینده برای گیاهان شما",
        emptyCare: "هیچ وظیفه مراقبتی برنامه‌ریزی نشده است. گیاهان را به باغچه خود اضافه کنید تا برنامه مراقبت را ببینید.",
        
        // Account Tab
        accountTitle: "حساب کاربری شما",
        accountDesc: "مدیریت حساب و تنظیمات همگام‌سازی",
        signInRegister: "ورود یا ثبت‌نام",
        signInDesc: "وارد شوید تا باغچه خود را بین دستگاه‌ها همگام کنید",
        email: "ایمیل",
        password: "رمز عبور",
        signIn: "ورود",
        register: "ثبت‌نام",
        orContinueWith: "یا ادامه دهید با",
        google: "گوگل",
        dataSync: "همگام‌سازی داده‌ها",
        syncedText: "داده‌های باغچه شما به طور امن ذخیره و بین همه دستگاه‌های شما همگام شده است.",
        syncNow: "همگام‌سازی اکنون",
        apiKey: "کلید API جمینای",
        apiKeyDesc: "می‌توانید از کلید API جمینای خود برای شناسایی گیاه استفاده کنید.",
        saveKey: "ذخیره کلید",
        useDefaultKey: "استفاده از کلید پیش‌فرض",
        customApiActive: "کلید API سفارشی فعال است",
        getFreeKey: "دریافت کلید رایگان جمینای",
        exportData: "خروجی گرفتن از داده‌های باغچه",
        clearData: "پاک کردن داده‌های محلی",
        signOut: "خروج از حساب",
        
        // Plant Detail Modal
        careSchedule: "برنامه مراقبت",
        water: "آبیاری",
        sunlight: "نور خورشید",
        waterNow: "آبیاری اکنون",
        remove: "حذف",
        
        // Diagnosis Tab
        diagnoseTitle: "تشخیص بیماری گیاه",
        diagnoseDesc: "عکس بگیرید یا تصویری از گیاه آسیب‌دیده آپلود کنید تا مشکل را تشخیص دهیم",
        diagnosing: "در حال تشخیص بیماری گیاه با هوش مصنوعی جمینای...",
        cause: "علت:",
        treatment: "درمان:",
        prevention: "پیشگیری:",
        
        // Misc
        loading: "در حال بارگذاری...",
        noInternet: "اتصال به اینترنت وجود ندارد",
        tryAgain: "تلاش مجدد",
        synced: "همگام شده",
        changeLanguage: "تغییر زبان"
    }
};

// Get translation for a key
function getText(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Update all text elements with the current language
function updateLanguage() {
    // Set document direction
    document.documentElement.dir = currentLanguage === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Add/remove RTL specific classes
    if (currentLanguage === 'fa') {
        document.documentElement.classList.add('rtl');
    } else {
        document.documentElement.classList.remove('rtl');
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = getText(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getText(key);
    });
    
    // Update buttons and other elements
    translateSpecialElements();
    
    // Save current language preference
    localStorage.setItem('plantify-language', currentLanguage);
}

// Switch language
function switchLanguage(lang) {
    if (languages[lang]) {
        currentLanguage = lang;
        updateLanguage();
        return true;
    }
    return false;
}

// Handle special cases that need custom translation
function translateSpecialElements() {
    // Any custom elements that need special handling
}

// Add language selector to the page
function addLanguageSelector() {
    // Create language selector if it doesn't exist
    if (!document.getElementById('language-selector')) {
        const header = document.querySelector('header .container');
        
        if (header) {
            const langSelector = document.createElement('div');
            langSelector.id = 'language-selector';
            langSelector.className = 'flex items-center mr-2';
            
            const langButton = document.createElement('button');
            langButton.className = 'p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none';
            langButton.setAttribute('aria-label', 'Change Language');
            langButton.innerHTML = `<i class="fas fa-globe text-gray-700 dark:text-gray-300"></i>`;
            
            langSelector.appendChild(langButton);
            
            // Insert before the theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            header.insertBefore(langSelector, themeToggle);
            
            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'absolute mt-12 bg-white dark:bg-gray-800 shadow-lg rounded-md hidden';
            dropdown.id = 'language-dropdown';
            
            // Add language options
            for (const [code, name] of Object.entries(languages)) {
                const option = document.createElement('button');
                option.className = 'block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700';
                option.textContent = name;
                option.onclick = () => {
                    switchLanguage(code);
                    dropdown.classList.add('hidden');
                };
                dropdown.appendChild(option);
            }
            
            langSelector.appendChild(dropdown);
            
            // Toggle dropdown
            langButton.onclick = () => {
                dropdown.classList.toggle('hidden');
            };
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!langSelector.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        }
    }
}

// Initialize language support
function initLanguage() {
    addLanguageSelector();
    updateLanguage();
}

// Export functions and variables
window.plantifyLanguage = {
    init: initLanguage,
    switchLanguage: switchLanguage,
    getText: getText,
    getCurrentLanguage: () => currentLanguage
};
