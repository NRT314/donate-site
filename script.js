// --- КОНСТАНТЫ И НАСТРОЙКИ ПРОЕКТА ---

// Адрес вашего основного смарт-контракта
const CONTRACT_ADDRESS = "0xF6AEbf37dB416597c73D7e25876343C0d92F416A";

// Информация о поддерживаемых токенах для донатов
const TOKENS = {
    usdt: {
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        symbol: "USDT"
    },
    usdc: {
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
        symbol: "USDC (Bridged)"
    },
    dai: {
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
        symbol: "DAI"
    }
};

// ABI (Application Binary Interface) для взаимодействия с вашим контрактом
const ABI = [
    "function donate(address token, address[] recipients, uint256[] amounts) external",
    "function donatePreset(string calldata name, address token, uint256 amount) external",
    "function getPreset(string calldata name) external view returns (address[] memory recipients, uint256[] memory percentages)",
    "function getWhitelistedRecipients() external view returns (address[] memory)",
    "function totalDonatedOverallInUsdt() external view returns (uint256)",
    "event Donation(address indexed donor, address indexed token, address indexed recipient, uint256 amount)"
];

// Минимальный ABI для стандартного токена ERC20 (только функция approve)
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)"
];

// Список организаций-получателей
const ORGS = [
    { key: "thisproject", address: "0xc0F467567570AADa929fFA115E65bB39066e3E42", link: "https://nrt314.github.io/donate-site" },
    { key: "ovdinfo", address: "0x421896bb0Dcf271a294bC7019014EE90503656Fd", link: "https://ovd.info" },
    { key: "mediazona", address: "0xE86D7D922DeF8a8FEB21f1702C9AaEEDBec32DDC", link: "https://zona.media" },
    { key: "zhuk", address: "0x1913A02BB3836AF224aEF136461F43189A0cEcd0", link: "https://www.zhuk.world/" },
    { key: "breakfastshow", address: "0xdB4BB555a15bC8bB3b07E57452a8E6E24b358e7F", link: "https://www.youtube.com/@The_Breakfast_Show" },
    { key: "kovcheg", address: "0xBf178F99b8790db1BD2194D80c3a268AE4AcE804", link: "https://kovcheg.live" },
    { key: "findexit", address: "0xADb524cE8c2009e727f6dF4b6a443D455c700244", link: "https://www.youtube.com/@ishemvihod" },
    { key: "gulagunet", address: "0x6051F40d4eF5d5E5BC2B6F4155AcCF57Be6B8F58", link: "https://www.youtube.com/channel/UCbanC4P0NmnzNYXQIrjvoSA" },
    { key: "meduza", address: "0x00B9d7Fe4a2d3aCdd4102Cfb55b98d193B94C0fa", link: "https://meduza.io/" },
    { key: "cit", address: "0xfBcc8904ce75fF90CC741DA80703202faf5b2FcF", link: "https://www.youtube.com/@CITonWar" },
    { key: "importantstories", address: "0x5433CE0E05D117C54f814cc6697244eA0b902DBF", link: "https://istories.media" },
    { key: "fbk", address: "0x314aC71aEB2feC4D60Cc50Eb46e64980a27F2680", link: "https://fbk.info" },
    { key: "iditelesom", address: "0x387C5300586336d145A87C245DD30f9724C6eC01", link: "https://iditelesom.org/ru" },
    { key: "memorial", address: "0x0a4aB5D641f63cd7a2d44d0a643424f5d0df376b", link: "https://memopzk.org/" },
    { key: "insider", address: "0xad8221D4A4feb023156b9E09917Baa4ff81A65F8", link: "https://theins.ru" },
    { key: "rain", address: "0x552dAfED221689e44676477881B6947074a5C342", link: "https://tvrain.tv/" }
];

// Имя пресета для функции donatePreset
const PRESET_NAME = "equal";

// --- Глобальные переменные и состояние ---
let provider, signer;
let translations = {};
let currentLang = 'en'; // Язык по умолчанию
let selectedToken = TOKENS.usdt;
let donationType = 'custom';
const inputMap = new Map();

