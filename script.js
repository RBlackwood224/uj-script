// --- Játék Állapot Változók ---
let player = {}; // Ezt fogjuk inicializálni az initialPlayerState alapján
let currentEnemy = null;
let lavaBridgeBroken = false;
let playerAttackedInTurn = false; // Harcban egy körben csak egyszer támadhat a játékos

// --- UI Elemek ---
const gameScreen = document.getElementById('game-screen');
const charCreationScreen = document.getElementById('char-creation-screen');
const mainMenuScreen = document.getElementById('main-menu-screen');
const storyScreen = document.getElementById('story-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameTextOutput = document.getElementById('game-text-output');
const commandInput = document.getElementById('command-input');
const submitCommandButton = document.getElementById('submit-command');

// --- Alapértelmezett Játékos Állapot (initialPlayerState) ---
// Ezt használjuk a játékos objektum inicializálásához és a resetGame során.
const initialPlayerState = {
    name: '',
    class: '',
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    attack: 10,
    defense: 5,
    gold: 0,
    xp: 0,
    level: 1,
    location: 'lavaBridge', // Kezdő szoba ID-ja
    inventory: [],
    equipped: {
        weapon: null,
        armor: null
    },
    isInCombat: false,
    exploredRooms: new Set(),
    librarianQuestCompleted: false, // Új flag a könyvtáros küldetéshez
    // Metódus a játékos objektumon belül
    hasKey: function(itemId) {
        return this.inventory.some(item => item.id === itemId);
    }
};

// --- Játék Adatok (Tárgyak, Ellenfelek, Szobák, NPC-k) ---

const items = {
    rustySword: {
        id: "rustySword",
        name: "Rusty Sword",
        description: "An old, rusty sword. Better than nothing.",
        type: "weapon",
        attackBonus: 5
    },
    rustyKnife: {
        id: "rustyKnife",
        name: "Rusty Knife",
        description: "A small, rusty knife.",
        type: "weapon",
        attackBonus: 3
    },
    healingPotion: {
        id: "healingPotion",
        name: "Healing Potion",
        description: "A small vial filled with a glowing red liquid. Restores health.",
        type: "consumable",
        effect: "heal",
        value: 30 // HP restored
    },
    manaPotion: {
        id: "manaPotion",
        name: "Mana Potion",
        description: "A small vial filled with a shimmering blue liquid. Restores mana.",
        type: "consumable",
        effect: "mana",
        value: 20 // Mana restored
    },
    leatherArmor: {
        id: "leatherArmor",
        name: "Leather Armor",
        description: "Simple leather armor, offering basic protection.",
        type: "armor",
        defenseBonus: 3
    },
    goldCoin: {
        id: "goldCoin",
        name: "gold coin", // kisbetűvel is maradhat, ha így akarod
        type: "currency",
        value: 1, // Mennyit ér egy coin
        description: "A single, tarnished gold coin."
    },
    masterworkSword: {
        id: "masterworkSword",
        name: "Masterwork Sword",
        description: "An exceptionally crafted sword, gleaming with forgotten magic.",
        type: "weapon",
        attackBonus: 15
    },
    ancientScroll: {
        id: "ancientScroll",
        name: "Ancient Scroll",
        description: "A brittle, yellowed scroll with arcane symbols.",
        type: "quest"
    },
    gemstoneAmulet: {
        id: "gemstoneAmulet",
        name: "Gemstone Amulet",
        description: "A heavy amulet set with a large, sparkling gemstone. It radiates faint magical energy.",
        type: "trinket", // Vagy más típus
        value: 50 // Eladási érték példa
    },
    bloodyShiv: {
        id: "bloodyShiv",
        name: "Bloody Shiv",
        description: "A crude, sharp piece of metal, stained with rust and dry blood. It's unsettlingly light.",
        type: "weapon",
        attackBonus: 7
    },
    disguiseKit: {
        id: "disguiseKit",
        name: "Disguise Kit",
        description: "A small pouch containing theatrical makeup, fake mustaches, and a variety of cheap wigs. Might be useful for sneaking past guards.",
        type: "utility"
    },
    tomeOfLostHistories: { // A librarian quest itemje
        id: "tomeOfLostHistories",
        name: "Tome of Lost Histories",
        description: "A massive, dust-covered book filled with forgotten tales and obscure knowledge.",
        type: "quest"
    },
    rustyKey: { // Librarian reward
        id: "rustyKey",
        name: "Rusty Key",
        description: "An old, rusty key. It looks like it might open a simple lock.",
        type: "key"
    },
    heavyIronKey: {
        id: "heavyIronKey",
        name: "Heavy Iron Key",
        description: "A large, sturdy iron key.",
        type: "key"
    }
};

const enemies = {
    goblin: {
        id: "goblin",
        name: "Goblin",
        description: "A small, green-skinned creature with a rusty dagger.",
        health: 30,
        maxHealth: 30,
        attack: 7,
        defense: 2,
        xpReward: 15,
        goldReward: 5,
        drops: [{
            id: "goldCoin",
            chance: 50
        }]
    },
    skeleton: {
        id: "skeleton",
        name: "Skeleton",
        description: "The animated bones of a long-dead warrior.",
        health: 40,
        maxHealth: 40,
        attack: 9,
        defense: 4,
        xpReward: 20,
        goldReward: 8,
        drops: [{
            id: "rustySword",
            chance: 20
        }, {
            id: "goldCoin",
            chance: 70
        }]
    },
    mimic: {
        id: "mimic",
        name: "Mimic",
        description: "A monstrous creature disguised as a treasure chest, with a gaping maw full of teeth.",
        health: 60,
        maxHealth: 60,
        attack: 12,
        defense: 6,
        xpReward: 50,
        goldReward: 25,
        drops: [{
            id: "goldCoin",
            chance: 100,
            value: 10
        }, {
            id: "gemstoneAmulet",
            chance: 30
        }]
    },
    giantSpider: {
        id: "giantSpider",
        name: "Giant Spider",
        description: "A large, hairy spider with venomous fangs.",
        health: 35,
        maxHealth: 35,
        attack: 8,
        defense: 3,
        xpReward: 18,
        goldReward: 6,
        drops: [{
            id: "healingPotion",
            chance: 40
        }]
    },
    const npcs = {
    "librarian": {
        id: "librarian",
        name: "Librarian",
        description: "An old, hunched figure, peering over thick spectacles. He seems lost in his books.",
        dialogue: "Welcome, traveler. These archives hold many secrets, if you know where to look... or what to ask for. I'm looking for the Tome of Lost Histories. Have you seen it?",
        questItemNeeded: "tomeOfLostHistories",
        reward: items.oldKey
    },
    "evilEntity": { // Példa egy NPC-re, ami feladványt ad
        id: "evilEntity",
        name: "Shadowy Figure",
        description: "A formless, shadowy entity that speaks in riddles.",
        dialog: [
            "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?", // Answer: Map
            "What has an eye, but cannot see?", // Answer: Needle
            "What is always in front of you but can’t be seen?", // Answer: The Future
            "What has to be broken before you can use it?" // Answer: An Egg
        ],
        answers: ["map", "needle", "the future", "an egg"]
    },
    "guard": {
        id: "guard",
        name: "Castle Guard",
        description: "A hulking, armored guard. He looks rather bored.",
        dialogue: "Halt! None shall pass without Lord Dred's explicit command!",
        // Később: ha van álruhád, akkor átenged
    }
};


// --- ROOMS ---
const rooms = {
    lavaBridge: {
        id: 'lavaBridge',
        name: "The Lava Bridge",
        description: "Before you, an ancient, rusty iron bridge stretches from the volcano's edge towards a massive, dark stone structure, the **Castle Of Dred**. Below you, incandescent lava bubbles and seethes, radiating a fearsome heat. The air is heavy and sulfurous. The bridge looks rickety, but appears to hold.(The entrance is to the north.)",
        exits: { north: 'castleEntrance', south: 'gameOver_flee' },
        items: [],
        npcs: [],
        coords: { x: 5, y: 10 }
    },
    castleEntrance: {
        id: 'castleEntrance',
        name: "Castle Entrance",
        description: "You stand before the imposing main gates of the **Castle Of Dred**. They are made of dark, weathered wood, reinforced with heavy iron bands, and seem to be slightly ajar. Behind you, the lava bridge has collapsed into the fiery abyss, cutting off any retreat.",
        exits: { north: 'mainHall' },
        items: [],
        npcs: [],
        coords: { x: 5, y: 9 }
    },
    mainHall: {
        id: 'mainHall',
        name: "Main Hall",
        description: "You step into a vast and echoing Main Hall. Tall, ancient pillars stretch up to a vaulted ceiling, lost in shadow. Dust motes dance in faint rays of light filtering through high, stained-glass windows. A grand staircase leads upwards, and several ornate doors line the walls.",
        exits: { south: 'castleEntrance', east: 'eastCorridor', west: 'westCorridor', up: 'grandStaircaseLanding' },
        items: [],
        npcs: [],
        coords: { x: 5, y: 8 }
    },
    eastCorridor: {
        id: 'eastCorridor',
        name: "East Corridor",
        description: "A long, dimly lit corridor stretching east. Tapestries depicting forgotten battles hang on the walls, somewhat moth-eaten. The air here is colder.",
        exits: { west: 'mainHall', north: 'library', east: 'diningHall' },
        items: [],
        npcs: [],
        coords: { x: 6, y: 8 }
    },
    westCorridor: {
        id: 'westCorridor',
        name: "West Corridor",
        description: "This corridor mirrors the east, though its tapestries show more peaceful, though no less faded, scenes of courtly life. A faint, metallic smell lingers in the air.",
        exits: { east: 'mainHall', north: 'armory', west: 'barracks' },
        items: [],
        npcs: [],
        coords: { x: 4, y: 8 }
    },
    grandStaircaseLanding: {
        id: 'grandStaircaseLanding',
        name: "Grand Staircase Landing",
        description: "At the top of the grand staircase, you find a wide landing. A massive, unsettling statue of a winged demon dominates the center. More corridors lead off in different directions.",
        exits: { down: 'mainHall', north: 'throneRoomEntrance', east: 'upperEastCorridor', west: 'upperWestCorridor' },
        items: [],
        npcs: [],
        coords: { x: 5, y: 7 }
    },
    library: {
        id: 'library',
        name: "The Grand Library",
        description: "Thousands of books line the towering shelves of this vast library. The scent of old paper and dust is overwhelming. A lone, hunched figure is poring over a tome at a central desk.",
        exits: { south: 'eastCorridor', east: 'archives' },
        items: [],
        npcs: [npcs.librarian],
        events: {
            onEnter: (player) => {
                // Mimic chest trigger here (később implementálandó)
            }
        },
        coords: { x: 6, y: 7 }
    },
    archives: {
        id: 'archives',
        name: "Castle Archives",
        description: "A labyrinthine collection of scrolls and ancient records, even dustier than the main library. The air is thick with age, and you can barely make out the titles on the highest shelves.",
        exits: { west: 'library' },
        items: [
            items.tomeOfLostHistories // Hozzáadva
        ],
        npcs: [],
        puzzle: { // A puzzle-t a take/inspect paranccsal kell majd kezelni
            type: 'hiddenItem',
            itemToFind: 'tomeOfLostHistories',
            hint: 'The most important knowledge is often hidden in plain sight, or at least, on the highest shelf.',
            condition: (player) => player.hasKey("oldKey") // Példa: ha van kulcsa
        },
        coords: { x: 7, y: 7 }
    },
    diningHall: {
        id: 'diningHall',
        name: "Dining Hall",
        description: "A grand dining hall with a long, empty table that could seat a hundred. Cobwebs hang from the chandeliers, and broken pottery litters the floor. A faint, unsettling smell lingers.",
        exits: { west: 'eastCorridor', north: 'kitchen' },
        items: [
            items.goldCoin // Hozzáadva
        ],
        npcs: [],
        coords: { x: 7, y: 8 }
    },
    kitchen: {
        id: 'kitchen',
        name: "Kitchen",
        description: "A large, greasy kitchen. Rusting pots and pans hang from hooks. The air is stale, and faint outlines on the floor suggest where massive ovens once stood. A trapdoor is visible on the floor.",
        exits: { south: 'diningHall', down: 'hiddenCellar' },
        items: [
            items.rustyKnife // Hozzáadva
        ],
        npcs: [],
        trapdoor: { // Ezt a trapdoor objektumot is logikával kell majd kezelni
            locked: true,
            unlockItem: items.oilCan,
            destination: 'hiddenCellar',
            message: "The rusty trapdoor creaks open with effort."
        },
        coords: { x: 7, y: 9 }
    },
    hiddenCellar: {
        id: 'hiddenCellar',
        name: "Hidden Cellar",
        description: "A damp, dark cellar beneath the kitchen. Barrels line the walls, many of them broken. A pervasive chill fills the air. You hear faint dripping sounds.",
        exits: { up: 'kitchen', east: 'dungeonEntrance' },
        items: [
            items.healingPotion, // Hozzáadva
            items.goldCoin // Hozzáadva
        ],
        npcs: [],
        events: {
            onEnter: (player) => {
                // Mimic chest trigger here (később implementálandó)
            }
        },
        coords: { x: 7, y: 10 }
    },
    armory: {
        id: 'armory',
        name: "Armory",
        description: "Rows of empty weapon racks and armor stands line this room, suggesting a once-grand collection of arms. A few rusty pieces remain scattered on the floor.",
        exits: { south: 'westCorridor' },
        items: [
            items.rustySword, // Hozzáadva
            items.healingPotion // Hozzáadva
        ],
        npcs: [],
        events: {
            onEnter: (player) => {
                // Evil entity encounter trigger (később implementálandó)
            }
        },
        coords: { x: 4, y: 7 }
    },
    barracks: {
        id: 'barracks',
        name: "Barracks",
        description: "Bunk beds line the walls of this cramped room, now covered in dust. Old, tattered uniforms hang from hooks. The faint smell of mildew and stale sweat fills the air.",
        exits: { east: 'westCorridor' },
        items: [
            items.goldCoin, // Hozzáadva
            items.disguiseKit // Hozzáadva
        ],
        npcs: [],
        secretPassage: { // Ezt a secretPassage objektumot is logikával kell majd kezelni
            revealed: false,
            destination: 'trainingGrounds',
            hint: 'A loose brick in the fireplace seems out of place.',
            unlockCommand: 'inspect fireplace'
        },
        coords: { x: 3, y: 8 }
    },
    trainingGrounds: {
        id: 'trainingGrounds',
        name: "Training Grounds",
        description: "An old, overgrown outdoor training area, hidden behind a secret passage. Rusty targets and training dummies stand decaying in the open air. The castle walls loom high above.",
        exits: { south: 'barracks' },
        items: [
            items.rustySword, // Hozzáadva
            items.manaPotion // Hozzáadva
        ],
        npcs: [],
        coords: { x: 3, y: 7 }
    },
    throneRoomEntrance: {
        id: 'throneRoomEntrance',
        name: "Throne Room Entrance",
        description: "A wide, regal hallway leading to what appears to be the main Throne Room. Massive double doors, intricately carved, block the way forward.",
        exits: { south: 'grandStaircaseLanding', north: 'throneRoom' },
        items: [],
        npcs: [npcs.guard],
        door: { // Ezt a door objektumot is logikával kell majd kezelni
            locked: true,
            unlockItem: items.fancyKey,
            message: "The grand doors are heavily barred and locked."
        },
        coords: { x: 5, y: 6 }
    },
    throneRoom: {
        id: 'throneRoom',
        name: "Throne Room",
        description: "The grand Throne Room. A massive, obsidian throne sits on a raised dais, though it appears empty. The room is cold and silent, yet an oppressive aura fills the air.",
        exits: { south: 'throneRoomEntrance' },
        items: [],
        npcs: [],
        events: {
            onEnter: (player) => {
                // Disguise logic (később implementálandó)
            }
        },
        coords: { x: 5, y: 5 }
    },
    upperEastCorridor: {
        id: 'upperEastCorridor',
        name: "Upper East Corridor",
        description: "This elevated corridor offers a view over the Main Hall through arched windows. It leads further into the eastern wing.",
        exits: { west: 'grandStaircaseLanding', east: 'royalQuarters' },
        items: [],
        npcs: [],
        coords: { x: 6, y: 6 }
    },
    royalQuarters: {
        id: 'royalQuarters',
        name: "Royal Quarters",
        description: "Lavishly decorated, but long abandoned, this room was once clearly a royal bedchamber. Dust covers silk sheets and ornate furniture. A large, locked chest sits at the foot of the bed.",
        exits: { west: 'upperEastCorridor' },
        items: [], // A chest lootot külön kell kezelni
        npcs: [],
        chest: { // Ezt a chest objektumot is logikával kell majd kezelni
            locked: true,
            unlockItem: items.fancyKey,
            loot: [items.gemstoneAmulet, items.goldCoin, items.manaPotion],
            message: "The chest creaks open, revealing its dusty contents."
        },
        coords: { x: 7, y: 6 }
    },
    upperWestCorridor: {
        id: 'upperWestCorridor',
        name: "Upper West Corridor",
        description: "Similar to its eastern counterpart, this corridor leads to the western wing's upper rooms. The silence here is unnerving.",
        exits: { east: 'grandStaircaseLanding', west: 'servantsQuarters' },
        items: [],
        npcs: [],
        coords: { x: 4, y: 6 }
    },
    servantsQuarters: {
        id: 'servantsQuarters',
        name: "Servants' Quarters",
        description: "Small, utilitarian rooms, tightly packed together. Life here must have been harsh. Scattered belongings suggest a hasty departure.",
        exits: { east: 'upperWestCorridor' },
        items: [
            items.goldCoin, // Hozzáadva
            items.healingPotion // Hozzáadva
        ],
        npcs: [],
        coords: { x: 3, y: 6 }
    },
    dungeonEntrance: {
        id: 'dungeonEntrance',
        name: "Dungeon Entrance",
        description: "A dark, foreboding iron gate, reinforced with heavy chains, marks the entrance to the castle's dungeons. A faint, cold draft emanates from beyond.",
        exits: { west: 'hiddenCellar', down: 'dungeonLevel1' },
        items: [],
        npcs: [],
        gate: { // Ezt a gate objektumot is logikával kell majd kezelni
            locked: true,
            unlockItem: items.oldKey,
            message: "The heavy iron gate is secured with a massive, ancient lock."
        },
        coords: { x: 8, y: 10 }
    },
    dungeonLevel1: {
        id: 'dungeonLevel1',
        name: "Dungeon Level 1",
        description: "The air in the dungeon is thick with the smell of damp earth and decay. Stone cells line a narrow, torch-lit corridor. The echoes of dripping water fill the silence.",
        exits: { up: 'dungeonEntrance', north: 'tortureChamber', south: 'dungeonCells', east: 'sewerEntrance' },
        items: [
            items.healingPotion // Hozzáadva
        ],
        npcs: [],
        coords: { x: 8, y: 11 }
    },
    tortureChamber: {
        id: 'tortureChamber',
        name: "Torture Chamber",
        description: "Rusting instruments of pain hang on the walls of this grim chamber. The air is heavy with the lingering scent of fear and old blood. You shudder.",
        exits: { south: 'dungeonLevel1' },
        items: [
            items.bloodyShiv // Hozzáadva
        ],
        npcs: [],
        coords: { x: 8, y: 12 }
    },
    dungeonCells: {
        id: 'dungeonCells',
        name: "Dungeon Cells",
        description: "A series of dank, empty cells with broken iron bars. The ground is littered with moldy straw and skeletal remains. A sense of despair hangs heavy here.",
        exits: { north: 'dungeonLevel1' },
        items: [
            items.goldCoin // Hozzáadva
        ],
        npcs: [],
        puzzle: { // Ezt a puzzle objektumot is logikával kell majd kezelni
            type: 'hiddenMessage',
            message: 'In a desperate attempt to escape, someone carved "BEWARE THE LIBRARIAN\'S SECRET" into the cell wall.',
            hint: 'Look closely at the walls.',
            condition: (player) => true
        },
        coords: { x: 9, y: 11 }
    },
    sewerEntrance: {
        id: 'sewerEntrance',
        name: "Sewer Entrance",
        description: "A narrow, grimy tunnel leads into the castle's sewer system. The stench of stagnant water is overwhelming, and you hear the scuttling of unseen creatures.",
        exits: { west: 'dungeonLevel1', east: 'sewerJunction' },
        items: [],
        npcs: [],
        coords: { x: 7, y: 11 }
    },
    sewerJunction: {
        id: 'sewerJunction',
        name: "Sewer Junction",
        description: "The sewer branches here. Murky water flows sluggishly around your feet. The air is thick and cloying. There are multiple tunnels leading off.",
        exits: { west: 'sewerEntrance', north: 'sewerPipe', south: 'undercroft' },
        items: [],
        npcs: [],
        coords: { x: 7, y: 12 }
    },
    sewerPipe: {
        id: 'sewerPipe',
        name: "Sewer Pipe",
        description: "A very narrow pipe, barely wide enough to crawl through. The darkness is absolute, and the sound of dripping water is constant.",
        exits: { south: 'sewerJunction' },
        items: [],
        npcs: [],
        coords: { x: 7, y: 13 }
    },
    undercroft: {
        id: 'undercroft',
        name: "The Undercroft",
        description: "A surprisingly dry, spacious chamber beneath the castle, far from the sewers. Ancient stone sarcophagi line the walls. A powerful, unsettling aura emanates from a large, sealed vault door.",
        exits: { north: 'sewerJunction' },
        items: [
            items.goldCoin // Hozzáadva
        ],
        npcs: [],
        vault: { // Ezt a vault objektumot is logikával kell majd kezelni
            locked: true,
            hint: "The vault door has a complex locking mechanism, possibly requiring an ornate handle.",
            unlockItem: items.ornateHandle,
            destination: 'treasureVault'
        },
        coords: { x: 6, y: 12 }
    },
    treasureVault: {
        id: 'treasureVault',
        name: "Treasure Vault",
        description: "Beyond the vault door, you find a small, glimmering chamber. Piles of gold, jewels, and ancient artifacts are stacked haphazardly. This must be the castle's hidden treasure!",
        exits: { north: 'undercroft' },
        items: [
            items.goldCoin, items.goldCoin, items.goldCoin, // Hozzáadva
            items.ancientScroll, // Hozzáadva
            items.gemstoneAmulet, // Hozzáadva
            items.masterworkSword // Hozzáadva
        ],
        npcs: [],
        coords: { x: 6, y: 13 }
    },
    gameOver_flee: {
        id: 'gameOver_flee',
        name: "The Escape",
        description: "You turn your back on the mysterious castle. The thrill of adventure fades, and the volcano's heat slowly disappears behind you. You begin your journey home, and the Castle Of Dred remains nothing but a distant memory. Your adventure has ended.",
        exits: {}, // No exits, game over
        items: [],
        npcs: [],
        coords: { x: 5, y: 11 }
    }
};

// --- Játék Inicializálás és Fő Logika ---

// Üzenet megjelenítése a konzolon
function displayMessage(message, isError = false, isHeader = false) {
    const p = document.createElement('p');
    p.textContent = message;
    if (isError) {
        p.classList.add('error');
    }
    if (isHeader) {
        p.classList.add('header');
    }
    gameTextOutput.appendChild(p);
    gameTextOutput.scrollTop = gameTextOutput.scrollHeight; // Görgetés le az új üzenetre
}

// Játékos státuszának megjelenítése
function displayPlayerStatus() {
    displayMessage("\n--- Player Status ---", false, true);
    displayMessage(`Name: ${player.name} (${player.class})`);
    displayMessage(`Health: ${player.health}/${player.maxHealth}`);
    displayMessage(`Mana: ${player.mana}/${player.maxMana}`);
    displayMessage(`Attack: ${player.attack + (player.equipped.weapon ? player.equipped.weapon.attackBonus : 0)} (Base: ${player.attack}, Weapon: ${player.equipped.weapon ? player.equipped.weapon.name : 'None'})`);
    displayMessage(`Defense: ${player.defense + (player.equipped.armor ? player.equipped.armor.defenseBonus : 0)} (Base: ${player.defense}, Armor: ${player.equipped.armor ? player.equipped.armor.name : 'None'})`);
    displayMessage(`Gold: ${player.gold}`);
    displayMessage(`Level: ${player.level} (XP: ${player.xp}/${player.level * 50})`);
    displayMessage("---------------------");
}

// Szoba renderelése (megjelenítése)
function renderRoom() {
    const currentRoom = rooms[player.location];
    player.exploredRooms.add(player.location); // Jelöljük a szobát felfedezettként

    displayMessage(`\n--- ${currentRoom.name} ---`, false, true);
    displayMessage(currentRoom.description);

    // Tárgyak
    if (currentRoom.items && currentRoom.items.length > 0) {
        displayMessage("You see:");
        currentRoom.items.forEach(item => {
            displayMessage(`- ${item.name}`);
        });
    }

    // NPC-k
    if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        displayMessage("You also see:");
        currentRoom.npcs.forEach(npc => {
            displayMessage(`- ${npc.name}`);
        });
    }

    // Kijáratok
    const exits = Object.keys(currentRoom.exits);
    if (exits.length > 0) {
        displayMessage(`Exits: ${exits.join(', ')}`);
    }

    // Harc esélye
    if (currentRoom.enemySpawnChance && currentRoom.enemies && currentRoom.enemies.length > 0) {
        const roll = Math.random() * 100;
        if (roll < currentRoom.enemySpawnChance) {
            const availableEnemyIds = Object.keys(enemies).filter(id => id !== 'mimic'); // A mimic nem spawnol véletlenszerűen
            const randomEnemyId = availableEnemyIds[Math.floor(Math.random() * availableEnemyIds.length)];
            startCombat(randomEnemyId);
            return; // Combat starts, no further room rendering until it ends
        }
    }

    // Trigger onEnter event for the room
    if (currentRoom.events && currentRoom.events.onEnter) {
        currentRoom.events.onEnter(player);
    }
}

// Parancsok feldolgozása
function processCommand() {
    const command = commandInput.value.toLowerCase().trim();
    displayMessage(`> ${command}`);
    commandInput.value = '';

    if (player.isInCombat) {
        handleCombatCommand(command);
        return;
    }

    const parts = command.split(' ');
    const action = parts[0];
    const target = parts.slice(1).join(' '); // Cél (pl. "north", "rusty sword")
    const indirectTarget = parts.slice(3).join(' '); // Pl. "to merchant" esetén "merchant"

    switch (action) {
        case 'go':
            movePlayer(target);
            break;
        case 'look':
            renderRoom();
            break;
        case 'take':
            takeItem(target);
            break;
        case 'inventory':
        case 'inv':
            displayInventory();
            break;
        case 'use':
            useItem(target);
            break;
        case 'equip':
            equipItem(target);
            break;
        case 'status':
            displayPlayerStatus();
            break;
        case 'map':
            displayMap();
            break;
        case 'help':
            displayMessage("\n--- Available Commands ---", false, true);
            displayMessage("go [direction] (e.g., go north, go east) - Move in a specific direction.");
            displayMessage("look - Look around the current room for details.");
            displayMessage("take [item] - Pick up an item.");
            displayMessage("use [item] - Use an item from your inventory (e.g., healing potion).");
            displayMessage("inspect [item/object/npc] - Get more details about an item, object, or character.");
            displayMessage("talk [NPC] - Talk to a non-player character.");
            displayMessage("sell [item] to [NPC] - Sell an item from your inventory to an NPC.");
            displayMessage("attack - Attack an enemy (only in combat).");
            displayMessage("flee - Attempt to escape combat (only in combat).");
            displayMessage("inventory (or inv) - Open your inventory.");
            displayMessage("equip [item] - Equip a weapon or armor.");
            displayMessage("save - Save your current game progress.");
            displayMessage("load - Load a previously saved game.");
            displayMessage("tips - Get a hint (costs gold or health).");
            displayMessage("map - View the map of explored areas.");
            displayMessage("status - Check your character's current stats.");
            displayMessage("help - Display this list of commands.");
            displayMessage("reset - Restart the game from the character creation screen (requires confirmation).");
            displayMessage("--------------------------");
            break;
        case 'talk':
            talkToNPC(target);
            break;
        case 'inspect':
            inspectObject(target);
            break;
        case 'save':
            saveGame();
            break;
        case 'load':
            loadGame();
            break;
        case 'reset':
            resetGameConfirmation();
            break;
        case 'sell':
            // Parancs formátum: sell [item] to [npc]
            if (parts[2] === 'to' && parts.length >= 4) {
                const itemToSell = parts.slice(1, 2).join(' '); // Pl. "rusty sword"
                const npcName = parts.slice(3).join(' '); // Pl. "merchant"
                sellItemToNPC(itemToSell, npcName);
            } else {
                displayMessage("Invalid sell command format. Use: 'sell [item] to [NPC]'.");
            }
            break;
        case 'tips':
            getHint();
            break;
        case '1991rusty': // Cheat kód
            if (target.includes("sword")) {
                player.inventory.push(items["rustySword"]); // Javítva: items.rustySword
                displayMessage("A rusty sword magically appears in your inventory!");
            } else if (target.includes("gold")) {
                player.gold += 100;
                displayMessage("You gained 100 gold!");
            } else if (target.includes("heal")) {
                player.health = player.maxHealth;
                displayMessage("Your health has been fully restored!");
            } else if (target.includes("mana")) { // Mana cheat
                player.mana = player.maxMana;
                displayMessage("Your mana has been fully restored!");
            }
            displayPlayerStatus();
            break;
        default:
            displayMessage("Invalid command. Type 'help' for a list of commands.");
            break;
    }
}

// Játékos mozgatása
function movePlayer(direction) {
    const currentRoom = rooms[player.location];
    const newLocationId = currentRoom.exits[direction];

    if (newLocationId) {
        // --- KEZDŐ SZOBÁRA VONATKOZÓ LOGIKA ÉS HÍD SZAKADÁSA ---
        if (player.location === "lavaBridge") {
            if (direction === "south") {
                // Ha délre megy a lávahídról, vége a játéknak
                player.location = newLocationId; // Áthelyezzük a gameOver_flee-re
                renderRoom(); // Megjelenítjük a végső szobát
                displayMessage("\n--- GAME OVER ---", false, true);
                displayMessage("You decided to leave the mysterious castle behind. Your adventure ends here. LOL...fearful...");
                commandInput.disabled = true; // Letiltjuk a parancsbevitelt
                submitCommandButton.disabled = true;
                return; // Nem folytatódik a normál mozgás
            } else if (direction === "north" && !lavaBridgeBroken) {
                // Ha északra megy a lávahídról, és a híd még nem szakadt le
                displayMessage("As you step onto the Castle Entrance, the ancient iron bridge behind you groans loudly and collapses into the searing lava below, cutting off your retreat!");
                lavaBridgeBroken = true;
                // Eltávolítjuk a "south" kijáratot a castleEntrance szobából (ha volt)
                delete rooms["castleEntrance"].exits.south;
                // Eltávolítjuk a lavaBridge-ből az északi kijáratot is, hogy ne mehessen oda vissza
                delete rooms["lavaBridge"].exits.north;
            }
        }
        // --- VÉGE A KEZDŐ SZOBÁRA VONATKOZÓ LOGIKÁNAK ---

        // Zárolt ajtók kezelése (példa)
        if (currentRoom.door && currentRoom.exits[direction] === 'throneRoom' && currentRoom.door.locked) {
            displayMessage(currentRoom.door.message);
            return;
        }
        if (currentRoom.vault && currentRoom.exits[direction] === 'treasureVault' && currentRoom.vault.locked) {
            displayMessage(currentRoom.vault.hint);
            return;
        }

        player.location = newLocationId;
        displayMessage(`You go ${direction}.`);
        renderRoom();
        playerAttackedInTurn = false; // Reset attack status for new room
    } else {
        displayMessage("You can't go that way.");
    }
}

// Tárgy felvétele
function takeItem(itemName) {
    const currentRoom = rooms[player.location];
    const itemIndex = currentRoom.items.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex !== -1) {
        const item = currentRoom.items[itemIndex];

        // --- ARANYÉRMÉK SPECIÁLIS KEZELÉSE ---
        if (item.id === "goldCoin") {
            player.gold += item.value;
            displayMessage(`You picked up ${item.value} gold.`);
            currentRoom.items.splice(itemIndex, 1);
            displayPlayerStatus();
            return;
        }
        // --- ARANYÉRMÉK SPECIÁLIS KEZELÉS VÉGE ---

        // Mimic Chest kezelése (ha a "chest" vagy "láda" szót használja a játékos)
        if (currentRoom.mimicChest && item.id === "tomeOfLostHistories" && !currentRoom.mimicChest.isRevealed) {
             displayMessage(`As you reach for the ${item.name} inside the dusty chest, the chest suddenly springs to life, revealing a terrifying mouth! It's a MIMIC!`);
             currentRoom.mimicChest.isRevealed = true;
             startCombat(currentRoom.mimicChest.enemyId);
             // NE vedd fel az itemet, mert a mimic "védelmezi"
             return;
         }


        player.inventory.push(item);
        currentRoom.items.splice(itemIndex, 1);
        displayMessage(`You picked up the ${item.name}.`);
        displayPlayerStatus();
    } else {
        displayMessage(`There's no ${itemName} here.`);
    }
}

