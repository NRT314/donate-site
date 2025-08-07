// CONTRACT DETAILS
const CONTRACT_ADDRESS = "0xF6AEbf37dB416597c73D7e25876343C0d92F416A";
const ALCHEMY_API_KEY = "JdPCO0ShPVRm3qtHGVfBU";

const TOKENS = {
    usdt: {
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        symbol: "USDT"
    },
    usdc: {
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
        symbol: "USDC (Bridget)"
    },
    dai: {
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
        symbol: "DAI"
    }
};

const ABI = [
    "function donate(address token, address[] recipients, uint256[] amounts) external",
    "function donatePreset(string calldata name, address token, uint256 amount) external",
    "function getPreset(string calldata name) external view returns (address[] memory recipients, uint256[] memory percentages)",
    "function getWhitelistedRecipients() external view returns (address[] memory)",
    "function totalDonatedOverallInUsdt() external view returns (uint256)",
    "event Donation(address indexed donor, address indexed token, address indexed recipient, uint256 amount)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)"
];

// ОБНОВЛЕННАЯ СТРУКТУРА ORGS
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


const PRESET_NAME = "equal";
const presetRecipients = ORGS.map(org => org.address);

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
    connectMobileBtn: document.getElementById("connectMobileBtn"),
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
    // Новые элементы
    howToGetNrtContentEl: document.getElementById("how-to-get-nrt-content"),
    howContractWorksContentEl: document.getElementById("how-contract-works-content"),
    discussionsContentEl: document.getElementById("discussions-content"),
    howToBuyCryptoContentEl: document.getElementById("how-to-buy-crypto-content")
};

let translations = {};
let currentLang = 'en';
let provider, signer;
const inputMap = new Map();
let selectedToken = TOKENS.usdt;
let donationType = 'custom';

// --- General Functions ---
async function fetchTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
        setLanguage(currentLang);
    } catch (error) {
        console.error("Error fetching translations:", error);
    }
}

function showModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

window.onclick = function(event) {
    if (event.target === document.getElementById("myModal")) {
        closeModal();
    }
};

function updateContent() {
    const texts = translations[currentLang];
    const langKeys = document.querySelectorAll('[data-lang-key]');
    langKeys.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (texts[key]) {
            element.innerHTML = texts[key];
        }
    });

    // Handle dynamic content
    if (ELEMENTS.aboutContentEl) {
        ELEMENTS.aboutContentEl.innerHTML = `
        <h3 class="font-semibold text-xl mb-2">${texts.about_section_idea_title}</h3>
        <p class="mb-4">${texts.about_section_idea_text}</p>
        <h3 class="font-semibold text-xl mb-2">${texts.about_section_why_polygon_title}</h3>
        <p class="mb-4">${texts.about_section_why_polygon_text}</p>
        <h3 class="font-semibold text-xl mb-2">${texts.about_section_what_is_nrt_title}</h3>
        <p class="mb-4">${texts.about_section_what_is_nrt_text}</p>
    `;
    }

    if (ELEMENTS.plansContentEl) {
        ELEMENTS.plansContentEl.innerHTML = `
        <h3 class="font-semibold text-xl mb-2">${texts.plans_section_short_term_title}</h3>
        <p class="mb-4">${texts.plans_section_short_term_text}</p>
        <h3 class="font-semibold text-xl mb-2">${texts.plans_section_global_title}</h3>
        <p class="mb-4">${texts.plans_section_global_text}</p>
    `;
    }
    
    if (ELEMENTS.faqContentEl) {
        ELEMENTS.faqContentEl.innerHTML = texts.faq_questions.map((item, index) => `
        <details class="faq-item bg-gray-50 border border-gray-200 rounded-lg mb-2">
            <summary class="font-medium text-gray-700">${item.q}</summary>
            <div class="px-4 py-3 text-gray-600">${item.a}</div>
        </details>
    `).join('');
    }

    // Заполнение новых секций
    if (ELEMENTS.discussionsContentEl) {
        ELEMENTS.discussionsContentEl.innerHTML = texts.discussions_content;
    }
    if (ELEMENTS.howToGetNrtContentEl) {
        ELEMENTS.howToGetNrtContentEl.innerHTML = texts.how_to_get_nrt_content;
    }
    if (ELEMENTS.howToBuyCryptoContentEl) {
        ELEMENTS.howToBuyCryptoContentEl.innerHTML = texts.how_to_buy_crypto_content;
    }
    if (ELEMENTS.howContractWorksContentEl) {
        ELEMENTS.howContractWorksContentEl.innerHTML = texts.how_contract_works_content;
    }

    const presetRecipientsCount = presetRecipients.length;
    ELEMENTS.presetDescriptionEl.textContent = texts.preset_description.replace('{count}', presetRecipientsCount);
}

