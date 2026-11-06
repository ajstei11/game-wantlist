const STORAGE_KEY = "gameWantlist";

const CONFIG = {
    systems: [
        "PlayStation 1",
        "PlayStation 2",
        "PlayStation 3",
        "PlayStation 4",
        "Nintendo Entertainment System",
        "Super Nintendo Entertainment System",
        "Nintendo 64",
        "GameCube",
        "Wii",
        "Nintendo Switch",
        "Switch 2",
        "Microsoft Xbox",
        "Xbox One",
        "Xbox Series X|S",
    ]
};

function populateSystemDropdowns() {
    const systemSelect = document.getElementById("system");
    const systemFilter = document.getElementById("systemFilter");

    CONFIG.systems.forEach(system => {
        systemSelect.add(new Option (system, system));
        systemFilter.add(new Option (system, system));
    });
}

let games =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

const gameForm =
    document.getElementById("gameForm");

const tableBody =
    document.getElementById("gameTableBody");

const systemFilter =
    document.getElementById("systemFilter");

const sortBy =
    document.getElementById("sortBy");

const stats =
    document.getElementById("stats");

function saveGames() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(games)
    );
}

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString();
}

function updateStats() {

    const totalGames = games.length;

    const totalCost =
        games.reduce(
            (sum, game) =>
                sum + Number(game.price || 0),
            0
        );

    stats.innerHTML = `
        Games: ${totalGames}
        |
        Estimated Total:
        $${totalCost.toFixed(2)}
    `;
}

function renderGames() {

    let filtered = [...games];

    if (
        systemFilter.value !== "All"
    ) {
        filtered =
            filtered.filter(
                game =>
                    game.system ===
                    systemFilter.value
            );
    }

    switch (sortBy.value) {

        case "title-asc":
            filtered.sort((a, b) =>
                a.title.localeCompare(
                    b.title
                )
            );
            break;

        case "title-desc":
            filtered.sort((a, b) =>
                b.title.localeCompare(
                    a.title
                )
            );
            break;

        case "price-asc":
            filtered.sort(
                (a, b) =>
                    a.price - b.price
            );
            break;

        case "price-desc":
            filtered.sort(
                (a, b) =>
                    b.price - a.price
            );
            break;

        case "date-asc":
            filtered.sort(
                (a, b) =>
                    new Date(
                        a.dateAdded
                    ) -
                    new Date(
                        b.dateAdded
                    )
            );
            break;

        case "date-desc":
            filtered.sort(
                (a, b) =>
                    new Date(
                        b.dateAdded
                    ) -
                    new Date(
                        a.dateAdded
                    )
            );
            break;
    }

    tableBody.innerHTML = "";

    if (filtered.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-row"
                >
                    No games found.
                </td>
            </tr>
        `;

        updateStats();
        return;
    }

    filtered.forEach(game => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                <input
                    type="checkbox"
                    class="deleteCheck"
                    value="${game.id}"
                >
            </td>

            <td>${game.title}</td>

            <td>${game.system}</td>

            <td>
                $${Number(
                    game.price || 0
                ).toFixed(2)}
            </td>

            <td>
                ${formatDate(
                    game.dateAdded
                )}
            </td>

            <td>
                ${game.notes || ""}
            </td>
        `;

        tableBody.appendChild(row);
    });

    updateStats();
}

gameForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const game = {
            id: crypto.randomUUID(),
            title:
                document
                .getElementById("title")
                .value
                .trim(),
            system:
                document
                .getElementById("system")
                .value,
            price:
                Number(
                    document
                    .getElementById("price")
                    .value
                ) || 0,
            notes:
                document
                .getElementById("notes")
                .value
                .trim(),
            dateAdded:
                new Date()
                .toISOString()
        };

        games.push(game);

        saveGames();

        renderGames();

        gameForm.reset();
    }
);

systemFilter.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "systemFilter",
            systemFilter.value
        );

        renderGames();
    }
);

sortBy.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "sortBy",
            sortBy.value
        );

        renderGames();
    }
);

document
.getElementById(
    "deleteSelected"
)
.addEventListener(
    "click",
    () => {

        const selectedIds =
            Array.from(
                document
                .querySelectorAll(
                    ".deleteCheck:checked"
                )
            )
            .map(
                box => box.value
            );

        if (
            selectedIds.length === 0
        ) {
            alert(
                "No games selected."
            );
            return;
        }

        if (
            !confirm(
                `Delete ${selectedIds.length} game(s)?`
            )
        ) {
            return;
        }

        games =
            games.filter(
                game =>
                    !selectedIds.includes(
                        game.id
                    )
            );

        saveGames();

        renderGames();
    }
);

document
.getElementById(
    "exportBtn"
)
.addEventListener(
    "click",
    () => {

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        games,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;
        a.download =
            "game-wantlist.json";

        a.click();

        URL.revokeObjectURL(
            url
        );
    }
);

document
.getElementById(
    "importFile"
)
.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload =
            e => {

                try {

                    const imported =
                        JSON.parse(
                            e.target.result
                        );

                    if (
                        Array.isArray(
                            imported
                        )
                    ) {

                        games =
                            imported;

                        saveGames();

                        renderGames();

                        alert(
                            "Import successful."
                        );
                    }

                } catch {

                    alert(
                        "Invalid file."
                    );
                }
            };

        reader.readAsText(
            file
        );
    }
);

systemFilter.value =
    localStorage.getItem(
        "systemFilter"
    ) || "All";

sortBy.value =
    localStorage.getItem(
        "sortBy"
    ) || "title-asc";

renderGames();

populateSystemDropdowns();
