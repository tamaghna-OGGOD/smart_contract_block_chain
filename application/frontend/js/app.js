const API_BASE = "http://localhost:3000/tokens";

function toggleForm(id) {
    document.getElementById("createTokenForm").classList.add("hidden");
    document.getElementById("transferForm").classList.add("hidden");
    document.getElementById(id).classList.remove("hidden");
}

async function loadTokens() {
    const container = document.getElementById("tokens");
    container.innerHTML = "🔄 Loading tokens...";

    try {
        const res = await fetch(API_BASE);
        const tokens = await res.json();

        if (!Array.isArray(tokens)) throw new Error("Invalid response format");

        container.innerHTML = "";

        tokens.forEach(token => {
            const div = document.createElement("div");
            div.className = "token";
            div.innerHTML = `
        <strong>ID:</strong> ${token.ID}<br>
        <strong>Owner:</strong> ${token.Owner}<br>
        <strong>Producer:</strong> ${token.Producer}<br>
        <strong>Amount:</strong> ${token.EnergyAmount} kWh<br>
        <strong>Price:</strong> $${token.Price}<br>
        <strong>Source:</strong> ${token.SourceType}<br>
        <strong>For Sale:</strong> ${token.ForSale}<br>
        <strong>Certified Green:</strong> ${token.CertifiedGreen}
      `;
            container.appendChild(div);
        });

    } catch (err) {
        container.innerHTML = `<p style="color:red;">Error loading tokens: ${err.message}</p>`;
    }
}

document.getElementById("createTokenForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    payload.energyAmount = parseFloat(payload.energyAmount);
    payload.price = parseFloat(payload.price);
    payload.forSale = payload.forSale === "true";
    payload.certifiedGreen = payload.certifiedGreen === "true";

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Token created");
            loadTokens();
            e.target.reset();
        } else {
            throw new Error(data.error || "Failed to create token");
        }
    } catch (err) {
        alert("❌ " + err.message);
    }
});

document.getElementById("transferForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { id, newOwner } = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`${API_BASE}/${id}/transfer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newOwner }),
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Token transferred");
            loadTokens();
            e.target.reset();
        } else {
            throw new Error(data.error || "Failed to transfer token");
        }
    } catch (err) {
        alert("❌ " + err.message);
    }
});

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tokenSection").style.display = "none";
});

function showTokenHistory() {
    document.getElementById("tokenSection").style.display = "block";
    loadTokens();
}
