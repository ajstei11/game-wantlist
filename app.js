const STORAGE_KEY = "gameWantlist";

let games = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const gameForm = document.getElementById("gameForm");
const gameList = document.getElementById("gameList");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

function saveGames() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function renderGames(filter = "") {
    gameList.innerHTML = "";

    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredGames.length === 0) {
        gameList.innerHTML =
            '<div class="empty">No games found.</div>';
        return;
    }

    filteredGames.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";

        const priorityClass =
            game.priority === "High"
                ? "priority-high"
                : game.priority === "Medium"
                ? "priority-medium"
                : "priority-low";

        card.innerHTML = `
            <h3>${game.title}</h3>

            <div class="game-meta">
                ${game.platform} •
                <span class="${priorityClass}">
                    ${game.priority}
                </span>
                • ${game.status}
            </div>

            <div>
                Price: ${
                    game.price
                        ? "$" + Number(game.price).toFixed(2)
                        : "N/A"
                }
            </div>

            <p>${game.notes || ""}</p>

            <div class="game-actions">
                <button
                    class="delete-btn"
                    onclick="deleteGame('${game.id}')"
                >
                    Delete
                </button>
            </div>
        `;

        gameList.appendChild(card);
    });
}

function deleteGame(id) {
    games = games.filter(game => game.id !== id);
    saveGames();
    renderGames(searchInput.value);
}

gameForm.addEventListener("submit", e => {
    e.preventDefault();

    const game = {
        id: crypto.randomUUID(),
        title: document.getElementById("title").value.trim(),
        platform: document.getElementById("platform").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value,
        price: document.getElementById("price").value,
        notes: document.getElementById("notes").value.trim()
    };

    games.push(game);

    saveGames();
    renderGames(searchInput.value);

    gameForm.reset();
});

searchInput.addEventListener("input", e => {
    renderGames(e.target.value);
});

exportBtn.addEventListener("click", () => {
    const blob = new Blob(
        [JSON.stringify(games, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "game-wantlist.json";
    a.click();

    URL.revokeObjectURL(url);
});

importFile.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        try {
            const importedGames = JSON.parse(e.target.result);

            if (Array.isArray(importedGames)) {
                games = importedGames;
                saveGames();
                renderGames(searchInput.value);
                alert("Import successful!");
            } else {
                alert("Invalid file format.");
            }
        } catch {
            alert("Unable to read file.");
        }
    };

    reader.readAsText(file);
});

renderGames();