// --- Элементы DOM ---
const ELEMENTS = {
    donationTable: document.getElementById("donationTable"),
    totalAmountEl: document.getElementById("totalAmount"),
    nrtAmountEl: document.getElementById("nrtAmount"),
    statusEl: document.getElementById("status"),
    tokenSymbolHeader: document.getElementById("tokenSymbolHeader"),
    tokenSymbolAmount: document.getElementById("tokenSymbolAmount"),
    presetTokenSymbolEl: document.getElementById("presetTokenSymbol"),
    presetAmountInputEl: document.getElementById("presetAmountInput"),
    connectBrowserBtn: document.getElementById("connectBrowserBtn"),
    connectButtons: document.getElementById("connectButtons"),
    disconnectBtn: document.getElementById("disconnectBtn"),
    walletAddressEl: document.getElementById("walletAddress"),
    presetDonationEl: document.getElementById("presetDonation"),
    customDonationEl: document.getElementById("customDonation"),
    presetDescriptionEl: document.getElementById("presetDescription"),
    aboutContentEl: document.getElementById("about-content"),
    plansContentEl: document.getElementById("plans-content"),
    faqContentEl: document.getElementById("faq-content"),
    contactForm: document.getElementById("contactForm"),
    contactStatus: document.getElementById("contactStatus"),
    langEnBtn: document.getElementById("lang-en"),
    langRuBtn: document.getElementById("lang-ru"),
    tokenRadios: document.querySelectorAll('input[name="token"]'),
    donationTypeRadios: document.querySelectorAll('input[name="donation-type"]'),
    howToGetNrtContentEl: document.getElementById("how-to-get-nrt-content"),
    howContractWorksContentEl: document.getElementById("how-contract-works-content"),
    discussionsContentEl: document.getElementById("discussions-content"),
    howToBuyCryptoContentEl: document.getElementById("how-to-buy-crypto-content"),
    votingContentEl: document.getElementById("voting-content")
};

// --- Основные функции ---

/**
 * Загружает и применяет переводы для выбранного языка.
 */
async function fetchTranslations() {
    try {
        const response = await fetch('translations.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        translations = await response.json();
        setLanguage(currentLang);
    } catch (error) {
        console.error("Ошибка при загрузке переводов:", error);
    }
}

/**
 * Показывает модальное окно с сообщением.
 * @param {string} message - Сообщение для отображения.
 */
function showModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("myModal").style.display = "block";
}

/**
 * Закрывает модальное окно.
 */
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

/**
 * Обновляет текстовое содержимое на странице в соответствии с выбранным языком.
 */
function updateContent() {
    const texts = translations[currentLang];
    if (!texts) return;

    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (texts[key]) {
            // Используем innerText для безопасности, если не нужен HTML
            // Если нужен HTML, то innerHTML, как и было
            element.innerHTML = texts[key];
        }
    });
    
    // Динамические блоки, требующие HTML
    if (ELEMENTS.aboutContentEl) ELEMENTS.aboutContentEl.innerHTML = texts.about_content || '';
    if (ELEMENTS.plansContentEl) ELEMENTS.plansContentEl.innerHTML = texts.plans_content || '';
    if (ELEMENTS.howToGetNrtContentEl) ELEMENTS.howToGetNrtContentEl.innerHTML = texts.how_to_get_nrt_content || '';
    if (ELEMENTS.howContractWorksContentEl) ELEMENTS.howContractWorksContentEl.innerHTML = texts.how_contract_works_content || '';
    if (ELEMENTS.discussionsContentEl) ELEMENTS.discussionsContentEl.innerHTML = texts.discussions_content || '';
    if (ELEMENTS.howToBuyCryptoContentEl) ELEMENTS.howToBuyCryptoContentEl.innerHTML = texts.how_to_buy_crypto_content || '';
    if (ELEMENTS.votingContentEl) ELEMENTS.votingContentEl.innerHTML = texts.voting_content || '';

    if (ELEMENTS.faqContentEl && texts.faq_questions) {
        ELEMENTS.faqContentEl.innerHTML = texts.faq_questions.map(item => `
        <details class="faq-item bg-gray-50 border border-gray-200 rounded-lg mb-2">
            <summary class="font-medium text-gray-700">${item.q}</summary>
            <div class="px-4 py-3 text-gray-600">${item.a}</div>
        </details>
      `).join('');
    }

    const presetRecipientsCount = ORGS.length;
    if(texts.preset_description) {
        ELEMENTS.presetDescriptionEl.textContent = texts.preset_description.replace('{count}', presetRecipientsCount);
    }
}

