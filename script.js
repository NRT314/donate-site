const CONTRACT_ADDRESS = "0x875eB740603Cd0eAE03caa99Dd2d0f23BE9B6BF5";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon

const ABI = [
  "function donate(address token, address[] recipients, uint256[] amounts) external",
  "function decimals() public view returns (uint8)"
];

const organizations = [
  { name: "Основной проект", addr: "0xc0F467567570AADa929fFA115E65bB39066e3E42" },
  { name: "OVD Info", addr: "0xDEf2A85bF3E520312f06E226fdD0a0537b5daA29" },
  { name: "Mediazona", addr: "0xE86D7D922DeF8a8FEB21f1702C9AaEEDBec32DDC" },
  { name: "Zhuk", addr: "0x9b2e1A594D88Ef73CE5d0fAfBd0CbC8c6dFC6B91" },
  { name: "Breakfast Show", addr: "0xdB4BB555a15bC8bB3b07E57452a8E6E24b358e7F" }
];

let provider;
let signer;

const orgTable = document.getElementById("orgTable");
const totalSpan = document.getElementById("total");
const nrtSpan = document.getElementById("nrt");
const connectButton = document.getElementById("connectButton");
const status = document.getElementById("status");

function updateTotals() {
  const inputs = document.querySelectorAll(".amountInput");
  let total = 0;
  inputs.forEach(input => {
    total += parseFloat(input.value || 0);
  });
  totalSpan.textContent = total.toFixed(2);
  nrtSpan.textContent = total.toFixed(2);
}

function renderTable() {
  organizations.forEach(org => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${org.name}</td>
      <td style="font-size: 0.8em">${org.addr}</td>
      <td><input type="number" class="amountInput" data-addr="${org.addr}" step="0.01" min="0" value="0.00" /></td>
    `;
    orgTable.appendChild(tr);
  });
  document.querySelectorAll(".amountInput").forEach(input => {
    input.addEventListener("input", updateTotals);
  });
}

connectButton.onclick = async () => {
  if (!window.ethereum) {
    alert("Установите MetaMask или другой Web3-кошелек");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();
  status.textContent = `✅ Кошелек подключен: ${address}`;
};

document.getElementById("donationForm").onsubmit = async (e) => {
  e.preventDefault();
  if (!signer) {
    alert("Сначала подключите кошелек");
    return;
  }

  const recipients = [];
  const amounts = [];
  const decimals = 6; // USDT
  let total = 0;

  document.querySelectorAll(".amountInput").forEach(input => {
    const val = parseFloat(input.value || 0);
    if (val > 0) {
      recipients.push(input.dataset.addr);
      const amt = ethers.utils.parseUnits(val.toString(), decimals);
      amounts.push(amt);
      total += val;
    }
  });

  if (total === 0) {
    alert("Введите суммы для пожертвования");
    return;
  }

  const usdt = new ethers.Contract(USDT_ADDRESS, ["function approve(address spender, uint256 amount) public returns (bool)"], signer);
  const token = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  status.textContent = "⏳ Одобрение USDT...";
  const approveTx = await usdt.approve(CONTRACT_ADDRESS, ethers.utils.parseUnits(total.toString(), decimals));
  await approveTx.wait();

  status.textContent = "⏳ Отправка пожертвования...";
  const tx = await token.donate(USDT_ADDRESS, recipients, amounts);
  await tx.wait();

  status.textContent = "✅ Готово! Спасибо за поддержку.";
};

renderTable();
