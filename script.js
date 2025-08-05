// === НОВЫЙ БЛОК: ИМПОРТИРУЕМ НУЖНЫЕ ИНСТРУМЕНТЫ ===
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { BrowserProvider, Contract, getAddress, parseUnits } from 'ethers';
// === КОНЕЦ НОВОГО БЛОКА ===

// --- КОНФИГУРАЦИЯ ---
const projectId = 'c2ddfb7c663b6494c5c0cfdb7e0f9e6a';
const metadata = {
    name: 'NRT Donate',
    description: 'NRT - a blockchain platform for transparent and secure support of independent organizations via crypto donations.',
    url: window.location.href,
    icons: [window.location.origin + '/logo.png']
};
const polygon = {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
};

// --- КОНСТАНТЫ ПРОЕКТА ---
const CONTRACT_ADDRESS = "0xF6AEbf37dB416597c73D7e25876343C0d92F416A";
const TOKENS = {
    usdt: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, symbol: "USDT" },
    usdc: { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6, symbol: "USDC (Bridget)" },
    dai: { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, symbol: "DAI" }
};
const ABI = ["function donate(address token, address[] recipients, uint256[] amounts) external", "function donatePreset(string calldata name, address token, uint256 amount) external", "event Donation(address indexed donor, address indexed token, address indexed recipient, uint256 amount)"];
const ERC20_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
const ORGS = [["thisproject", "0xc0F467567570AADa929fFA115E65bB39066e3E42"],["ovdinfo","0x421896bb0Dcf271a294bC7019014EE90503656Fd"],["mediazona","0xE86D7D922DeF8a8FEB21f1702C9AaEEDBec32DDC"],["zhuk","0x1913A02BB3836AF224aEF136461F43189A0cEcd0"],["breakfastshow","0xdB4BB555a15bC8bB3b07E57452a8E6E24b358e7F"],["kovcheg","0xBf178F99b8790db1BD2194D80c3a268AE4AcE804"],["findexit","0xADb524cE8c2009e727f6dF4b6a443D455c700244"],["gulagunet","0x6051F40d4eF5d5E5BC2B6F4155AcCF57Be6B8F58"],["meduza","0x00B9d7Fe4a2d3aCdd4102Cfb55b98d193B94C0fa"],["cit","0xfBcc8904ce75fF90CC741DA80703202faf5b2FcF"],["importantstories","0x5433CE0E05D117C54f814cc6697244eA0b902DBF"],["fbk","0x314aC71aEB2feC4D60Cc50Eb46e64980a27F2680"],["iditelesom","0x387C5300586336d145A87C245DD30f9724C6eC01"],["memorial","0x0a4aB5D641f63cd7a2d44d0a643424f5d0df376b"],["insider","0xad8221D4A4feb023156b9E09917Baa4ff81A65F8"],["rain","0x552dAfED221689e44676477881B6947074a5C342"]];
const PRESET_NAME = "equal";

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ЭЛЕМЕНТЫ ---
const ELEMENTS = {
    donationTable: document.getElementById("donationTable"), totalAmountEl: document.getElementById("totalAmount"), nrtAmountEl: document.getElementById("nrtAmount"), statusEl: document.getElementById("status"), tokenSymbolHeader: document.getElementById("tokenSymbolHeader"), tokenSymbolAmount: document.getElementById("tokenSymbolAmount"), presetTokenSymbolEl: document.getElementById("presetTokenSymbol"), presetAmountInputEl: document.getElementById("presetAmountInput"), connectBtn: document.getElementById("connectBrowserBtn"), disconnectBtn: document.getElementById("disconnectBtn"), walletAddressEl: document.getElementById("walletAddress"), presetDonationEl: document.getElementById("presetDonation"), customDonationEl: document.getElementById("customDonation"), presetDescriptionEl: document.getElementById("presetDescription"), aboutContentEl: document.getElementById("about-content"), plansContentEl: document.getElementById("plans-content"), faqContentEl: document.getElementById("faq-content"), contactForm: document.getElementById("contactForm"), contactStatus: document.getElementById("contactStatus"), langEnBtn: document.getElementById("lang-en"), langRuBtn: document.getElementById("lang-ru"), tokenRadios: document.querySelectorAll('input[name="token"]'), donationTypeRadios: document.querySelectorAll('input[name="donation-type"]')
};
let translations = {};
let currentLang = 'en';
const inputMap = new Map();
let selectedToken = TOKENS.usdt;
let donationType = 'custom';
let signer = null;

// --- ИНИЦИАЛИЗАЦИЯ WEB3MODAL ---
const modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [polygon],
    projectId,
    enableAnalytics: true,
    themeMode: 'light'
});

