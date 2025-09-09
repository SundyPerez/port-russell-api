const token = localStorage.getItem("token");
const tableBody = document.querySelector("#catwaysTable tbody");
let editingCatwayId = null;

async function loadCatways() {
  const res = await fetch("http://localhost:3000/api/catways", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const catways = await res.json();
  tableBody.innerHTML = "";
  catways.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.catwayNumber}</td>
      <td>${c.catwayType}</td>
      <td>${c.catwayState}</td>
      <td>
        <button onclick="editCatway('${c._id}', '${c.catwayNumber}', '${c.catwayType}', '${c.catwayState}')">Modifier</button>
        <button onclick="deleteCatway('${c._id}')">Supprimer</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function showForm() {
  document.getElementById("formDiv").style.display = "block";
}

function hideForm() {
  document.getElementById("formDiv").style.display = "none";
  editingCatwayId = null;
  document.getElementById("catwayNumber").value = "";
  document.getElementById("catwayType").value = "short";
  document.getElementById("catwayState").value = "";
}

function editCatway(id, number, type, state) {
  editingCatwayId = id;
  document.getElementById("catwayNumber").value = number;
  document.getElementById("catwayType").value = type;
  document.getElementById("catwayState").value = state;
  showForm();
}

async function saveCatway() {
  const catwayNumber = document.getElementById("catwayNumber").value;
  const catwayType = document.getElementById("catwayType").value;
  const catwayState = document.getElementById("catwayState").value;

  const method = editingCatwayId ? "PUT" : "POST";
  const url = editingCatwayId
    ? `http://localhost:3000/api/catways/${editingCatwayId}`
    : "http://localhost:3000/api/catways";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ catwayNumber, catwayType, catwayState })
  });

  hideForm();
  loadCatways();
}

async function deleteCatway(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce catway ?")) return;
  await fetch(`http://localhost:3000/api/catways/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  loadCatways();
}

loadCatways();