// Inventory megjelenítése
function displayInventory() {
    displayMessage("\n--- Your Inventory ---", false, true);
    if (player.inventory.length === 0) {
        displayMessage("Your inventory is empty.");
    } else {
        player.inventory.forEach(item => {
            let equippedStatus = "";
            if (player.equipped.weapon && player.equipped.weapon.id === item.id) {
                equippedStatus = " (Equipped Weapon)";
            } else if (player.equipped.armor && player.equipped.armor.id === item.id) {
                equippedStatus = " (Equipped Armor)";
            }
            displayMessage(`- ${item.name} (${item.type})${equippedStatus}`);
        });
    }
    displayMessage("----------------------");
}

// Tárgy használata (consumable)
function useItem(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase() && item.type === "consumable");

    if (itemIndex !== -1) {
        const item = player.inventory[itemIndex];
        if (item.effect === "heal") {
            player.health = Math.min(player.maxHealth, player.health + item.value);
            displayMessage(`You used the ${item.name} and restored ${item.value} health.`);
        } else if (item.effect === "mana") {
            player.mana = Math.min(player.maxMana, player.mana + item.value);
            displayMessage(`You used the ${item.name} and restored ${item.value} mana.`);
        }
        player.inventory.splice(itemIndex, 1); // Eltávolítja a használt tárgyat
        displayPlayerStatus();
    } else {
        displayMessage(`You don't have a consumable item called "${itemName}".`);
    }
}

