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

        "Error loading plant details": "Error loading plant details",
    "Please check your internet connection": "Please check your internet connection",
    "Error identifying plant": "Error identifying plant",
    "Network error": "Network error",
    "API quota exceeded": "API quota exceeded",
    "Try again later": "Try again later",
    "File size too large": "File size too large",
    "Please choose a smaller image": "Please choose a smaller image",
    "Camera access denied": "Camera access denied",
    "Please enable camera permissions": "Please enable camera permissions",
    
    // Plant care related
    "Needs water now!": "Needs water now!",
    "Water in": "Water in",
    "Watered": "Watered",
    "Last watered": "Last watered",
    "Next water": "Next water",
    "days ago": "days ago",
    "hours ago": "hours ago",
    "minutes ago": "minutes ago",
    "just now": "just now",
    "in": "in",
    "days": "days",
    "hours": "hours",
    "minutes": "minutes",
    "Needs": "Needs",
    "hours of sunlight per day": "hours of sunlight per day",
    
    // Disease diagnosis
    "Mild": "Mild",
    "Moderate": "Moderate",
    "Severe": "Severe",
    "No disease detected": "No disease detected",
    "Diagnosis Failed": "Diagnosis Failed",
    "We couldn't diagnose this plant disease": "We couldn't diagnose this plant disease",
    "This might be because:": "This might be because:",
    "The image doesn't clearly show the affected area": "The image doesn't clearly show the affected area",
    "The symptoms aren't visible enough": "The symptoms aren't visible enough",
    "There might be a connection issue": "There might be a connection issue",
    
    // Buttons and actions
    "Cancel": "Cancel",
    "Delete": "Delete",
    "Save": "Save",
    "Retry": "Retry",
    "Continue": "Continue",
    "Watering completed!": "Watering completed!",
    "Plant removed from your garden": "Plant removed from your garden",
    "Added to your garden!": "Added to your garden!",
    "API key saved": "API key saved",
    "Using default API key": "Using default API key",
    "Successfully signed in": "Successfully signed in",
    "Sign in failed": "Sign in failed",
    "Registration successful": "Registration successful",
    "Registration failed": "Registration failed",
    "Signed out successfully": "Signed out successfully",
    
    // Time-related
    "Today": "Today",
    "Tomorrow": "Tomorrow",
    "Yesterday": "Yesterday",
    
    // Plant status
    "Healthy": "Healthy",
    "Needs attention": "Needs attention",
    "Critical": "Critical"
        // Navigation
        "Identify": "Identify",
        "Search": "Search",
        "My Garden": "My Garden",
        "Care": "Care",
        "Account": "Account",
        
        // Header
        "Plantify": "Plantify",
        "Powered by Gemini AI": "Powered by Gemini AI",
        
        // Identify Tab
        "Identify Your Plant": "Identify Your Plant",
        "Take a photo or upload an image of a plant to identify it": "Take a photo or upload an image of a plant to identify it",
        "Take Photo": "Take Photo",
        "Upload Image": "Upload Image",
        "Identifying your plant with Gemini AI...": "Identifying your plant with Gemini AI...",
        "Add to My Garden": "Add to My Garden",
        "Search Instead": "Search Instead",
        
        // Search Tab
        "Search Plants": "Search Plants",
        "Find plants by name or characteristics": "Find plants by name or characteristics",
        "Search for plants...": "Search for plants...",
        "Searching plants...": "Searching plants...",
        
        // Garden Tab
        "Your collection of saved plants": "Your collection of saved plants",
        "Your garden is empty. Add plants by identifying or searching for them.": "Your garden is empty. Add plants by identifying or searching for them.",
        
        // Care Tab
        "Plant Care": "Plant Care",
        "Upcoming care tasks for your plants": "Upcoming care tasks for your plants",
        "No care tasks scheduled. Add plants to your garden to see care schedules.": "No care tasks scheduled. Add plants to your garden to see care schedules.",
        
        // Account Tab
        "Your Account": "Your Account",
        "Manage your account and sync settings": "Manage your account and sync settings",
        "Sign In or Register": "Sign In or Register",
        "Sign in to sync your garden across devices": "Sign in to sync your garden across devices",
        "Email": "Email",
        "Password": "Password",
        "Sign In": "Sign In",
        "Register": "Register",
        "Or continue with": "Or continue with",
        "Google": "Google",
        "Data Sync": "Data Sync",
        "Your garden data is securely stored and synced across all your devices.": "Your garden data is securely stored and synced across all your devices.",
        "Sync Now": "Sync Now",
        "Gemini API Key": "Gemini API Key",
        "You can use your own Gemini API key for plant identification.": "You can use your own Gemini API key for plant identification.",
        "Save Key": "Save Key",
        "Use Default Key": "Use Default Key",
        "Custom API key is active": "Custom API key is active",
        "Get your free Gemini API key": "Get your free Gemini API key",
        "Export Garden Data": "Export Garden Data",
        "Clear Local Data": "Clear Local Data",
        "Sign Out": "Sign Out",
        
        // Plant Detail Modal
        "Care Schedule": "Care Schedule",
        "Water": "Water",
        "Sunlight": "Sunlight",
        "Water Now": "Water Now",
        "Remove": "Remove",
        
        // Diagnosis Tab
        "Diagnose Plant Disease": "Diagnose Plant Disease",
        "Take a photo or upload an image of an affected plant to diagnose the issue": "Take a photo or upload an image of an affected plant to diagnose the issue",
        "Diagnosing plant disease with Gemini AI...": "Diagnosing plant disease with Gemini AI...",
        "Cause:": "Cause:",
        "Treatment:": "Treatment:",
        "Prevention:": "Prevention:",
        
        // Misc
        "Loading...": "Loading...",
        "No internet connection": "No internet connection",
        "Try Again": "Try Again",
        "Synced": "Synced",
        "Change Language": "Change Language"
    },
    fa: {
        "Error loading plant details": "خطا در بارگذاری اطلاعات گیاه",
    "Please check your internet connection": "لطفاً اتصال اینترنت خود را بررسی کنید",
    "Error identifying plant": "خطا در شناسایی گیاه",
    "Network error": "خطای شبکه",
    "API quota exceeded": "سهمیه API تمام شده است",
    "Try again later": "لطفاً بعداً دوباره امتحان کنید",
    "File size too large": "اندازه فایل بسیار بزرگ است",
    "Please choose a smaller image": "لطفاً تصویر کوچکتری انتخاب کنید",
    "Camera access denied": "دسترسی به دوربین رد شد",
    "Please enable camera permissions": "لطفاً مجوزهای دوربین را فعال کنید",
    
    // Plant care related
    "Needs water now!": "هم اکنون نیاز به آبیاری دارد!",
    "Water in": "آبیاری در",
    "Watered": "آبیاری شده",
    "Last watered": "آخرین آبیاری",
    "Next water": "آبیاری بعدی",
    "days ago": "روز پیش",
    "hours ago": "ساعت پیش",
    "minutes ago": "دقیقه پیش",
    "just now": "همین الان",
    "in": "در",
    "days": "روز",
    "hours": "ساعت",
    "minutes": "دقیقه",
    "Needs": "نیاز به",
    "hours of sunlight per day": "ساعت نور خورشید در روز",
    
    // Disease diagnosis
    "Mild": "خفیف",
    "Moderate": "متوسط",
    "Severe": "شدید",
    "No disease detected": "هیچ بیماری تشخیص داده نشد",
    "Diagnosis Failed": "تشخیص ناموفق بود",
    "We couldn't diagnose this plant disease": "ما نتوانستیم این بیماری گیاه را تشخیص دهیم",
    "This might be because:": "این ممکن است به دلایل زیر باشد:",
    "The image doesn't clearly show the affected area": "تصویر به وضوح منطقه آسیب دیده را نشان نمی‌دهد",
    "The symptoms aren't visible enough": "علائم به اندازه کافی قابل مشاهده نیستند",
    "There might be a connection issue": "ممکن است مشکل اتصال وجود داشته باشد",
    
    // Buttons and actions
    "Cancel": "لغو",
    "Delete": "حذف",
    "Save": "ذخیره",
    "Retry": "تلاش مجدد",
    "Continue": "ادامه",
    "Watering completed!": "آبیاری انجام شد!",
    "Plant removed from your garden": "گیاه از باغچه شما حذف شد",
    "Added to your garden!": "به باغچه شما اضافه شد!",
    "API key saved": "کلید API ذخیره شد",
    "Using default API key": "استفاده از کلید API پیش‌فرض",
    "Successfully signed in": "با موفقیت وارد شدید",
    "Sign in failed": "ورود ناموفق بود",
    "Registration successful": "ثبت‌نام موفقیت‌آمیز بود",
    "Registration failed": "ثبت‌نام ناموفق بود",
    "Signed out successfully": "با موفقیت خارج شدید",
    
    // Time-related
    "Today": "امروز",
    "Tomorrow": "فردا",
    "Yesterday": "دیروز",
    
    // Plant status
    "Healthy": "سالم",
    "Needs attention": "نیاز به توجه دارد",
    "Critical": "وضعیت بحرانی"
        
        // Navigation
        "Identify": "شناسایی",
        "Search": "جستجو",
        "My Garden": "باغچه من",
        "Care": "مراقبت",
        "Account": "حساب کاربری",
        
        // Header
        "Plantify": "پلنتیفای",
        "Powered by Gemini AI": "با قدرت جمینای",
        
        // Identify Tab
        "Identify Your Plant": "شناسایی گیاه شما",
        "Take a photo or upload an image of a plant to identify it": "عکس بگیرید یا تصویری از گیاه آپلود کنید تا آن را شناسایی کنیم",
        "Take Photo": "گرفتن عکس",
        "Upload Image": "آپلود تصویر",
        "Identifying your plant with Gemini AI...": "در حال شناسایی گیاه شما با هوش مصنوعی جمینای...",
        "Add to My Garden": "افزودن به باغچه من",
        "Search Instead": "جستجو به جای آن",
        
        // Search Tab
        "Search Plants": "جستجوی گیاهان",
        "Find plants by name or characteristics": "گیاهان را با نام یا ویژگی‌های آنها پیدا کنید",
        "Search for plants...": "جستجوی گیاهان...",
        "Searching plants...": "در حال جستجوی گیاهان...",
        
        // Garden Tab
        "My Garden": "باغچه من",
        "Your collection of saved plants": "مجموعه گیاهان ذخیره شده شما",
        "Your garden is empty. Add plants by identifying or searching for them.": "باغچه شما خالی است. با شناسایی یا جستجوی گیاهان، آنها را اضافه کنید.",
        
        // Care Tab
        "Plant Care": "مراقبت از گیاه",
        "Upcoming care tasks for your plants": "وظایف مراقبتی آینده برای گیاهان شما",
        "No care tasks scheduled. Add plants to your garden to see care schedules.": "هیچ وظیفه مراقبتی برنامه‌ریزی نشده است. گیاهان را به باغچه خود اضافه کنید تا برنامه مراقبت را ببینید.",
        
        // Account Tab
        "Your Account": "حساب کاربری شما",
        "Manage your account and sync settings": "مدیریت حساب و تنظیمات همگام‌سازی",
        "Sign In or Register": "ورود یا ثبت‌نام",
        "Sign in to sync your garden across devices": "وارد شوید تا باغچه خود را بین دستگاه‌ها همگام کنید",
        "Email": "ایمیل",
        "Password": "رمز عبور",
        "Sign In": "ورود",
        "Register": "ثبت‌نام",
        "Or continue with": "یا ادامه دهید با",
        "Google": "گوگل",
        "Data Sync": "همگام‌سازی داده‌ها",
        "Your garden data is securely stored and synced across all your devices.": "داده‌های باغچه شما به طور امن ذخیره و بین همه دستگاه‌های شما همگام شده است.",
        "Sync Now": "همگام‌سازی اکنون",
        "Gemini API Key": "کلید API جمینای",
        "You can use your own Gemini API key for plant identification.": "می‌توانید از کلید API جمینای خود برای شناسایی گیاه استفاده کنید.",
        "Save Key": "ذخیره کلید",
        "Use Default Key": "استفاده از کلید پیش‌فرض",
        "Custom API key is active": "کلید API سفارشی فعال است",
        "Get your free Gemini API key": "دریافت کلید رایگان جمینای",
        "Export Garden Data": "خروجی گرفتن از داده‌های باغچه",
        "Clear Local Data": "پاک کردن داده‌های محلی",
        "Sign Out": "خروج از حساب",
        
        // Plant Detail Modal
        "Care Schedule": "برنامه مراقبت",
        "Water": "آبیاری",
        "Sunlight": "نور خورشید",
        "Water Now": "آبیاری اکنون",
        "Remove": "حذف",
        
        // Diagnosis Tab
        "Diagnose Plant Disease": "تشخیص بیماری گیاه",
        "Take a photo or upload an image of an affected plant to diagnose the issue": "عکس بگیرید یا تصویری از گیاه آسیب‌دیده آپلود کنید تا مشکل را تشخیص دهیم",
        "Diagnosing plant disease with Gemini AI...": "در حال تشخیص بیماری گیاه با هوش مصنوعی جمینای...",
        "Cause:": "علت:",
        "Treatment:": "درمان:",
        "Prevention:": "پیشگیری:",
        
        // Misc
        "Loading...": "در حال بارگذاری...",
        "No internet connection": "اتصال به اینترنت وجود ندارد",
        "Try Again": "تلاش مجدد",
        "Synced": "همگام شده",
        "Change Language": "تغییر زبان"
    }
};

