// CONTRACT DETAILS
const CONTRACT_ADDRESS = "0x2440272Bb06F2dd6A4BB324fA2a9c6620Cb7536A";

// 🚀 ВАЖНО: Вставьте сюда ваш новый API-ключ Alchemy
const ALCHEMY_API_KEY = "JdPCO0ShPVRm3qtHGVfBU";
// 🚀 ВАЖНО: Используйте WSS-адрес для подписки на события
const ALCHEMY_WSS_URL = `wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
// Используйте HTTPS-адрес для обычных запросов
const ALCHEMY_HTTPS_URL = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;


// TOKEN DETAILS - All supported tokens on Polygon Mainnet
const TOKENS = {
    usdt: {
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        symbol: "USDT"
    },
    usdc: {
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        decimals: 6,
        symbol: "USDC (Bridget)"
    },
    dai: {
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
        symbol: "DAI"
    }
};

// ABI for the NRT contract - now includes events and new function
const ABI = [
    "function donate(address token, address[] recipients, uint256[] amounts) external",
    "function totalDonatedOverallInUsdt() external view returns (uint256)",
    "event Donation(address indexed donor, address indexed token, address[] recipients, uint256[] amounts)"
];

// ABI for ERC-20 tokens - approve function
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)"
];

// RECIPIENT LIST
const ORGS = [
    ["thisproject", "0xc0F467567570AADa929fFA115E65bB39066e3E42"],
    ["ovdinfo", "0x421896bb0Dcf271a294bC7019014EE90503656Fd"],
    ["mediazona", "0xE86D7D922DeF8a8FEB21f1702C9AaEEDBec32DDC"],
    ["zhuk", "0x1913A02BB3836AF224aEF136461F43189A0cEcd0"],
    ["breakfastshow", "0xdB4BB555a15bC8bB3b07E57452a8E6E24b358e7F"],
    ["kovcheg", "0xBf178F99b8790db1BD2194D80c3a268AE4AcE804"],
    ["findexit", "0xADb524cE8c2009e727f6dF4b6a443D455c700244"],
    ["gulagunet", "0x6051F40d4eF5d5E5BC2B6F4155AcCF57Be6B8F58"],
    ["meduza", "0x00B9d7Fe4a2d3aCdd4102Cfb55b98d193B94C0fa"],
    ["cit", "0xfBcc8904ce75fF90CC741DA80703202faf5b2FcF"],
    ["importantstories", "0x5433CE0E05D117C54f814cc6697244eA0b902DBF"],
    ["fbk", "0x314aC71aEB2feC4D60Cc50Eb46e64980a27F2680"],
    ["iditelesom", "0x387C5300586336d145A87C245DD30f9724C6eC01"]
];

// Language translations object
const translations = {
    en: {
        title: 'Support Independent Organizations',
        description: 'Donate to verified Russian independent projects using stablecoins and receive <strong>NRT</strong> tokens in return. The exchange rate is fixed at <strong>1 stablecoin = 1 NRT</strong>.',
        wallet_title: 'Wallet Connection',
        connect_button: 'Connect Wallet',
        disconnect_button: 'Disconnect Wallet',
        rates_title: 'Exchange Rate',
        total_donated_title: 'Total Donations',
        events_title: 'Recent Donations',
        token_selection_title: 'Select Donation Token',
        donations_title: 'Your Donations',
        org_header: 'Organization',
        wallet_header: 'Wallet',
        amount_header: 'Amount',
        total_amount_text: 'Total Amount',
        nrt_received_text: 'You will receive',
        donate_button: 'Send Donation',
        technical_details_title: 'Technical Details',
        technical_details_network: 'Network: Polygon',
        technical_details_contract: 'NRT Contract: <code>0x2440272Bb06F2dd6A4BB324fA2a9c6620Cb7536A</code>',
        technical_details_token: 'Tokens: USDT (6), USDC (Bridget) (6), DAI (18)',
        modal_connect: 'Please connect your wallet first.',
        modal_metamask: 'Please install MetaMask or Rabby.',
        modal_error: 'Connection Error: ',
        modal_no_amount: 'Please enter at least one donation amount.',
        status_approve: '⏳ Confirm approval...',
        status_donate: '⏳ Confirm donation...',
        status_success: '✅ Thank you for your donation!',
        status_error: '❌ Error: '
    },
    ru: {
        title: 'Поддержите независимые организации',
        description: 'Пожертвуйте в проверенные российские независимые проекты, используя стейблкоины, и получите токены <strong>NRT</strong> в ответ. Курс обмена фиксирован: <strong>1 стейблкоин = 1 NRT</strong>.',
        wallet_title: 'Подключение кошелька',
        connect_button: 'Подключить кошелёк',
        disconnect_button: 'Отключить кошелёк',
        rates_title: 'Курс обмена',
        total_donated_title: 'Общая сумма пожертвований',
        events_title: 'Недавние пожертвования',
        token_selection_title: 'Выберите токен для пожертвования',
        donations_title: 'Ваши пожертвования',
        org_header: 'Организация',
        wallet_header: 'Кошелёк',
        amount_header: 'Сумма',
        total_amount_text: 'Общая сумма',
        nrt_received_text: 'Вы получите',
        donate_button: 'Отправить пожертвование',
        technical_details_title: 'Технические детали',
        technical_details_network: 'Сеть: Polygon',
        technical_details_contract: 'Контракт NRT: <code>0x2440272Bb06F2dd6A4BB324fA2a9c6620Cb7536A</code>',
        technical_details_token: 'Токены: USDT (6), USDC (Bridget) (6), DAI (18)',
        modal_connect: 'Сначала подключите кошелёк.',
        modal_metamask: 'Установите MetaMask или Rabby.',
        modal_error: 'Ошибка подключения: ',
        modal_no_amount: 'Укажите хотя бы одну сумму для пожертвования.',
        status_approve: '⏳ Подтвердите одобрение...',
        status_donate: '⏳ Подтвердите пожертвование...',
        status_success: '✅ Спасибо за донат!',
        status_error: '❌ Ошибка: '
    }
};

let currentLang = 'en';
let provider, signer;
const donationTable = document.getElementById("donationTable");
const totalAmountEl = document.getElementById("totalAmount");
const nrtAmountEl = document.getElementById("nrtAmount");
const statusEl = document.getElementById("status");
const tokenSymbolHeader = document.getElementById("tokenSymbolHeader");
const tokenSymbolAmount = document.getElementById("tokenSymbolAmount");
const rateDisplay = document.getElementById("rateDisplay");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const walletAddressEl = document.getElementById("walletAddress");
const totalDonatedOverallEl = document.getElementById("totalDonatedOverallInUsdt");
const loadingTotalEl = document.getElementById("loadingTotal");
const inputMap = new Map();
let selectedToken = TOKENS.usdt;
    
const eventsLogEl = document.getElementById("eventsLog");
    
function showModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("myModal").style.display = "block";
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
    
window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
        closeModal();
    }
}
    
function setLanguage(lang) {
    currentLang = lang;
    const langKeys = document.querySelectorAll('[data-lang-key]');
    langKeys.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    document.getElementById('lang-en').classList.remove('border-blue-600', 'border-transparent');
    document.getElementById('lang-ru').classList.remove('border-blue-600', 'border-transparent');
    if (lang === 'en') {
        document.getElementById('lang-en').classList.add('border-blue-600');
        document.getElementById('lang-ru').classList.add('border-transparent');
    } else {
        document.getElementById('lang-ru').classList.add('border-blue-600');
        document.getElementById('lang-en').classList.add('border-transparent');
    }
    recalc();
}

function renderDonationTable() {
    donationTable.innerHTML = '';
    ORGS.forEach(([name, addr]) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 transition-colors duration-200";
        row.innerHTML = `<td class="p-3 border border-gray-300">${name}</td>
            <td class="p-3 border border-gray-300 font-mono text-xs hidden md:table-cell"><code>${addr}</code></td>
            <td class="p-3 border border-gray-300">
                <input type="number" min="0" step="0.01" value="0" class="w-full md:w-32 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </td>`;
        const input = row.querySelector("input");
        input.addEventListener("input", recalc);
        inputMap.set(addr, input);
        donationTable.appendChild(row);
    });
}
    