// Tárgy felszerelése (weapon/armor)
function equipItem(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase() && (item.type === "weapon" || item.type === "armor"));

    if (itemIndex !== -1) {
        const item = player.inventory[itemIndex];
        let oldEquippedItem = null;

        if (item.type === "weapon") {
            if (player.equipped.weapon) {
                oldEquippedItem = player.equipped.weapon;
                player.inventory.push(oldEquippedItem); // Vissza az inventoryba
                displayMessage(`You unequipped your ${oldEquippedItem.name}.`);
            }
            player.equipped.weapon = item;
            displayMessage(`You equipped the ${item.name}. Attack bonus: +${item.attackBonus}.`);
        } else if (item.type === "armor") {
            if (player.equipped.armor) {
                oldEquippedItem = player.equipped.armor;
                player.inventory.push(oldEquippedItem); // Vissza az inventoryba
                displayMessage(`You unequipped your ${oldEquippedItem.name}.`);
            }
            player.equipped.armor = item;
            displayMessage(`You equipped the ${item.name}. Defense bonus: +${item.defenseBonus}.`);
        }
        player.inventory.splice(itemIndex, 1); // Eltávolítja az inventoryból
        displayPlayerStatus();
    } else {
        displayMessage(`You don't have an equipable item called "${itemName}".`);
    }
}