// Get translation for a key
function getText(key) {
    // If the key doesn't exist in translations, return the key itself
    return translations[currentLanguage][key] || key;
}

// Process all text elements to translate them
function translateTextNodes(rootElement = document) {
    // Skip translation for script and style tags
    const skipTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE'];
    
    // Get all text nodes in the document
    const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip empty text nodes and nodes in script/style tags
                if (!node.nodeValue.trim() || skipTags.includes(node.parentNode.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    // Store nodes to translate to avoid issues with the walker during modification
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    // Process each text node
    textNodes.forEach(textNode => {
        const originalText = textNode.nodeValue.trim();
        // Only translate non-empty text
        if (originalText && translations[currentLanguage][originalText]) {
            textNode.nodeValue = textNode.nodeValue.replace(
                originalText, 
                translations[currentLanguage][originalText]
            );
        }
    });
    
    // Also handle placeholders in inputs
    const inputs = rootElement.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
        const originalPlaceholder = input.placeholder;
        if (originalPlaceholder && translations[currentLanguage][originalPlaceholder]) {
            input.placeholder = translations[currentLanguage][originalPlaceholder];
        }
    });
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
    
    // Translate all text in the document
    translateTextNodes();
    
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
            dropdown.className = 'absolute mt-12 bg-white dark:bg-gray-800 shadow-lg rounded-md hidden z-50';
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
    
    // Add event listener for dynamic content changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        translateTextNodes(node);
                    }
                });
            }
        });
    });
    
    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });
}

// Export functions and variables
window.plantifyLanguage = {
    init: initLanguage,
    switchLanguage: switchLanguage,
    getText: getText,
    translateNode: translateTextNodes,
    getCurrentLanguage: () => currentLanguage
};
