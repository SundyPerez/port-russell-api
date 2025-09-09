const token = localStorage.getItem("token");
const tableBody = document.querySelector("#reservationsTable tbody");
let editingReservationId = null;

async function loadReservations() {
  const res = await fetch("http://localhost:3000/api/catways", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const catways = await res.json();
  
  tableBody.innerHTML = "";

  for (const catway of catways) {
    const resCatway = await fetch(`http://localhost:3000/api/catways/${catway._id}/reservations`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const reservations = await resCatway.json();

    reservations.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.clientName}</td>
        <td>${r.boatName}</td>
        <td>${new Date(r.startDate).toLocaleDateString()}</td>
        <td>${new Date(r.endDate).toLocaleDateString()}</td>
        <td>${catway.catwayNumber}</td>
        <td>
          <button onclick="editReservation('${r._id}', '${r.clientName}', '${r.boatName}', '${r.startDate}', '${r.endDate}', '${catway._id}')">Modifier</button>
          <button onclick="deleteReservation('${r._id}', '${catway._id}')">Supprimer</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

function showForm() {
  document.getElementById("formDiv").style.display = "block";
}

function hideForm() {
  document.getElementById("formDiv").style.display = "none";
  editingReservationId = null;
  document.getElementById("clientName").value = "";
  document.getElementById("boatName").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("catwayId").value = "";
}

function editReservation(id, client, boat, start, end, catwayId) {
  editingReservationId = id;
  document.getElementById("clientName").value = client;
  document.getElementById("boatName").value = boat;
  document.getElementById("startDate").value = start.split('T')[0];
  document.getElementById("endDate").value = end.split('T')[0];
  document.getElementById("catwayId").value = catwayId;
  showForm();
}

async function saveReservation() {
  const clientName = document.getElementById("clientName").value;
  const boatName = document.getElementById("boatName").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const catwayId = document.getElementById("catwayId").value;

  const method = editingReservationId ? "PUT" : "POST";
  const url = editingReservationId
    ? `http://localhost:3000/api/catways/${catwayId}/reservations/${editingReservationId}`
    : `http://localhost:3000/api/catways/${catwayId}/reservations`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ clientName, boatName, startDate, endDate })
  });

  hideForm();
  loadReservations();
}

async function deleteReservation(id, catwayId) {
  if (!confirm("Voulez-vous vraiment supprimer cette réservation ?")) return;
  await fetch(`http://localhost:3000/api/catways/${catwayId}/reservations/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  loadReservations();
}

loadReservations();
