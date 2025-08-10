// CONTRACT DETAILS & CONSTANTS
const CONTRACT_ADDRESS = "0xE61FEb2c3278A6094571ce12177767221cA4b661";

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
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
];

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

const POLYGON_CHAIN_ID = '0x89'; // 137

async function switchToPolygon() {
    if (!window.ethereum) throw new Error("Кошелек не найден");

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_CHAIN_ID }],
        });
        console.log("Успешно переключено на Polygon");
    } catch (switchError) {
        if (switchError.code === 4902) {
            console.log("Сеть Polygon не найдена, попытка добавить...");
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: POLYGON_CHAIN_ID,
                        chainName: 'Polygon Mainnet',
                        rpcUrls: ['https://polygon.llamarpc.com'],
                        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                        blockExplorerUrls: ['https://polygonscan.com/'],
                    }],
                });
            } catch (addError) {
                console.error("Не удалось добавить сеть Polygon:", addError);
                throw addError;
            }
        } else {
            console.error("Не удалось переключить сеть:", switchError);
            throw switchError;
        }
    }
}

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
    document.getElementById("modalMessage").innerHTML = message;
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
    if (!texts) return;
    const langKeys = document.querySelectorAll('[data-lang-key]');
    langKeys.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (texts[key] !== undefined) {
            element.innerHTML = texts[key];
        }
    });
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
    if (ELEMENTS.faqContentEl && texts.faq_questions) {
        ELEMENTS.faqContentEl.innerHTML = texts.faq_questions.map((item) => `
        <details class="faq-item bg-gray-50 border border-gray-200 rounded-lg mb-2">
            <summary class="font-medium text-gray-700">${item.q}</summary>
            <div class="px-4 py-3 text-gray-600">${item.a}</div>
        </details>
    `).join('');
    }
    if (ELEMENTS.discussionsContentEl) {
        ELEMENTS.discussionsContentEl.innerHTML = texts.discussions_content || '';
    }
    if (ELEMENTS.howToGetNrtContentEl) {
        ELEMENTS.howToGetNrtContentEl.innerHTML = texts.how_to_get_nrt_content || '';
    }
    if (ELEMENTS.howToBuyCryptoContentEl) {
        ELEMENTS.howToBuyCryptoContentEl.innerHTML = texts.how_to_buy_crypto_content || '';
    }
    const presetRecipientsCount = presetRecipients.length;
    ELEMENTS.presetDescriptionEl.textContent = texts.preset_description.replace('{count}', presetRecipientsCount);
}