function setLanguage(lang) {
    currentLang = lang;
    updateContent();
    renderDonationTable(); // <-- ОБНОВЛЕНИЕ ТАБЛИЦЫ ПРИ СМЕНЕ ЯЗЫКА
    ELEMENTS.langEnBtn.classList.toggle('border-blue-600', lang === 'en');
    ELEMENTS.langEnBtn.classList.toggle('border-transparent', lang !== 'en');
    ELEMENTS.langRuBtn.classList.toggle('border-blue-600', lang === 'ru');
    ELEMENTS.langRuBtn.classList.toggle('border-transparent', lang !== 'ru');
    recalc();
}

// --- Donation Logic ---
// ОБНОВЛЕННАЯ ФУНКЦИЯ РЕНДЕРИНГА ТАБЛИЦЫ
function renderDonationTable() {
    ELEMENTS.donationTable.innerHTML = '';
    const orgNames = translations[currentLang]?.org_names || {};

    ORGS.forEach(({ key, address, link }) => {
        const name = orgNames[key] || key;
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 transition-colors duration-200";
        row.innerHTML = `<td class="p-3 border border-gray-300"><a href="${link}" target="_blank" class="text-blue-600 hover:underline">${name}</a></td>
            <td class="p-3 border border-gray-300 font-mono text-xs hidden md:table-cell"><code>${address}</code></td>
            <td class="p-3 border border-gray-300">
                <input type="number" min="0" step="0.01" value="0" class="w-full md:w-32 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </td>`;
        const input = row.querySelector("input");
        input.addEventListener("input", recalc);
        inputMap.set(address, input);
        ELEMENTS.donationTable.appendChild(row);
    });
}


function recalc() {
    let totalInTokens = 0;
    const tokenSymbol = selectedToken.symbol;

    if (donationType === 'preset') {
        totalInTokens = parseFloat(ELEMENTS.presetAmountInputEl.value) || 0;
        ELEMENTS.presetTokenSymbolEl.textContent = tokenSymbol;
        ELEMENTS.nrtAmountEl.textContent = `${totalInTokens.toFixed(2)}`;
    } else {
        for (const input of inputMap.values()) {
            totalInTokens += parseFloat(input.value) || 0;
        }
        ELEMENTS.tokenSymbolHeader.textContent = tokenSymbol;
        ELEMENTS.tokenSymbolAmount.textContent = tokenSymbol;
        ELEMENTS.totalAmountEl.textContent = `${totalInTokens.toFixed(2)} ${tokenSymbol}`;
        ELEMENTS.nrtAmountEl.textContent = `${totalInTokens.toFixed(2)}`;
    }
}

// --- Wallet & Connection Logic ---
function resetWalletState() {
    signer = null;
    ELEMENTS.walletAddressEl.innerText = '';
    ELEMENTS.connectButtons.classList.remove('hidden');
    ELEMENTS.disconnectBtn.classList.add('hidden');
    console.log("Wallet connection reset.");
}

function setupWalletListeners() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                console.log('Wallet disconnected.');
                resetWalletState();
            } else {
                console.log('Account changed to:', accounts[0]);
                signer = (new ethers.BrowserProvider(window.ethereum)).getSigner(accounts[0]);
                ELEMENTS.walletAddressEl.innerText = `Wallet: ${accounts[0]}`;
            }
        });
        window.ethereum.on('chainChanged', () => {
            console.log('Chain changed. Reloading page...');
            window.location.reload();
        });
    }
}