// Objektumok vizsgálata
function inspectObject(targetName) {
    const currentRoom = rooms[player.location];

    // Ellenőrzi a szobában lévő tárgyakat
    const foundItem = currentRoom.items.find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (foundItem) {
        displayMessage(`You inspect the ${foundItem.name}: ${foundItem.description}`);
        return;
    }

    // Ellenőrzi a játékos inventoryjában lévő tárgyakat
    const foundInventoryItem = player.inventory.find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (foundInventoryItem) {
        displayMessage(`You inspect the ${foundInventoryItem.name} in your inventory: ${foundInventoryItem.description}`);
        return;
    }

    // Ellenőrzi a szobában lévő NPC-ket
    const foundNPC = currentRoom.npcs.find(n => n.name.toLowerCase() === targetName.toLowerCase());
    if (foundNPC) {
        displayMessage(`You inspect ${foundNPC.name}: ${foundNPC.description}`);
        return;
    }

    // Ellenőrzi az ellenfelet, ha harcban van
    if (player.isInCombat && currentEnemy && currentEnemy.name.toLowerCase() === targetName.toLowerCase()) {
        displayMessage(`You inspect the ${currentEnemy.name}: ${currentEnemy.description}`);
        return;
    }

    // Ellenőrzi a szobában lévő speciális objektumokat (chest, trapdoor, secretPassage, door, vault, puzzle)
    if (currentRoom.chest && targetName.toLowerCase().includes("chest")) {
        if (currentRoom.chest.isOpen) {
            displayMessage("The chest is open. It's empty now.");
        } else {
            displayMessage("You inspect the chest. It looks sturdy and closed.");
            displayMessage("Perhaps you can 'open chest' or 'take loot from chest'?");
        }
        return;
    }
    if (currentRoom.mimicChest && targetName.toLowerCase().includes("chest")) { // Mimic chest
        if (currentRoom.mimicChest.isRevealed) {
            displayMessage("It's the Mimic! Its fangs glisten, ready for another fight.");
        } else {
            displayMessage("You inspect the dusty chest. It looks like a normal chest, but there's something... off about it. A faint, irregular pulsation can be felt.");
        }
        return;
    }
    if (currentRoom.trapdoor && targetName.toLowerCase().includes("trapdoor")) {
        displayMessage("You inspect the trapdoor. It appears to be rusty.");
        if (currentRoom.trapdoor.locked) {
            displayMessage("It's stuck tight. Perhaps some oil would help?");
        }
        return;
    }
    if (currentRoom.secretPassage && targetName.toLowerCase().includes("fireplace")) {
        displayMessage(currentRoom.secretPassage.hint);
        // Itt kellene triggerelni a kinyitást, pl. "use" paranccsal
        return;
    }
    if (currentRoom.door && targetName.toLowerCase().includes("door")) {
        displayMessage("You inspect the door. " + currentRoom.door.message);
        return;
    }
    if (currentRoom.vault && targetName.toLowerCase().includes("vault")) {
        displayMessage("You inspect the vault door. " + currentRoom.vault.hint);
        return;
    }
    if (currentRoom.puzzle && targetName.toLowerCase().includes("walls") && currentRoom.id === "dungeonCells") { // Példa a DungeonCells-re
        displayMessage(currentRoom.puzzle.message);
        return;
    }

    displayMessage(`You don't see or have "${targetName}" to inspect.`);
}

