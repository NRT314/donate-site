const connectButton = document.getElementById("connectWallet");
const donateButton = document.getElementById("donateButton");
const walletAddressDisplay = document.getElementById("walletAddress");
const status = document.getElementById("status");

let provider;
let signer;
let userAddress;

const CONTRACT_ADDRESS = "0x875eB740603Cd0eAE03caa99Dd2d0f23BE9B6BF5";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon

const ABI = [
  "function donate(address token, address[] recipients, uint256[] amounts) external",
  "function balanceOf(address owner) view returns (uint256)",
];

const RECIPIENTS = ["0xc0F467567570AADa929fFA115E65bB39066e3E42"]; // основной
const AMOUNTS = ["30000"]; // 0.03 USDT (6 decimals)

connectButton.onclick = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask or Rabby first.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    walletAddressDisplay.textContent = `Connected: ${userAddress}`;
    status.textContent = "";
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error connecting wallet.";
  }
};

donateButton.onclick = async () => {
  if (!signer) {
    status.textContent = "❌ Connect your wallet first.";
    return;
  }

  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || amount <= 0) {
    status.textContent = "❌ Enter a valid amount.";
    return;
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const usdt = new ethers.Contract(
    USDT_ADDRESS,
    ["function approve(address spender, uint256 amount) public returns (bool)"],
    signer
  );

  const valueInUnits = ethers.utils.parseUnits(amount.toString(), 6); // USDT has 6 decimals

  try {
    status.textContent = "⏳ Approving...";
    const approveTx = await usdt.approve(CONTRACT_ADDRESS, valueInUnits);
    await approveTx.wait();

    status.textContent = "⏳ Sending donation...";
    const tx = await contract.donate(USDT_ADDRESS, RECIPIENTS, [valueInUnits]);
    await tx.wait();

    status.textContent = "✅ Donation successful!";
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error: " + (err.message || "Transaction failed");
  }
};