function recalc() {
    let totalInTokens = 0;
    for (const input of inputMap.values()) {
        totalInTokens += parseFloat(input.value) || 0;
    }
    const totalNrt = totalInTokens;

    const tokenSymbol = selectedToken.symbol;
    tokenSymbolHeader.textContent = tokenSymbol;
    tokenSymbolAmount.textContent = tokenSymbol;
    rateDisplay.textContent = `1 ${tokenSymbol} = 1 NRT`;
    totalAmountEl.textContent = `${totalInTokens.toFixed(2)} ${tokenSymbol}`;
    nrtAmountEl.textContent = `${totalNrt.toFixed(2)} NRT`;
}
    
function getOrgName(address) {
    const org = ORGS.find(([name, addr]) => addr.toLowerCase() === address.toLowerCase());
    return org ? org[0] : address.substring(0, 6) + '...';
}
    
function addEventToLog(donor, tokenAddress, recipients, amounts, transactionHash) {
    const tokenSymbol = Object.values(TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())?.symbol || tokenAddress.substring(0, 6) + '...';
    const decimals = Object.values(TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())?.decimals || 18;
        
    const formattedAmounts = amounts.map((amount, index) => {
        const formattedValue = ethers.formatUnits(amount, decimals);
        const recipientName = getOrgName(recipients[index]);
        return `${parseFloat(formattedValue).toFixed(2)} ${tokenSymbol} to ${recipientName}`;
    }).join(', ');

    const logItem = document.createElement("li");
    logItem.className = "bg-white p-3 rounded-lg shadow-sm";
    logItem.innerHTML = `
        <p class="text-sm">
            <strong>From:</strong> <code>${donor.substring(0, 6)}...${donor.slice(-4)}</code>
        </p>
        <p class="text-sm">
            <strong>Donation:</strong> ${formattedAmounts}
        </p>
        <p class="text-xs text-gray-400 mt-1">
            Transaction hash: <code>${transactionHash.substring(0, 6)}...</code>
        </p>
    `;
        
    eventsLogEl.innerHTML = '';
    eventsLogEl.prepend(logItem);
}
    