function talkToNPC(npcName) {
    const currentRoom = rooms[player.location];
    const npc = currentRoom.npcs.find(n => n.name.toLowerCase() === npcName.toLowerCase());

    if (npc) {
        displayMessage(`${npc.name}: "${npc.dialogue}"`);
        // Librarian quest logika
        if (npc.id === "librarian" && player.hasKey(npc.questItemNeeded) && !player.librarianQuestCompleted) {
            displayMessage(`${npc.name}: "Ah, you found the ${items[npc.questItemNeeded].name}! Excellent! Here, take this old key. It might open something important."`);
            player.inventory = player.inventory.filter(item => item.id !== npc.questItemNeeded); // Eltávolítja a quest tárgyat
            player.inventory.push(npc.reward); // Hozzáadja a jutalmat
            player.librarianQuestCompleted = true; // Jelöli, hogy a küldetés teljesült
            displayMessage(`You received a ${npc.reward.name}.`);
        } else if (npc.id === "librarian" && player.librarianQuestCompleted) {
            displayMessage(`${npc.name}: "Thank you again for the Tome. I have nothing further to discuss."`);
        }
    } else {
        displayMessage(`There's no one named "${npcName}" here to talk to.`);
    }
}

// Tárgy eladása NPC-nek
function sellItemToNPC(itemName, npcName) {
    const currentRoom = rooms[player.location];
    const npc = currentRoom.npcs.find(n => n.name.toLowerCase() === npcName.toLowerCase());

    if (!npc) {
        displayMessage(`There's no one named "${npcName}" here.`);
        return;
    }

    if (!npc.buys || Object.keys(npc.buys).length === 0) {
        displayMessage(`${npc.name} is not interested in buying anything.`);
        return;
    }

    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex === -1) {
        displayMessage(`You don't have "${itemName}" in your inventory.`);
        return;
    }

    const itemToSell = player.inventory[itemIndex];
    const itemBuyMultiplier = npc.buys[itemToSell.type];

    if (itemBuyMultiplier === undefined) {
        displayMessage(`${npc.name} is not interested in buying ${itemToSell.name}.`);
        return;
    }

    // Számítsuk ki az eladási árat. Alapértelmezett érték, ha nincs 'value' a tárgyon.
    // Használhatunk egy alapértéket a típus alapján, vagy egy `sellValue` tulajdonságot a tárgyakon.
    // Most az `item.value` vagy `item.attackBonus`/`item.defenseBonus` alapján számolunk példaként.
    let baseValue = itemToSell.value || 0;
    if (itemToSell.type === "weapon") baseValue = itemToSell.attackBonus * 2; // Példa
    if (itemToSell.type === "armor") baseValue = itemToSell.defenseBonus * 3; // Példa
    if (itemToSell.type === "consumable") baseValue = itemToSell.value / 2; // Példa

    const sellPrice = Math.floor(baseValue * itemBuyMultiplier);

    if (sellPrice <= 0) {
        displayMessage(`${itemToSell.name} has no value to ${npc.name}.`);
        return;
    }

    player.gold += sellPrice;
    player.inventory.splice(itemIndex, 1);
    displayMessage(`You sold the ${itemToSell.name} to ${npc.name} for ${sellPrice} gold.`);
    displayPlayerStatus();
}


