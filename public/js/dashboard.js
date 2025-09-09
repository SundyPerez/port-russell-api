document.getElementById("userName").textContent = localStorage.getItem("username");
document.getElementById("userEmail").textContent = localStorage.getItem("email");
document.getElementById("currentDate").textContent = new Date().toLocaleDateString();

const token = localStorage.getItem("token");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

async function loadReservations() {
  try {
    const res = await fetch("http://localhost:3000/api/catways", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const catways = await res.json();

    const tbody = document.querySelector("#reservationsTable tbody");
    tbody.innerHTML = "";

    for (let catway of catways) {
      const resRes = await fetch(`http://localhost:3000/api/catways/${catway._id}/reservations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const reservations = await resRes.json();

      reservations.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${catway.catwayNumber}</td>
          <td>${r.clientName}</td>
          <td>${r.boatName}</td>
          <td>${new Date(r.startDate).toLocaleDateString()}</td>
          <td>${new Date(r.endDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

loadReservations();