// --- ЛОГИКА ПОДКЛЮЧЕНИЯ КОШЕЛЬКА ---
modal.subscribeProvider(async ({ provider, isConnected, address, chainId }) => {
    if (isConnected) {
        const ethersProvider = new BrowserProvider(provider);
        signer = await ethersProvider.getSigner();
        if (chainId !== polygon.chainId) {
            updateWalletUI(address, true);
        } else {
            ELEMENTS.statusEl.textContent = "";
            updateWalletUI(address, false);
        }
    } else {
        signer = null;
        updateWalletUI(null);
    }
});

function updateWalletUI(address, isWrongNetwork = false) {
    const connectButtonContainer = document.getElementById('connectButtons');
    if (address) {
        ELEMENTS.walletAddressEl.innerText = `Wallet: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        if (isWrongNetwork) {
            ELEMENTS.walletAddressEl.innerHTML += ' <span style="color: red;">(Wrong Network)</span>';
        }
        connectButtonContainer.style.display = 'none';
        ELEMENTS.disconnectBtn.style.display = 'block';
    } else {
        ELEMENTS.walletAddressEl.innerText = '';
        connectButtonContainer.style.display = 'block';
        ELEMENTS.disconnectBtn.style.display = 'none';
    }
}

function connectWallet() { modal.open(); }
function disconnectWallet() { modal.disconnect(); }

// --- ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ ---
document.getElementById("donateBtn").onclick = async () => {
    if (!signer) {
        showModal(translations[currentLang]?.modal_connect || "Please connect your wallet first.");
        return;
    }
    const { chainId } = modal.getState();
    if (chainId !== polygon.chainId) {
        showModal(translations[currentLang]?.modal_wrong_network || "Cannot donate. Please switch to the Polygon network.");
        return;
    }
    let total = 0;
    if (donationType === 'preset') {
        total = parseFloat(ELEMENTS.presetAmountInputEl.value) || 0;
    } else {
        for (const input of inputMap.values()) { total += parseFloat(input.value) || 0; }
    }
    if (total === 0) {
        showModal(translations[currentLang]?.modal_no_amount || "Please enter a donation amount.");
        return;
    }
    try {
        const tokenContract = new Contract(selectedToken.address, ERC20_ABI, signer);
        const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const totalAmount = parseUnits(total.toString(), selectedToken.decimals);
        ELEMENTS.statusEl.textContent = translations[currentLang]?.status_approve || "Approving transaction...";
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount);
        await approveTx.wait();
        ELEMENTS.statusEl.textContent = translations[currentLang]?.status_donate || "Sending donation...";
        let donateTx;
        if (donationType === 'preset') {
            donateTx = await contract.donatePreset(PRESET_NAME, selectedToken.address, totalAmount);
        } else {
            let recipients = [], amounts = [];
            for (const [addr, input] of inputMap.entries()) {
                const value = parseFloat(input.value) || 0;
                if (value > 0) {
                    recipients.push(getAddress(addr));
                    amounts.push(parseUnits(value.toString(), selectedToken.decimals));
                }
            }
            if (recipients.length === 0) {
                showModal(translations[currentLang]?.modal_no_amount || "Please enter a donation amount.");
                return;
            }
            donateTx = await contract.donate(selectedToken.address, recipients, amounts);
        }
        await donateTx.wait();
        ELEMENTS.statusEl.textContent = translations[currentLang]?.status_success || "Donation successful! Thank you!";
    } catch (err) {
        console.error(err);
        let errorMessage = err.message;
        if (err.reason) errorMessage = err.reason;
        ELEMENTS.statusEl.textContent = `${translations[currentLang]?.status_error || "Error:"} ${errorMessage}`;
    }
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function fetchTranslations() { try { const response = await fetch('translations.json'); translations = await response.json(); setLanguage(currentLang); } catch (error) { console.error("Error fetching translations:", error); } }
function showModal(message) { document.getElementById("modalMessage").innerText = message; document.getElementById("myModal").style.display = "block"; }
function closeModal() { document.getElementById("myModal").style.display = "none"; }
window.onclick = function(event) { if (event.target === document.getElementById("myModal")) { closeModal(); } };
function updateContent() { const texts = translations[currentLang] || {}; const langKeys = document.querySelectorAll('[data-lang-key]'); langKeys.forEach(element => { const key = element.getAttribute('data-lang-key'); if (texts[key]) { element.innerHTML = texts[key]; } }); ELEMENTS.aboutContentEl.innerHTML = `<h3 class="font-semibold text-xl mb-2">${texts.about_section_idea_title||''}</h3><p class="mb-4">${texts.about_section_idea_text||''}</p><h3 class="font-semibold text-xl mb-2">${texts.about_section_why_polygon_title||''}</h3><p class="mb-4">${texts.about_section_why_polygon_text||''}</p><h3 class="font-semibold text-xl mb-2">${texts.about_section_what_is_nrt_title||''}</h3><p class="mb-4">${texts.about_section_what_is_nrt_text||''}</p>`; ELEMENTS.plansContentEl.innerHTML = `<h3 class="font-semibold text-xl mb-2">${texts.plans_section_short_term_title||''}</h3><p class="mb-4">${texts.plans_section_short_term_text||''}</p><h3 class="font-semibold text-xl mb-2">${texts.plans_section_global_title||''}</h3><p class="mb-4">${texts.plans_section_global_text||''}</p>`; ELEMENTS.faqContentEl.innerHTML = (texts.faq_questions || []).map((item) => `<details class="faq-item bg-gray-50 border border-gray-200 rounded-lg mb-2"><summary class="font-medium text-gray-700">${item.q}</summary><div class="px-4 py-3 text-gray-600">${item.a}</div></details>`).join(''); const presetRecipientsCount = ORGS.length; ELEMENTS.presetDescriptionEl.textContent = (texts.preset_description || '').replace('{count}', presetRecipientsCount); }
function setLanguage(lang) { currentLang = lang; updateContent(); ELEMENTS.langEnBtn.classList.toggle('border-blue-600', lang === 'en'); ELEMENTS.langEnBtn.classList.toggle('border-transparent', lang !== 'en'); ELEMENTS.langRuBtn.classList.toggle('border-blue-600', lang === 'ru'); ELEMENTS.langRuBtn.classList.toggle('border-transparent', lang !== 'ru'); recalc(); }
function renderDonationTable() { ELEMENTS.donationTable.innerHTML = ''; ORGS.forEach(([name, addr]) => { const row = document.createElement("tr"); row.className = "hover:bg-gray-50 transition-colors duration-200"; row.innerHTML = `<td class="p-3 border border-gray-300">${name}</td><td class="p-3 border border-gray-300 font-mono text-xs hidden md:table-cell"><code>${addr}</code></td><td class="p-3 border border-gray-300"><input type="number" min="0" step="0.01" value="0" class="w-full md:w-32 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/></td>`; const input = row.querySelector("input"); input.addEventListener("input", recalc); inputMap.set(addr, input); ELEMENTS.donationTable.appendChild(row); }); }
function recalc() { let totalInTokens = 0; const tokenSymbol = selectedToken.symbol; if (donationType === 'preset') { totalInTokens = parseFloat(ELEMENTS.presetAmountInputEl.value) || 0; ELEMENTS.presetTokenSymbolEl.textContent = tokenSymbol; ELEMENTS.nrtAmountEl.textContent = `${totalInTokens.toFixed(2)}`; } else { for (const input of inputMap.values()) { totalInTokens += parseFloat(input.value) || 0; } ELEMENTS.tokenSymbolHeader.textContent = tokenSymbol; ELEMENTS.tokenSymbolAmount.textContent = tokenSymbol; ELEMENTS.totalAmountEl.textContent = `${totalInTokens.toFixed(2)} ${tokenSymbol}`; ELEMENTS.nrtAmountEl.textContent = `${totalInTokens.toFixed(2)}`; } }
ELEMENTS.contactForm.addEventListener("submit", async function(event) { event.preventDefault(); ELEMENTS.contactStatus.textContent = translations[currentLang]?.contact_status_sending || 'Sending...'; const response = await fetch(this.action, { method: this.method, body: new FormData(this), headers: { 'Accept': 'application/json' } }); if (response.ok) { ELEMENTS.contactStatus.textContent = translations[currentLang]?.contact_status_success || 'Message sent!'; ELEMENTS.contactForm.reset(); } else { ELEMENTS.contactStatus.textContent = translations[currentLang]?.contact_status_error || 'Oops! There was a problem.'; } });

// --- ЗАПУСК ПРИЛОЖЕНИЯ ---
window.onload = function() {
    ELEMENTS.connectBtn.onclick = connectWallet;
    ELEMENTS.disconnectBtn.onclick = disconnectWallet;
    ELEMENTS.langEnBtn.addEventListener('click', () => setLanguage('en'));
    ELEMENTS.langRuBtn.addEventListener('click', () => setLanguage('ru'));
    ELEMENTS.tokenRadios.forEach(radio => { radio.addEventListener('change', (e) => { selectedToken = TOKENS[e.target.value]; recalc(); }); });
    ELEMENTS.donationTypeRadios.forEach(radio => { radio.addEventListener('change', (e) => { donationType = e.target.value; ELEMENTS.presetDonationEl.classList.toggle('hidden', donationType !== 'preset'); ELEMENTS.customDonationEl.classList.toggle('hidden', donationType === 'preset'); recalc(); }); });
    ELEMENTS.presetAmountInputEl.addEventListener('input', recalc);
    fetchTranslations();
    renderDonationTable();
    const customRadio = document.querySelector('input[name="donation-type"][value="custom"]');
    customRadio.checked = true;
    ELEMENTS.presetDonationEl.classList.add('hidden');
    ELEMENTS.customDonationEl.classList.remove('hidden');
};