function setLanguage(lang) {
    currentLang = lang;
    updateContent();
    renderDonationTable();
    const contractLink = document.getElementById('contract-link');
    if (contractLink) {
        const newHref = lang === 'ru' ? 'contract-details-ru.html' : 'contract-details-en.html';
        contractLink.setAttribute('href', newHref);
    }
    ELEMENTS.langEnBtn.classList.toggle('border-blue-600', lang === 'en');
    ELEMENTS.langEnBtn.classList.toggle('border-transparent', lang !== 'en');
    ELEMENTS.langRuBtn.classList.toggle('border-blue-600', lang === 'ru');
    ELEMENTS.langRuBtn.classList.toggle('border-transparent', lang !== 'ru');
    recalc();
}

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
    } else {
        for (const input of inputMap.values()) {
            totalInTokens += parseFloat(input.value) || 0;
        }
    }
    ELEMENTS.presetTokenSymbolEl.textContent = tokenSymbol;
    ELEMENTS.tokenSymbolHeader.textContent = tokenSymbol;
    ELEMENTS.tokenSymbolAmount.textContent = tokenSymbol;
    ELEMENTS.totalAmountEl.textContent = `${totalInTokens.toFixed(2)} ${tokenSymbol}`;
    ELEMENTS.nrtAmountEl.textContent = `${totalInTokens.toFixed(2)}`;
}

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
                connectWallet();
            }
        });
        window.ethereum.on('chainChanged', () => {
            console.log('Chain changed. Reloading page...');
            window.location.reload();
        });
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showModal(translations[currentLang].modal_metamask);
        return;
    }
    try {
        await switchToPolygon();
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        const address = accounts[0];
        ELEMENTS.walletAddressEl.innerText = `Wallet: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        ELEMENTS.connectButtons.classList.add('hidden');
        ELEMENTS.disconnectBtn.classList.remove('hidden');
        setupWalletListeners();
    } catch (e) {
        showModal(`${translations[currentLang].modal_error} ${e.message}`);
    }
}

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
ELEMENTS.connectBrowserBtn.onclick = connectWallet;
ELEMENTS.connectMobileBtn.onclick = () => showModal(translations[currentLang].modal_wip || "Mobile connection coming soon!");
ELEMENTS.disconnectBtn.onclick = resetWalletState;

document.getElementById("donateBtn").onclick = async () => {
    if (!signer) {
        showModal(translations[currentLang].modal_connect || "Please connect your wallet first.");
        return;
    }

    try {
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 137) {
            showModal(translations[currentLang].modal_switch_to_polygon || "Please switch to Polygon network to donate.");
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
        if (total <= 0) {
            showModal(translations[currentLang].modal_no_amount || "Please enter a donation amount.");
            return;
        }

        ELEMENTS.statusEl.textContent = translations[currentLang].status_prepare_tx || "Preparing transaction...";

        const userAddress = await signer.getAddress();
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const totalAmount = ethers.parseUnits(total.toString(), selectedToken.decimals);

        const maticBalance = await provider.getBalance(userAddress);
        if (maticBalance < ethers.parseUnits("0.01", "ether")) { // Немного увеличим порог на всякий случай
            showModal(translations[currentLang].modal_low_matic || "Not enough MATIC to pay for gas.");
            ELEMENTS.statusEl.textContent = '';
            return;
        }

        const feeData = await provider.getFeeData();

        const allowance = await tokenContract.allowance(userAddress, CONTRACT_ADDRESS);
        console.log("Current allowance:", allowance.toString(), "Needed:", totalAmount.toString());

        if (allowance < totalAmount) {
            ELEMENTS.statusEl.textContent = translations[currentLang].status_approve || "Waiting for approval...";
            
            const approveGasLimit = await tokenContract.approve.estimateGas(CONTRACT_ADDRESS, totalAmount);
            const gasOptionsApprove = {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas,
                gasLimit: BigInt(Math.round(Number(approveGasLimit) * 1.5)) // Запас 50%
            };
            console.log("Approve required. Using manual gas options:", gasOptionsApprove);

            const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount, gasOptionsApprove);
            console.log("Approve tx hash:", approveTx.hash);
            await approveTx.wait();
            console.log("Approve transaction confirmed.");
        } else {
            console.log("Allowance sufficient, skipping approve.");
        }

        ELEMENTS.statusEl.textContent = translations[currentLang].status_donate || "Processing donation...";
        
        // --- ПРИНУДИТЕЛЬНЫЙ ГАЗ ДЛЯ ВТОРОЙ ТРАНЗАКЦИИ (DONATE) ---
        let donateTx;
        if (donationType === 'preset') {
            const donateGasLimit = await contract.donatePreset.estimateGas(PRESET_NAME, selectedToken.address, totalAmount);
            const gasOptionsDonate = {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas,
                gasLimit: BigInt(Math.round(Number(donateGasLimit) * 1.5))
            };
            console.log("Executing donatePreset with manual gas:", gasOptionsDonate);
            donateTx = await contract.donatePreset(PRESET_NAME, selectedToken.address, totalAmount, gasOptionsDonate);
        } else {
            const recipients = [];
            const amounts = [];
            for (const [addr, input] of inputMap.entries()) {
                const value = parseFloat(input.value) || 0;
                if (value > 0) {
                    recipients.push(ethers.getAddress(addr));
                    amounts.push(ethers.parseUnits(value.toString(), selectedToken.decimals));
                }
            }
            if (recipients.length === 0) {
                showModal(translations[currentLang].modal_no_amount || "Please select recipients.");
                ELEMENTS.statusEl.textContent = '';
                return;
            }
            const donateGasLimit = await contract.donate.estimateGas(selectedToken.address, recipients, amounts);
            const gasOptionsDonate = {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas,
                gasLimit: BigInt(Math.round(Number(donateGasLimit) * 1.5))
            };
            console.log("Executing donate with manual gas:", gasOptionsDonate);
            donateTx = await contract.donate(selectedToken.address, recipients, amounts, gasOptionsDonate);
        }
        
        console.log("Donate tx hash:", donateTx.hash);
        await donateTx.wait();
        console.log("Donate transaction confirmed.");
        
        ELEMENTS.statusEl.textContent = translations[currentLang].status_success || "Donation successful! Thank you!";

    } catch (err) {
        console.error("Full Transaction Error:", JSON.stringify(err, null, 2));
        let errorMessage = err?.reason || err?.data?.message || err?.message || "An unknown error occurred.";
        if (err?.code === 4001 || err?.code === 'ACTION_REJECTED' || err.message.includes('user rejected transaction')) {
            errorMessage = "Transaction rejected by user.";
        }
        ELEMENTS.statusEl.textContent = `${translations[currentLang].status_error || 'Error:'} ${errorMessage}`;
    }
};

ELEMENTS.contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const texts = translations[currentLang];
    ELEMENTS.contactStatus.textContent = texts.contact_status_sending || "Sending...";
    const response = await fetch(this.action, {
        method: this.method,
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
        ELEMENTS.contactStatus.textContent = texts.contact_status_success || "Message sent!";
        ELEMENTS.contactForm.reset();
    } else {
        ELEMENTS.contactStatus.textContent = texts.contact_status_error || "Oops! There was a problem.";
    }
});

window.onload = function() {
    fetchTranslations();
};