/**
 * Устанавливает язык интерфейса.
 * @param {'en' | 'ru'} lang - Код языка ('en' или 'ru').
 */
function setLanguage(lang) {
    currentLang = lang;
    updateContent();
    renderDonationTable();
    recalc();

    // Обновляем ссылку на описание контракта в зависимости от языка
    const contractLink = document.getElementById('contract-link');
    if (contractLink) {
        const newHref = lang === 'ru' ? 'contract-details-ru.html' : 'contract-details-en.html';
        contractLink.setAttribute('href', newHref);
    }

    ELEMENTS.langEnBtn.classList.toggle('border-blue-600', lang === 'en');
    ELEMENTS.langEnBtn.classList.toggle('border-transparent', lang !== 'en');
    ELEMENTS.langRuBtn.classList.toggle('border-blue-600', lang === 'ru');
    ELEMENTS.langRuBtn.classList.toggle('border-transparent', lang !== 'ru');
}

// --- Логика донатов ---

/**
 * Отрисовывает таблицу с организациями для кастомных донатов.
 */
function renderDonationTable() {
    ELEMENTS.donationTable.innerHTML = '';
    const orgNames = translations[currentLang]?.org_names || {};

    ORGS.forEach(({ key, address, link }) => {
        const name = orgNames[key] || key;
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 transition-colors duration-200";
        row.innerHTML = `
          <td class="p-3 border border-gray-300"><a href="${link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${name}</a></td>
          <td class="p-3 border border-gray-300 font-mono text-xs hidden md:table-cell"><code>${address}</code></td>
          <td class="p-3 border border-gray-300">
              <input type="number" min="0" step="0.01" placeholder="0.00" class="w-full md:w-32 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </td>`;
        const input = row.querySelector("input");
        input.addEventListener("input", recalc);
        inputMap.set(address, input);
        ELEMENTS.donationTable.appendChild(row);
    });
}

/**
 * Пересчитывает и отображает итоговые суммы.
 */
function recalc() {
    let totalInTokens = 0;
    const tokenSymbol = selectedToken.symbol;

    if (donationType === 'preset') {
        totalInTokens = parseFloat(ELEMENTS.presetAmountInputEl.value) || 0;
        ELEMENTS.presetTokenSymbolEl.textContent = tokenSymbol;
    } else {
        inputMap.forEach(input => {
            totalInTokens += parseFloat(input.value) || 0;
        });
        ELEMENTS.tokenSymbolHeader.textContent = tokenSymbol;
        ELEMENTS.tokenSymbolAmount.textContent = tokenSymbol;
        ELEMENTS.totalAmountEl.textContent = `${totalInTokens.toFixed(2)} ${tokenSymbol}`;
    }

    ELEMENTS.nrtAmountEl.textContent = totalInTokens.toFixed(2);
}

// --- Логика работы с кошельком ---

/**
 * Сбрасывает состояние подключения кошелька.
 */
function resetWalletState() {
    signer = null;
    ELEMENTS.walletAddressEl.innerText = '';
    ELEMENTS.connectButtons.classList.remove('hidden');
    ELEMENTS.disconnectBtn.classList.add('hidden');
    console.log("Соединение с кошельком сброшено.");
}

/**
 * Обновляет состояние при смене аккаунта в кошельке.
 * @param {string[]} accounts - Массив адресов.
 */
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Кошелек отключен.');
        resetWalletState();
    } else {
        console.log('Аккаунт изменен на:', accounts[0]);
        if (provider) {
            signer = await provider.getSigner(accounts[0]);
            updateWalletAddress(accounts[0]);
        }
    }
}

/**
 * Обновляет отображаемый адрес кошелька.
 * @param {string} address - Полный адрес кошелька.
 */
function updateWalletAddress(address) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    ELEMENTS.walletAddressEl.innerText = `Wallet: ${shortAddress}`;
}