// Harc indítása
function startCombat(enemyId) {
    currentEnemy = { ...enemies[enemyId] }; // Klónozzuk az ellenfelet, hogy a HP változások ne az alap definíciót módosítsák
    player.isInCombat = true;
    displayMessage(`\n--- COMBAT STARTED ---`, false, true);
    displayMessage(`A ${currentEnemy.name} appears! ${currentEnemy.description}`);
    displayMessage(`Type 'attack' to fight, or 'flee' to attempt to escape.`);
    playerAttackedInTurn = false;
}

// Harc parancsok kezelése
function handleCombatCommand(command) {
    if (playerAttackedInTurn && command !== 'flee') {
        displayMessage("You can only perform one action per turn during combat. Type 'flee' or wait for the enemy's turn.");
        return;
    }

    switch (command) {
        case 'attack':
            playerAttack();
            playerAttackedInTurn = true;
            break;
        case 'flee':
            attemptFlee();
            break;
        case 'status':
            displayPlayerStatus();
            break;
        case 'use': // Harc közbeni tárgyhasználat
            const parts = command.split(' ');
            if (parts.length > 1) {
                useItem(parts.slice(1).join(' '));
            } else {
                displayMessage("What do you want to use?");
            }
            playerAttackedInTurn = true; // A tárgyhasználat is akciónak számít
            break;
        default:
            displayMessage("Invalid combat command. Type 'attack', 'use [item]', or 'flee'.");
            break;
    }

    // Ha a játékos cselekedett (támadott vagy használt valamit), akkor jön az ellenfél köre
    // De csak akkor, ha a harc még tart, és a játékos nem futott el
    if (player.isInCombat && playerAttackedInTurn && command !== 'flee') {
        setTimeout(enemyAttack, 1000); // Késleltetjük az ellenfél támadását
    }
}

// Játékos támadása
function playerAttack() {
    if (!player.isInCombat || !currentEnemy) {
        return;
    }

    const playerTotalAttack = player.attack + (player.equipped.weapon ? player.equipped.weapon.attackBonus : 0);
    // Véletlenszerűség a sebzésben: -2 és +2 között ingadozik
    let damage = Math.max(0, playerTotalAttack - currentEnemy.defense + Math.floor(Math.random() * 5) - 2);

    // Minimum 1 sebzés, ha a támadás erősebb a védekezésnél, de a randomizer miatt 0 lett
    if (damage <= 0 && playerTotalAttack > currentEnemy.defense) {
        damage = 1;
    } else if (damage <= 0 && playerTotalAttack <= currentEnemy.defense) {
        // Ha gyengébb a támadás, akkor nagyon kicsi, de mégis lehetséges sebzés
        damage = Math.max(0, Math.floor(Math.random() * 2));
    }

    currentEnemy.health -= damage;
    displayMessage(`You attack the ${currentEnemy.name} for ${damage} damage!`);

    if (currentEnemy.health <= 0) {
        displayMessage(`${currentEnemy.name} defeated! You gained ${currentEnemy.xpReward} XP and ${currentEnemy.goldReward} gold.`);
        player.xp += currentEnemy.xpReward;
        player.gold += currentEnemy.goldReward;
        dropEnemyLoot(currentEnemy);
        endCombat();
        checkLevelUp();
    } else {
        displayMessage(`${currentEnemy.name} HP: ${currentEnemy.health}/${currentEnemy.maxHealth}`);
    }
}

// Ellenfél támadása
function enemyAttack() {
    if (!player.isInCombat || !currentEnemy) {
        return;
    }

    const playerTotalDefense = player.defense + (player.equipped.armor ? player.equipped.armor.defenseBonus : 0);
    // Véletlenszerűség a sebzésben: -2 és +2 között ingadozik
    let damage = Math.max(0, currentEnemy.attack - playerTotalDefense + Math.floor(Math.random() * 5) - 2);

    // Minimum 1 sebzés, ha a támadás erősebb a védekezésnél, de a randomizer miatt 0 lett
    if (damage <= 0 && currentEnemy.attack > playerTotalDefense) {
        damage = 1;
    } else if (damage <= 0 && currentEnemy.attack <= playerTotalDefense) {
        // Ha gyengébb a támadás, akkor nagyon kicsi, de mégis lehetséges sebzés
        damage = Math.max(0, Math.floor(Math.random() * 2));
    }

    player.health -= damage;
    displayMessage(`${currentEnemy.name} attacks you for ${damage} damage!`);

    if (player.health <= 0) {
        displayMessage("You have been defeated! Game Over.");
        endCombat();
        setTimeout(() => {
            alert("Game Over!");
            resetGame(); // Játék resetelése
        }, 1000);
    } else {
        displayMessage(`Your HP: ${player.health}/${player.maxHealth}`);
        playerAttackedInTurn = false; // Lehetővé teszi a játékosnak, hogy újra cselekedjen
    }
}

// Menekülés kísérlete
function attemptFlee() {
    let fleeChance = 40;
    if (player.class === "rogue") {
        fleeChance += 20;
    }

    if (Math.random() * 100 < fleeChance) {
        displayMessage("You successfully fled from combat!");
        endCombat();
        renderRoom(); // Újra rendereli a szobát, miután elmenekült
    } else {
        displayMessage("You failed to flee!");
        playerAttackedInTurn = true; // Kudarckor az ellenfél támadhat még
        setTimeout(enemyAttack, 1000); // Az ellenfél támadása, ha nem sikerült a menekülés
    }
}

