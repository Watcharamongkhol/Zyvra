const STORAGE_KEY = "zyvraSalesData";
let salesData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const prices = {
  shirt: { name: "เสื้อเดี่ยว", price: 200, shirts: 1, pants: 0 },
  pants: { name: "กางเกงเดี่ยว", price: 300, shirts: 0, pants: 1 },
  shirtPromo: { name: "เสื้อโปร 2 ตัว", price: 350, shirts: 2, pants: 0 },
  pantsPromo: { name: "กางเกงโปร 2 ตัว", price: 550, shirts: 0, pants: 2 },
  set: { name: "เสื้อ + กางเกง", price: 450, shirts: 1, pants: 1 }
};

let salesChart, productChart, ordersChart;

const today = new Date().toLocaleDateString("th-TH");

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(salesData));
}

function getTodaySales() {
  return salesData.filter(sale => sale.date === today);
}

function addSale() {
  const saleType = document.getElementById("saleType").value;
  const quantity = parseInt(document.getElementById("quantity").value);

  if (isNaN(quantity) || quantity < 1) {
    alert("กรุณาใส่จำนวนให้ถูกต้อง");
    return;
  }

  const item = prices[saleType];

  salesData.push({
    id: Date.now(),
    date: today,
    time: new Date().toLocaleTimeString("th-TH"),
    saleType,
    type: item.name,
    quantity,
    total: item.price * quantity,
    shirts: item.shirts * quantity,
    pants: item.pants * quantity
  });

  saveData();
  updateDashboard();
}

function deleteSale(id) {
  if (!confirm("ยืนยันการลบรายการนี้?")) return;

  salesData = salesData.filter(sale => sale.id !== id);
  saveData();
  updateDashboard();
}

function editSale(id) {
  const sale = salesData.find(item => item.id === id);
  if (!sale) return;

  const newQuantity = parseInt(prompt(`แก้ไขจำนวน ${sale.type}`, sale.quantity));

  if (isNaN(newQuantity) || newQuantity < 1) {
    alert("จำนวนไม่ถูกต้อง");
    return;
  }

  const item = prices[sale.saleType];

  sale.quantity = newQuantity;
  sale.total = item.price * newQuantity;
  sale.shirts = item.shirts * newQuantity;
  sale.pants = item.pants * newQuantity;

  saveData();
  updateDashboard();
}

function clearTodaySales() {
  if (!confirm("ล้างประวัติวันนี้ทั้งหมด?")) return;

  salesData = salesData.filter(sale => sale.date !== today);
  saveData();
  updateDashboard();
}

function updateDashboard() {
  const todaySales = getTodaySales();

  let totalSales = 0,
    shirtCount = 0,
    pantsCount = 0;

  const salesByType = {
    เสื้อเดี่ยว: 0,
    กางเกงเดี่ยว: 0,
    เสื้อโปร: 0,
    กางเกงโปร: 0,
    เซ็ตคู่: 0
  };

  const orderCounts = {
    เสื้อเดี่ยว: 0,
    กางเกงเดี่ยว: 0,
    เสื้อโปร: 0,
    กางเกงโปร: 0,
    เซ็ตคู่: 0
  };

  const table = document.getElementById("salesTable");
  table.innerHTML = "";

  todaySales.forEach((sale, index) => {
    totalSales += sale.total;
    shirtCount += sale.shirts;
    pantsCount += sale.pants;

    const key =
      sale.saleType === "shirt" ? "เสื้อเดี่ยว" :
      sale.saleType === "pants" ? "กางเกงเดี่ยว" :
      sale.saleType === "shirtPromo" ? "เสื้อโปร" :
      sale.saleType === "pantsPromo" ? "กางเกงโปร" : "เซ็ตคู่";

    salesByType[key] += sale.total;
    orderCounts[key]++;

    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${sale.time}</td>
        <td>${sale.type}</td>
        <td>${sale.quantity}</td>
        <td>${sale.total.toLocaleString()} บาท</td>
        <td>
          <button onclick="editSale(${sale.id})">✏️</button>
          <button onclick="deleteSale(${sale.id})">🗑️</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("totalSales").textContent = totalSales.toLocaleString();
  document.getElementById("totalOrders").textContent = todaySales.length;
  document.getElementById("shirtCount").textContent = shirtCount;
  document.getElementById("pantsCount").textContent = pantsCount;

  const bestSeller = Object.keys(salesByType).reduce((a, b) =>
    salesByType[a] > salesByType[b] ? a : b
  );

  document.getElementById("bestSeller").textContent =
    totalSales > 0 ? bestSeller : "-";

  updateCharts(salesByType, shirtCount, pantsCount, orderCounts);
}

function updateCharts(salesByType, shirts, pants, orderCounts) {
  if (salesChart) salesChart.destroy();
  if (productChart) productChart.destroy();
  if (ordersChart) ordersChart.destroy();

  salesChart = new Chart(document.getElementById("salesChart"), {
    type: "bar",
    data: {
      labels: Object.keys(salesByType),
      datasets: [{
        label: "ยอดขาย",
        data: Object.values(salesByType)
      }]
    }
  });

  productChart = new Chart(document.getElementById("productChart"), {
    type: "doughnut",
    data: {
      labels: ["เสื้อ", "กางเกง"],
      datasets: [{
        data: [shirts, pants]
      }]
    }
  });

  ordersChart = new Chart(document.getElementById("ordersChart"), {
    type: "pie",
    data: {
      labels: Object.keys(orderCounts),
      datasets: [{
        data: Object.values(orderCounts)
      }]
    }
  });
}

function exportToExcel() {
  const todaySales = getTodaySales();

  if (!todaySales.length) {
    alert("ไม่มีข้อมูลวันนี้");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(todaySales);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "ZYVRA Sales");

  XLSX.writeFile(workbook, `ZYVRA_${today.replace(/\//g, "-")}.xlsx`);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("show");
}

updateDashboard();