// --- Event Listeners ---
ELEMENTS.langEnBtn.addEventListener('click', () => setLanguage('en'));
ELEMENTS.langRuBtn.addEventListener('click', () => setLanguage('ru'));

ELEMENTS.tokenRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedToken = TOKENS[e.target.value];
        recalc();
    });
});

ELEMENTS.donationTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        donationType = e.target.value;
        if (donationType === 'preset') {
            ELEMENTS.presetDonationEl.classList.remove('hidden');
            ELEMENTS.customDonationEl.classList.add('hidden');
        } else {
            ELEMENTS.presetDonationEl.classList.add('hidden');
            ELEMENTS.customDonationEl.classList.remove('hidden');
        }
        recalc();
    });
});

ELEMENTS.presetAmountInputEl.addEventListener('input', recalc);

ELEMENTS.connectBrowserBtn.onclick = async () => {
    if (!window.ethereum) {
        showModal(translations[currentLang].modal_metamask);
        return;
    }
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        ELEMENTS.walletAddressEl.innerText = `Wallet: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`;
        ELEMENTS.connectButtons.classList.add('hidden');
        ELEMENTS.disconnectBtn.classList.remove('hidden');
        setupWalletListeners();
    } catch (e) {
        showModal(`${translations[currentLang].modal_error} ${e.message}`);
    }
};

ELEMENTS.connectMobileBtn.onclick = () => {
    showModal(translations[currentLang].modal_wip);
};


ELEMENTS.disconnectBtn.onclick = () => {
    resetWalletState();
};

document.getElementById("donateBtn").onclick = async () => {
    if (!signer) {
        showModal(translations[currentLang].modal_connect);
        return;
    }
    
    let total = 0;
    if (donationType === 'preset') {
        total = parseFloat(ELEMENTS.presetAmountInputEl.value) || 0;
    } else {
        for (const input of inputMap.values()) {
            total += parseFloat(input.value) || 0;
        }
    }

    if (total === 0) {
        showModal(translations[currentLang].modal_no_amount);
        return;
    }

    try {
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        
        const totalAmount = ethers.parseUnits(total.toString(), selectedToken.decimals);
        
        ELEMENTS.statusEl.textContent = translations[currentLang].status_approve;
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount);
        await approveTx.wait();

        ELEMENTS.statusEl.textContent = translations[currentLang].status_donate;

        if (donationType === 'preset') {
            const donateTx = await contract.donatePreset(PRESET_NAME, selectedToken.address, totalAmount);
            await donateTx.wait();
        } else {
            let recipients = [];
            let amounts = [];
            for (const [addr, input] of inputMap.entries()) {
                const value = parseFloat(input.value) || 0;
                if (value > 0) {
                    recipients.push(ethers.getAddress(addr));
                    amounts.push(ethers.parseUnits(value.toString(), selectedToken.decimals));
                }
            }

            if (recipients.length === 0) {
                showModal(translations[currentLang].modal_no_amount);
                return;
            }

            const donateTx = await contract.donate(selectedToken.address, recipients, amounts);
            await donateTx.wait();
        }
        
        ELEMENTS.statusEl.textContent = translations[currentLang].status_success;

    } catch (err) {
        console.error(err);
        let errorMessage = err.message;
        if (err.reason) {
            errorMessage = err.reason;
        }
        ELEMENTS.statusEl.textContent = `${translations[currentLang].status_error} ${errorMessage}`;
    }
};

ELEMENTS.contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_sending;
    
    const response = await fetch(this.action, {
        method: this.method,
        body: new FormData(this),
        headers: {
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_success;
        ELEMENTS.contactForm.reset();
    } else {
        ELEMENTS.contactStatus.textContent = translations[currentLang].contact_status_error;
    }
});

// --- Initialization ---
window.onload = function() {
    fetchTranslations();
    // renderDonationTable() будет вызван внутри fetchTranslations -> setLanguage
};
