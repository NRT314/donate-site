
const CONTRACT_ADDRESS = "0x875eB740603Cd0eAE03caa99Dd2d0f23BE9B6BF5"; // ваш контракт
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT в сети Polygon

const ABI = [
  "function donate(address token, address[] recipients, uint256[] amounts) external"
];

const RECIPIENTS = [
  "0xc0F467567570AADa929fFA115E65bB39066e3E42" // ваш основной адрес
];

async function connectWallet() {
  if (!window.ethereum) return alert("Установите MetaMask или Rabby");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const addr = accounts[0];
  document.getElementById("walletAddress").innerText = "Кошелёк: " + addr;
  window.provider = provider;
  window.signer = await provider.getSigner();
}

async function donate() {
  if (!window.signer) {
    return alert("Сначала подключите кошелёк.");
  }

  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || amount <= 0) return alert("Введите корректную сумму");

  try {
    const signer = window.signer;
    const token = new ethers.Contract(USDT_ADDRESS, [
      "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);

    const donationAmount = ethers.parseUnits(amount.toString(), 6); // USDT имеет 6 знаков

    // 1. Approve
    document.getElementById("status").innerText = "⏳ Подтвердите в кошельке (approve)...";
    const approveTx = await token.approve(CONTRACT_ADDRESS, donationAmount);
    await approveTx.wait();

    // 2. Donate
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    document.getElementById("status").innerText = "⏳ Подтвердите в кошельке (donate)...";
    const tx = await contract.donate(USDT_ADDRESS, RECIPIENTS, [donationAmount]);
    await tx.wait();

    document.getElementById("status").innerText = "✅ Готово! Спасибо за донат.";
  } catch (e) {
    console.error(e);
    document.getElementById("status").innerText = "❌ Ошибка: " + (e.reason || e.message);
  }
}