/**
 * Устанавливает слушателей событий кошелька (смена аккаунта, сети).
 */
function setupWalletListeners() {
    if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

// --- Обработчики событий ---

// Выбор языка
ELEMENTS.langEnBtn.addEventListener('click', () => setLanguage('en'));
ELEMENTS.langRuBtn.addEventListener('click', () => setLanguage('ru'));

// Выбор токена
ELEMENTS.tokenRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedToken = TOKENS[e.target.value];
        recalc();
    });
});

// Выбор типа доната
ELEMENTS.donationTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        donationType = e.target.value;
        ELEMENTS.presetDonationEl.classList.toggle('hidden', donationType !== 'preset');
        ELEMENTS.customDonationEl.classList.toggle('hidden', donationType === 'preset');
        recalc();
    });
});

// Ввод суммы в пресете
ELEMENTS.presetAmountInputEl.addEventListener('input', recalc);

// Кнопка "Подключить кошелек"
ELEMENTS.connectBrowserBtn.onclick = async () => {
    if (!window.ethereum) {
        showModal(translations[currentLang].modal_metamask);
        return;
    }
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        
        updateWalletAddress(accounts[0]);
        ELEMENTS.connectButtons.classList.add('hidden');
        ELEMENTS.disconnectBtn.classList.remove('hidden');

        setupWalletListeners();
    } catch (e) {
        showModal(`${translations[currentLang].modal_error} ${e.message}`);
    }
};

// Кнопка "Отключить"
ELEMENTS.disconnectBtn.onclick = () => {
    resetWalletState();
};

// Кнопка "Сделать пожертвование"
document.getElementById("donateBtn").onclick = async () => {
    if (!signer) {
        showModal(translations[currentLang].modal_connect);
        return;
    }

    let total = donationType === 'preset'
        ? parseFloat(ELEMENTS.presetAmountInputEl.value) || 0
        : Array.from(inputMap.values()).reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);

    if (total <= 0) {
        showModal(translations[currentLang].modal_no_amount);
        return;
    }

    try {
        ELEMENTS.statusEl.textContent = translations[currentLang].status_approve;
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const totalAmount = ethers.parseUnits(total.toString(), selectedToken.decimals);

        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount);
        await approveTx.wait();

        ELEMENTS.statusEl.textContent = translations[currentLang].status_donate;
        let donateTx;
        if (donationType === 'preset') {
            donateTx = await contract.donatePreset(PRESET_NAME, selectedToken.address, totalAmount);
        } else {
            const recipients = [];
            const amounts = [];
            inputMap.forEach((input, addr) => {
                const value = parseFloat(input.value) || 0;
                if (value > 0) {
                    recipients.push(ethers.getAddress(addr));
                    amounts.push(ethers.parseUnits(value.toString(), selectedToken.decimals));
                }
            });
            donateTx = await contract.donate(selectedToken.address, recipients, amounts);
        }
        await donateTx.wait();
        
        ELEMENTS.statusEl.textContent = translations[currentLang].status_success;

    } catch (err) {
        console.error(err);
        const errorMessage = err.reason || err.message || "Unknown error";
        ELEMENTS.statusEl.textContent = `${translations[currentLang].status_error} ${errorMessage}`;
    }
};

// Отправка формы контактов
ELEMENTS.contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_sending;
    
    try {
        const response = await fetch(this.action, {
            method: this.method,
            body: new FormData(this),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_success;
            ELEMENTS.contactForm.reset();
        } else {
            throw new Error('Server response was not ok.');
        }
    } catch (error) {
        ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_error;
    }
});


// --- Инициализация приложения ---

/**
 * Инициализирует приложение при загрузке страницы.
 */
function init() {
    fetchTranslations();
    document.querySelector(".close-button").onclick = closeModal;
    window.onclick = function(event) {
        if (event.target === document.getElementById("myModal")) {
            closeModal();
        }
    };
    // Устанавливаем начальное состояние переключателя типа доната
    ELEMENTS.customDonationEl.classList.remove('hidden');
    ELEMENTS.presetDonationEl.classList.add('hidden');
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