async function fetchAndListenForEvents() {
    try {
        const wssProvider = new ethers.WebSocketProvider(ALCHEMY_WSS_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wssProvider);

        eventsLogEl.innerHTML = `
            <li class="bg-white p-3 rounded-lg shadow-sm text-center text-gray-500">
                Ожидание первого пожертвования...
            </li>
        `;

        contract.on("Donation", (donor, tokenAddress, recipients, amounts, log) => {
            console.log("New Donation Event:", log);
            addEventToLog(donor, tokenAddress, recipients, amounts, log.transactionHash);
            fetchTotalDonations();
        });

    } catch (error) {
        console.error("Failed to listen for events:", error);
        eventsLogEl.innerHTML = `
            <li class="text-red-500">
                Ошибка при получении событий: ${error.message}
            </li>
        `;
    }
}

async function fetchTotalDonations() {
    try {
        const rpcProvider = new ethers.JsonRpcProvider(ALCHEMY_HTTPS_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpcProvider);

        const totalAmountBigInt = await contract.totalDonatedOverallInUsdt();
            
        const formattedAmount = ethers.formatUnits(totalAmountBigInt, 6);

        totalDonatedOverallEl.textContent = parseFloat(formattedAmount).toFixed(2);
        loadingTotalEl.classList.add('hidden');
    } catch (error) {
        console.error("Failed to fetch total donations:", error);
        totalDonatedOverallEl.textContent = "Error";
        loadingTotalEl.classList.add('hidden');
    }
}

function resetWalletState() {
    signer = null;
    walletAddressEl.innerText = '';
    connectBtn.classList.remove('hidden');
    disconnectBtn.classList.add('hidden');
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
                walletAddressEl.innerText = `Wallet: ${accounts[0]}`;
            }
        });
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('Chain changed. Reloading page...');
            window.location.reload();
        });
    }
}

renderDonationTable();
setLanguage('en');
    
document.getElementById("lang-en").addEventListener('click', () => setLanguage('en'));
document.getElementById("lang-ru").addEventListener('click', () => setLanguage('ru'));
    
document.querySelectorAll('input[name="token"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedToken = TOKENS[e.target.value];
        recalc();
    });
});

connectBtn.onclick = async () => {
    if (!window.ethereum) {
        showModal(translations[currentLang].modal_metamask);
        return;
    }
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        walletAddressEl.innerText = `Wallet: ${accounts[0]}`;
        connectBtn.classList.add('hidden');
        disconnectBtn.classList.remove('hidden');
        setupWalletListeners();
    } catch (e) {
        showModal(`${translations[currentLang].modal_error} ${e.message}`);
    }
};

disconnectBtn.onclick = () => {
    resetWalletState();
};

document.getElementById("donateBtn").onclick = async () => {
    if (!signer) {
        showModal(translations[currentLang].modal_connect);
        return;
    }
        
    const recipients = [];
    const amounts = [];
    let total = 0;

    for (const [addr, input] of inputMap.entries()) {
        const value = parseFloat(input.value) || 0;
        if (value > 0) {
            recipients.push(ethers.getAddress(addr));
            amounts.push(value);
        }
    }
    total = amounts.reduce((sum, a) => sum + a, 0);

    if (recipients.length === 0) {
        showModal(translations[currentLang].modal_no_amount);
        return;
    }
        
    try {
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
            
        const totalAmount = ethers.parseUnits(total.toString(), selectedToken.decimals);
        const amountBNs = amounts.map(a => ethers.parseUnits(a.toString(), selectedToken.decimals));

        statusEl.textContent = translations[currentLang].status_approve;
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, totalAmount);
        await approveTx.wait();

        console.log("Approval successful. Attempting to send donation transaction...");

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        statusEl.textContent = translations[currentLang].status_donate;
        const donateTx = await contract.donate(selectedToken.address, recipients, amountBNs);
        await donateTx.wait();

        statusEl.textContent = translations[currentLang].status_success;

        await fetchTotalDonations();
    } catch (err) {
        console.error(err);
        statusEl.textContent = `${translations[currentLang].status_error} ${err.message}`;
    }
};

window.onload = function() {
    fetchTotalDonations();
    fetchAndListenForEvents();
};