// Harc vége
function endCombat() {
    player.isInCombat = false;
    currentEnemy = null;
    displayMessage("\n--- COMBAT ENDED ---");
    displayPlayerStatus(); // Frissíti a státuszt harc után
}

// XP és szintlépés
function checkLevelUp() {
    const xpNeededForNextLevel = player.level * 50;
    if (player.xp >= xpNeededForNextLevel) {
        player.level++;
        player.maxHealth += 10;
        player.health = player.maxHealth; // Teljesen gyógyul szintlépéskor
        player.maxMana += 5;
        player.mana = player.maxMana; // Teljesen feltöltődik a mana szintlépéskor
        player.attack += 2;
        player.defense += 1;
        displayMessage(`\n*** CONGRATULATIONS! You reached Level ${player.level}! ***`, false, true);
        displayMessage(`Your stats have increased!`);
        displayPlayerStatus();
    }
}

// Ellenféltől loot dobása
function dropEnemyLoot(defeatedEnemy) {
    if (defeatedEnemy.drops && defeatedEnemy.drops.length > 0) {
        defeatedEnemy.drops.forEach(drop => {
            if (Math.random() * 100 < drop.chance) {
                // Ha az elejtett tárgy aranyérme és van értéke, adjuk hozzá közvetlenül az aranyhoz
                if (drop.id === "goldCoin" && drop.value) {
                    player.gold += drop.value;
                    displayMessage(`The ${defeatedEnemy.name} dropped ${drop.value} gold!`);
                } else {
                    // Máskülönben a szobába kerül a tárgy
                    const droppedItem = { ...items[drop.id] }; // Fontos, hogy másolat legyen
                    rooms[player.location].items.push(droppedItem);
                    displayMessage(`The ${defeatedEnemy.name} dropped a ${droppedItem.name}!`);
                }
            }
        });
    }
}

// Térkép megjelenítése
function displayMap() {
    const allCoords = [];
    for (const roomId in rooms) {
        if (rooms.hasOwnProperty(roomId) && rooms[roomId].coords) {
            allCoords.push(rooms[roomId].coords);
        }
    }

    if (allCoords.length === 0) {
        displayMessage("No map data available.");
        return;
    }

    const minX = Math.min(...allCoords.map(c => c.x));
    const maxX = Math.max(...allCoords.map(c => c.x));
    const minY = Math.min(...allCoords.map(c => c.y));
    const maxY = Math.max(...allCoords.map(c => c.y));

    let mapString = "\n--- Castle Map ---\n";

    for (let y = minY; y <= maxY; y++) { // Iterate from top (minY) to bottom (maxY) based on given coords
        let row = "";
        for (let x = minX; x <= maxX; x++) {
            let roomSymbol = "     "; // Default empty space
            let roomFound = false;
            for (const roomId in rooms) {
                if (rooms.hasOwnProperty(roomId) && rooms[roomId].coords) {
                    const room = rooms[roomId];
                    if (room.coords.x === x && room.coords.y === y) {
                        if (player.location === roomId) {
                            roomSymbol = " [P] "; // Player's current location
                        } else if (player.exploredRooms.has(roomId)) {
                            roomSymbol = " [X] "; // Explored room
                        } else {
                            roomSymbol = " [?] "; // Unexplored but exists (not revealed on map yet)
                        }
                        roomFound = true;
                        break;
                    }
                }
            }
            row += roomSymbol;
        }
        mapString += row + "\n";
    }
    mapString += "------------------\n";
    mapString += "[P] = Your position, [X] = Explored Room\n"; // Removed [?] because it's confusing if not all rooms are on the map
    displayMessage(mapString);
}

// Tipp adása
function getHint() {
    const hintCostGold = 5;
    const hintCostHealth = 5;

    if (player.gold >= hintCostGold) {
        player.gold -= hintCostGold;
        displayMessage(`You paid ${hintCostGold} gold for a tip.`);
        displayMessage("Tip: Try to inspect objects and talk to NPCs in rooms for clues!");
        displayPlayerStatus();
    } else if (player.health > hintCostHealth) {
        player.health -= hintCostHealth;
        displayMessage(`You felt a momentary weakness, losing ${hintCostHealth} health for a tip.`);
        displayMessage("Tip: Pay attention to room descriptions; they often hide secrets!");
        displayPlayerStatus();
    } else {
        displayMessage("You don't have enough gold or health to get a tip right now.");
    }
}


// Mentés és Betöltés
function saveGame() {
    try {
        const gameData = {
            player: { // Mentsük el a player összes alapvető tulajdonságát
                name: player.name,
                class: player.class,
                health: player.health,
                maxHealth: player.maxHealth,
                mana: player.mana,
                maxMana: player.maxMana,
                attack: player.attack,
                defense: player.defense,
                gold: player.gold,
                xp: player.xp,
                level: player.level,
                location: player.location,
                inventory: player.inventory,
                equipped: player.equipped,
                isInCombat: player.isInCombat,
                exploredRooms: Array.from(player.exploredRooms), // Set-et tömbbé alakítjuk mentéskor
                librarianQuestCompleted: player.librarianQuestCompleted
            },
            currentEnemy: currentEnemy,
            lavaBridgeBroken: lavaBridgeBroken,
            roomsState: JSON.parse(JSON.stringify(rooms)) // Mély másolat a szobák aktuális állapotáról
        };
        localStorage.setItem('castleOfDredSave', JSON.stringify(gameData));
        displayMessage("Game saved successfully!");
    } catch (e) {
        displayMessage("Error saving game: " + e.message, true);
        console.error("Save game error:", e);
    }
}

function loadGame() {
    try {
        const savedData = localStorage.getItem('castleOfDredSave');
        if (savedData) {
            const gameData = JSON.parse(savedData);

            // Fontos: Az Object.assign használata a player metódusainak megőrzéséhez
            Object.assign(player, initialPlayerState); // Először alapértékekre állítjuk
            Object.assign(player, gameData.player); // Majd felülírjuk a betöltöttekkel
            player.exploredRooms = new Set(gameData.player.exploredRooms || []); // Set visszaállítása, és üres tömb, ha nincs mentve

            currentEnemy = gameData.currentEnemy;
            lavaBridgeBroken = gameData.lavaBridgeBroken;

            // Szobák állapotának visszaállítása (mély másolással)
            for (const roomId in gameData.roomsState) {
                if (rooms.hasOwnProperty(roomId)) {
                    rooms[roomId] = JSON.parse(JSON.stringify(gameData.roomsState[roomId]));
                }
            }

            // Speciális esetek, ha a híd leszakadt, biztosítsuk, hogy az exits is frissüljön
            if (lavaBridgeBroken) {
                delete rooms["castleEntrance"].exits.south;
                delete rooms["lavaBridge"].exits.north;
            }

            displayMessage("Game loaded successfully!");
            charCreationScreen.classList.add('hidden');
            mainMenuScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            renderRoom();
            displayPlayerStatus();
            if (player.location === "gameOver_flee") {
                commandInput.disabled = true;
                submitCommandButton.disabled = true;
            } else {
                commandInput.disabled = false;
                submitCommandButton.disabled = false;
            }

        } else {
            displayMessage("No saved game found.");
        }
    } catch (e) {
        displayMessage("Error loading game: " + e.message, true);
        console.error("Load game error:", e);
    }
}

function resetGameConfirmation() {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
        resetGame();
    }
}

function resetGame() {
    console.log("resetGame() called!");
    localStorage.removeItem('castleOfDredSave'); // Töröljük a mentett játékot

    // Játékos objektum visszaállítása az alapértékekre
    player = { ...initialPlayerState }; // Másolat, hogy a hasKey metódus megmaradjon
    player.exploredRooms = new Set(); // Reseteljük a felfedezett szobákat

    currentEnemy = null;
    lavaBridgeBroken = false;
    gameTextOutput.innerHTML = ''; // Töröljük a konzol kimenetet

    // Szobák állapotának teljes visszaállítása az eredeti definíciókból
    // Ideális esetben lenne egy initialRooms objektum, de most manuálisan tesszük meg a kulcsfontosságúakat
    // Az `rooms` objektumot nem kell felülírni, csak a benne lévő mutatható tulajdonságokat.
    // Deep copy az eredeti rooms definícióból, ha van egy inicializáló függvényed rá.
    // Jelenleg a rooms konstans, így az items tömbök klónozásával kell foglalkozni.

    // Fontos, hogy ha a rooms objektum elemei módosulhattak (pl. itemek eltűntek, exits megváltozott),
    // akkor azokat itt vissza kell állítani az eredeti állapotukba.
    // Ez a legegyszerűbb, ha van egy "gyári" rooms állapotod, amit lemásolhatsz.
    // Mivel a `rooms` konstans, csak a benne lévő *mutable* property-ket kell resetelni.
    // Példa:
    rooms.lavaBridge.exits = { north: 'castleEntrance', south: 'gameOver_flee' };
    rooms.castleEntrance.exits = { north: 'mainHall' }; // Eredetileg nincs 'south' itt
    // Ezeket a sorokat ki kell egészíteni a játékban lévő összes szobával és azok alapértelmezett tárgyaival/NPC-ivel, amik módosulhatnak.
    rooms.diningHall.items = [{...items.goldCoin}];
    rooms.kitchen = { // Példa: ha a kitchen szobát módosítottad
        id: "kitchen",
        name: "Kitchen",
        description: "The castle kitchen is surprisingly intact, though dusty. A large fireplace dominates one wall, and cooking utensils hang from racks.",
        exits: {
            south: 'diningHall' // Vagy ami az eredeti kijárat
        },
        items: [{...items.rustyKnife}],
        npcs: [],
        enemies: [],
        trapdoor: {
            locked: true,
            hint: "This trapdoor looks very old and stiff. It might need something to loosen it."
        }
    };
    rooms.library.items = [{...items.tomeOfLostHistories}];
    rooms.library.mimicChest.isRevealed = false; // Mimic állapotának resetelése
    rooms.library.npcs = [
        {
            id: "librarian",
            name: "Librarian",
            description: "An ancient, hunched figure with spectacles perched on his nose, poring over a delicate scroll.",
            dialogue: "Welcome, seeker of knowledge. I've been searching for the Tome of Lost Histories for ages. Find it for me, and I might reward you.",
            questItemNeeded: "tomeOfLostHistories",
            reward: {...items.rustyKey},
            buys: { "quest": 0.8 },
            sells: []
        }
    ]; // Visszaállítjuk az NPC-ket is, ha eltűnhetnek/változhatnak
    rooms.royalQuarters.items = []; // A ládát majd külön kell kezelni
    if (rooms.royalQuarters.chest) {
        rooms.royalQuarters.chest.isOpen = false;
        rooms.royalQuarters.chest.loot = [{...items.goldCoin}, {...items.gemstoneAmulet}]; // Reseteld a láda tartalmát
    }

    // Ahhoz, hogy az összes szoba visszakerüljön az eredeti állapotába,
    // a `rooms` objektumot egy `initialRooms` konstansból kellene lemásolni.
    // Mivel nincs ilyen, minden szobát, ami a játék során módosulhat, itt explicit vissza kell állítani.
    // Ez a lista nem teljes, bővítened kell az összes érintett szobával!
    // Például:
    // rooms.hiddenCellar.items = [{...items.healingPotion}, {...items.goldCoin}];
    // rooms.armory.items = [{...items.rustySword}, {...items.healingPotion}, {...items.leatherArmor}];
    // rooms.barracks.items = [{...items.goldCoin}, {...items.disguiseKit}];
    // if (rooms.barracks.secretPassage) rooms.barracks.secretPassage.revealed = false;
    // rooms.trainingGrounds.items = [{...items.rustySword}, {...items.manaPotion}];
    // rooms.throneRoomEntrance.door.locked = true;
    // rooms.dungeonLevel1.items = [{...items.healingPotion}];
    // rooms.tortureChamber.items = [{...items.bloodyShiv}];
    // rooms.dungeonCells.items = [{...items.goldCoin}];
    // if (rooms.dungeonCells.puzzle) rooms.dungeonCells.puzzle.solved = false;
    // rooms.undercroft.items = [{...items.goldCoin}];
    // if (rooms.undercroft.vault) rooms.undercroft.vault.locked = true;
    // rooms.treasureVault.items = [{...items.goldCoin}, {...items.goldCoin}, {...items.goldCoin}, {...items.ancientScroll}, {...items.gemstoneAmulet}, {...items.masterworkSword}];


    commandInput.disabled = false;
    submitCommandButton.disabled = false;

    gameScreen.classList.add('hidden');
    storyScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    charCreationScreen.classList.add('hidden'); // Vissza a karakterkreációhoz, ha onnan indul a játék
    mainMenuScreen.classList.remove('hidden'); // Vissza a főmenübe, ha onnan indul a reset

    displayMessage("Game reset. Welcome back to the main menu.");
}


// --- Gomb eseményfigyelők ---

// Main Menu
document.getElementById('new-game-btn').addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    charCreationScreen.classList.remove('hidden');
    displayMessage("Welcome, adventurer! What is your name?");
});

document.getElementById('load-game-btn').addEventListener('click', loadGame);

document.getElementById('story-btn').addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    storyScreen.classList.remove('hidden');
});

document.getElementById('settings-btn').addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
});

// Character Creation
document.getElementById('start-adventure-btn').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value.trim();
    const playerClass = document.querySelector('input[name="player-class"]:checked');

    if (playerName && playerClass) {
        player = { ...initialPlayerState }; // Inicializálás az alapértelmezett állapotból
        player.name = playerName;
        player.class = playerClass.value;
        player.exploredRooms = new Set(); // Biztosítsuk, hogy Set legyen

        charCreationScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        displayMessage(`Welcome, ${player.name} the ${player.class}! Your adventure begins.`);
        renderRoom(); // Az első szoba megjelenítése
        displayPlayerStatus();
    } else {
        alert("Please enter your name and select a class!");
    }
});

// Back buttons
document.querySelectorAll('.back-to-main-menu-btn').forEach(button => {
    button.addEventListener('click', () => {
        storyScreen.classList.add('hidden');
        settingsScreen.classList.add('hidden');
        charCreationScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        mainMenuScreen.classList.remove('hidden');
    });
});


// Command input
submitCommandButton.addEventListener('click', processCommand);
commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processCommand();
    }
});

// --- Játék indítása az első betöltéskor ---
document.addEventListener('DOMContentLoaded', () => {
    mainMenuScreen.classList.remove('hidden');
    charCreationScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    storyScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');

    // Itt kell beállítani a 'coords' tulajdonságot a szobákhoz a térképhez!
    // Példák, ezt ki kell egészíteni az összes szobával!
    rooms.lavaBridge.coords = { x: 0, y: 2 };
    rooms.castleEntrance.coords = { x: 0, y: 1 };
    rooms.mainHall.coords = { x: 0, y: 0 };
    rooms.diningHall.coords = { x: 1, y: 0 };
    rooms.library.coords = { x: -1, y: 0 };
    rooms.hiddenCellar.coords = { x: -1, y: 1 }; // Lehet, hogy y= -1, ha lentebb van
    rooms.grandStaircase.coords = { x: 0, y: -1 };
    rooms.upperLanding.coords = { x: 0, y: -2 };
    rooms.royalQuarters.coords = { x: 1, y: -2 };
    rooms.barracks.coords = { x: -1, y: -2 };
    rooms.armory.coords = { x: -1, y: -3 };
    rooms.trainingGrounds.coords = { x: -2, y: -2 }; // Titkos átjáró
    rooms.throneRoomEntrance.coords = { x: 0, y: -3 };
    rooms.throneRoom.coords = { x: 0, y: -4 };
    rooms.dungeonLevel1.coords = { x: 0, y: 3 }; // Lejárat a főcsarnokból
    rooms.tortureChamber.coords = { x: 1, y: 3 };
    rooms.dungeonCells.coords = { x: 0, y: 4 };
    rooms.undercroft.coords = { x: -1, y: 3 };
    rooms.treasureVault.coords = { x: -1, y: 4 };
    rooms.gameOver_flee.coords = { x: 0, y: 3 }; // Kicsit arrébb, hogy ne fedje a dungeon lejáratot

});