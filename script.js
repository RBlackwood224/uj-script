// script.js

// --- DOM elemek referenciái ---
const mainMenuScreen = document.getElementById('main-menu-screen');
const charCreationScreen = document.getElementById('char-creation-screen');
const gameScreen = document.getElementById('game-screen');
const storyScreen = document.getElementById('story-screen');
const settingsScreen = document.getElementById('settings-screen');

const startGameMenuButton = document.getElementById('start-game-button-menu');
const storyMenuButton = document.getElementById('story-button');
const settingsMenuButton = document.getElementById('settings-button');

const backToMenuButtonStory = document.getElementById('back-to-menu-button-story');
const backToMenuButtonSettings = document.getElementById('back-to-menu-button-settings');

const playerNameInput = document.getElementById('player-name');
const startGameCharCreateButton = document.getElementById('start-game-button-char-create');

// Játék képernyő elemek
const gameTextOutput = document.getElementById('game-text-output');
const commandInput = document.getElementById('command-input');
const submitCommandButton = document.getElementById('submit-command');

// ÚJ: Fix státusz panel elemek
const playerStatusPanel = document.getElementById('player-status-panel');
const statusPanelContent = document.getElementById('status-panel-content');
const statusPanelTitle = document.getElementById('status-panel-title');


// --- Játékállapot változók ---
let player = {};
let currentEnemy = null;
let playerAttackedInTurn = false;
let lavaBridgeBroken = false;
let isShowingInventory = false; // Új állapot a státusz panelhez

// --- Játék adatstruktúrák (ITEMS és NPCS definíciók először, mert a ROOMS hivatkozik rájuk) ---

const items = {
    "small_healing_potion": {
        id: "small_healing_potion",
        name: "small healing potion",
        type: "consumable",
        effect: "heal",
        value: 25,
        description: "A small vial containing a glowing red liquid. Restores a small amount of health."
    },
    "mana_potion": {
        id: "mana_potion",
        name: "mana potion",
        type: "consumable",
        effect: "mana",
        value: 20,
        description: "A blue potion that replenishes your magical energy."
    },
    "rusty_sword": {
        id: "rusty_sword",
        name: "rusty sword",
        type: "weapon",
        attackBonus: 5,
        description: "A simple, rusty sword. Better than nothing."
    },
    "iron_shield": {
        id: "iron_shield",
        name: "iron shield",
        type: "armor",
        defenseBonus: 3,
        description: "A sturdy iron shield. Provides decent protection."
    },
    "rusty_key": {
        id: "rusty_key",
        name: "rusty key",
        type: "key",
        description: "A small, rusty key. It might open something."
    },
    "lucky_charm": {
        id: "lucky_charm",
        name: "lucky charm",
        type: "passive",
        effect: "luck",
        value: 0.05,
        description: "A small, intricately carved wooden charm. You feel slightly luckier when holding it."
    },
    "tomeOfLostHistories": {
        id: "tomeOfLostHistories",
        name: "Tome of Lost Histories",
        type: "quest",
        description: "A heavy, ancient book. The librarian might be interested in this.",
        value: 0
    },
    "rustyKnife": {
        id: "rustyKnife",
        name: "Rusty Knife",
        type: "weapon",
        attackBonus: 2,
        description: "A dull and rusty kitchen knife.",
        value: 1
    },
    "healingPotion": { // Általános healing potion, a small_healing_potion mellett
        id: "healingPotion",
        name: "healing potion",
        type: "consumable",
        effect: "heal",
        value: 50,
        description: "A standard healing potion. Restores a moderate amount of health."
    },
    "disguiseKit": {
        id: "disguiseKit",
        name: "Disguise Kit",
        type: "utility",
        description: "A collection of old clothes, makeup, and wigs. Might help you blend in.",
        value: 0
    },
    "fancyKey": {
        id: "fancyKey",
        name: "Fancy Key",
        type: "key",
        description: "An ornate, intricately designed key. It looks important.",
        value: 0
    },
    "gemstoneAmulet": {
        id: "gemstoneAmulet",
        name: "Gemstone Amulet",
        type: "treasure",
        description: "A beautiful amulet adorned with sparkling gemstones. Highly valuable.",
        value: 150
    },
    "oldKey": {
        id: "oldKey",
        name: "Old Key",
        type: "key",
        description: "A heavy, old iron key, slightly corroded.",
        value: 0
    },
    "bloodyShiv": {
        id: "bloodyShiv",
        name: "Bloody Shiv",
        type: "weapon",
        attackBonus: 8,
        description: "A small, sharp, and very unsettling knife.",
        value: 10
    },
    "ancientScroll": {
        id: "ancientScroll",
        name: "Ancient Scroll",
        type: "quest",
        description: "A fragile, rolled-up scroll covered in arcane symbols. It feels powerful.",
        value: 0
    },
    "masterworkSword": {
        id: "masterworkSword",
        name: "Masterwork Sword",
        type: "weapon",
        attackBonus: 15,
        description: "A perfectly balanced, razor-sharp sword. A true masterpiece.",
        value: 200
    },
    "ornateHandle": {
        id: "ornateHandle",
        name: "Ornate Handle",
        type: "quest",
        description: "A beautifully crafted handle, possibly for a vault door or a mechanism.",
        value: 0
    },
    "oilCan": {
        id: "oilCan",
        name: "Oil Can",
        type: "utility",
        description: "A small can filled with lubricant. Might help with rusty mechanisms.",
        value: 0
    }
};

const npcs = {
    "librarian": {
        id: "librarian",
        name: "Librarian",
        description: "An old, hunched figure, peering over thick spectacles. He seems lost in his books.",
        dialogue: "Welcome, traveler. These archives hold many secrets, if you know where to look... or what to ask for. I'm looking for the Tome of Lost Histories. Have you seen it?",
        questItemNeeded: "tomeOfLostHistories",
        reward: items.oldKey,
        questCompleted: false,
        state: "alive" // NPC állapot kezelése
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
        answers: ["map", "needle", "the future", "an egg"],
        state: "alive"
    },
    "guard": {
        id: "guard",
        name: "Castle Guard",
        description: "A hulking, armored guard. He looks rather bored.",
        dialogue: "Halt! None shall pass without Lord Dred's explicit command!",
        state: "alive"
        // Később: ha van álruhád, akkor átenged
    }
};

const enemies = {
    "goblin": {
        id: "goblin",
        name: "Goblin",
        health: 30,
        maxHealth: 30,
        attack: 8,
        defense: 2,
        xpReward: 10,
        goldReward: 5,
        description: "A small, green-skinned goblin with a rusty dagger.",
        drops: [{ id: "small_healing_potion", chance: 50 }],
        isBoss: false
    },
    "orc": {
        id: "orc",
        name: "Orc",
        health: 50,
        maxHealth: 50,
        attack: 12,
        defense: 5,
        xpReward: 25,
        goldReward: 15,
        description: "A hulking orc wielding a crude axe.",
        drops: [{ id: "iron_shield", chance: 30 }],
        isBoss: false
    },
    "skeleton": {
        id: "skeleton",
        name: "Skeleton",
        health: 40,
        maxHealth: 40,
        attack: 10,
        defense: 3,
        xpReward: 15,
        goldReward: 8,
        description: "The reanimated bones of a fallen warrior, clattering menacingly.",
        drops: [{ id: "rustyKnife", chance: 15 }],
        isBoss: false
    },
    "mimic": {
        id: "mimic",
        name: "Mimic Chest",
        health: 70,
        maxHealth: 70,
        attack: 15,
        defense: 7,
        xpReward: 50,
        goldReward: 30,
        description: "A treasure chest with a terrifyingly large mouth full of jagged teeth!",
        drops: [{ id: "mana_potion", chance: 100 }, { id: "lucky_charm", chance: 50 }],
        isBoss: true
    },
    "evil_wizard_boss": {
        id: "evil_wizard_boss",
        name: "Lord Dred",
        health: 150,
        maxHealth: 150,
        attack: 20,
        defense: 10,
        xpReward: 200,
        goldReward: 100,
        description: "A powerful sorcerer, the tyrannical master of the Castle of Dread.",
        drops: [{ id: "masterworkSword", chance: 100 }, { id: "gemstoneAmulet", chance: 100 }],
        isBoss: true
    }
};

// --- ROOMS ---
const rooms = {
    lavaBridge: {
        id: 'lavaBridge',
        name: "The Lava Bridge",
        description: "Before you, an ancient, rusty iron bridge stretches from the volcano's edge towards a massive, dark stone structure, the **Castle Of Dread**. Below you, incandescent lava bubbles and seethes, radiating a fearsome heat. The air is heavy and sulfurous. The bridge looks rickety, but appears to hold.(The entrance is to the north.)",
        exits: { north: 'castleEntrance', south: 'gameOver_flee' },
        items: [],
        npcs: [],
        coords: { x: 5, y: 10 }
    },
    castleEntrance: {
        id: 'castleEntrance',
        name: "Castle Entrance",
        description: "You stand before the imposing main gates of the **Castle Of Dread**. They are made of dark, weathered wood, reinforced with heavy iron bands, and seem to be slightly ajar. Behind you, the lava bridge has collapsed into the fiery abyss, cutting off any retreat.",
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
        enemySpawnChance: 10,
        enemies: [{ id: "goblin", chance: 100 }],
        coords: { x: 5, y: 8 }
    },
    eastCorridor: {
        id: 'eastCorridor',
        name: "East Corridor",
        description: "A long, dimly lit corridor stretching east. Tapestries depicting forgotten battles hang on the walls, somewhat moth-eaten. The air here is colder.",
        exits: { west: 'mainHall', north: 'library', east: 'diningHall' },
        items: [],
        npcs: [],
        enemySpawnChance: 20,
        enemies: [{ id: "goblin", chance: 100 }],
        coords: { x: 6, y: 8 }
    },
    westCorridor: {
        id: 'westCorridor',
        name: "West Corridor",
        description: "This corridor mirrors the east, though its tapestries show more peaceful, though no less faded, scenes of courtly life. A faint, metallic smell lingers in the air.",
        exits: { east: 'mainHall', north: 'armory', west: 'barracks' },
        items: [],
        npcs: [],
        enemySpawnChance: 20,
        enemies: [{ id: "goblin", chance: 100 }],
        coords: { x: 4, y: 8 }
    },
    grandStaircaseLanding: {
        id: 'grandStaircaseLanding',
        name: "Grand Staircase Landing",
        description: "At the top of the grand staircase, you find a wide landing. A massive, unsettling statue of a winged demon dominates the center. More corridors lead off in different directions.",
        exits: { down: 'mainHall', north: 'throneRoomEntrance', east: 'upperEastCorridor', west: 'upperWestCorridor' },
        items: [],
        npcs: [],
        enemySpawnChance: 15,
        enemies: [{ id: "skeleton", chance: 100 }],
        coords: { x: 5, y: 7 }
    },
    library: {
        id: 'library',
        name: "The Grand Library",
        description: "Thousands of books line the towering shelves of this vast library. The scent of old paper and dust is overwhelming. A lone, hunched figure is poring over a tome at a central desk.",
        exits: { south: 'eastCorridor', east: 'archives' },
        items: [],
        npcs: ["librarian"], // NPC ID
        onEnter: function(playerRef) { // Pass player object as parameter
            // If the Mimic hasn't been defeated in this room yet
            if (!playerRef.hasDefeatedMimicInLibrary) {
                displayMessage("As you step into the library, one of the bookshelves shudders violently! A large, toothy mouth opens in what you thought was just a stack of books! It's a MIMIC!", false, true);
                startCombat("mimic");
                return true; // Indicates an event (combat) was triggered
            }
            return false; // No special event
        },
        coords: { x: 6, y: 7 }
    },
    archives: {
        id: 'archives',
        name: "Castle Archives",
        description: "A labyrinthine collection of scrolls and ancient records, even dustier than the main library. The air is thick with age, and you can barely make out the titles on the highest shelves.",
        exits: { west: 'library' },
        items: [items.tomeOfLostHistories],
        npcs: [],
        puzzle: {
            type: 'hiddenItem',
            itemToFind: 'tomeOfLostHistories',
            hint: 'The most important knowledge is often hidden in plain sight, or at least, on the highest shelf.',
            condition: (player) => player.hasKey("oldKey")
        },
        coords: { x: 7, y: 7 }
    },
    diningHall: {
        id: 'diningHall',
        name: "Dining Hall",
        description: "A grand dining hall with a long, empty table that could seat a hundred. Cobwebs hang from the chandeliers, and broken pottery litters the floor. A faint, unsettling smell lingers.",
        exits: { west: 'eastCorridor', north: 'kitchen' },
        items: [],
        gold: 10,
        npcs: [],
        enemySpawnChance: 25,
        enemies: [{ id: "goblin", chance: 70 }, { id: "skeleton", chance: 30 }],
        coords: { x: 7, y: 8 }
    },
    kitchen: {
        id: 'kitchen',
        name: "Kitchen",
        description: "A large, greasy kitchen. Rusting pots and pans hang from hooks. The air is stale, and faint outlines on the floor suggest where massive ovens once stood. A trapdoor is visible on the floor.",
        exits: { south: 'diningHall', down: 'hiddenCellar' },
        items: [items.rustyKnife],
        npcs: [],
        trapdoor: {
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
        items: [items.healingPotion],
        gold: 5,
        npcs: [],
        enemySpawnChance: 30,
        enemies: [{ id: "skeleton", chance: 100 }],
        coords: { x: 7, y: 10 }
    },
    armory: {
        id: 'armory',
        name: "Armory",
        description: "Rows of empty weapon racks and armor stands line this room, suggesting a once-grand collection of arms. A few rusty pieces remain scattered on the floor.",
        exits: { south: 'westCorridor' },
        items: [items.rustySword, items.healingPotion],
        npcs: [],
        enemySpawnChance: 25,
        enemies: [{ id: "orc", chance: 100 }],
        coords: { x: 4, y: 7 }
    },
    barracks: {
        id: 'barracks',
        name: "Barracks",
        description: "Bunk beds line the walls of this cramped room, now covered in dust. Old, tattered uniforms hang from hooks. The faint smell of mildew and stale sweat fills the air.",
        exits: { east: 'westCorridor' },
        items: [items.disguiseKit],
        gold: 15,
        npcs: [],
        enemySpawnChance: 20,
        enemies: [{ id: "goblin", chance: 80 }, { id: "skeleton", chance: 20 }],
        secretPassage: {
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
        items: [items.rustySword, items.manaPotion],
        npcs: [],
        enemySpawnChance: 30,
        enemies: [{ id: "orc", chance: 60 }, { id: "skeleton", chance: 40 }],
        coords: { x: 3, y: 7 }
    },
    throneRoomEntrance: {
        id: 'throneRoomEntrance',
        name: "Throne Room Entrance",
        description: "A wide, regal hallway leading to what appears to be the main Throne Room. Massive double doors, intricately carved, block the way forward.",
        exits: { south: 'grandStaircaseLanding', north: 'throneRoom' },
        items: [],
        npcs: ["guard"], // NPC ID
        door: {
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
        onEnter: function(playerRef) {
            if (!playerRef.hasDefeatedThroneRoomBoss) {
                displayMessage("As you step into the Throne Room, a shadowy figure coalesces on the obsidian throne! It's Lord Dred, the master of this castle!", false, true);
                startCombat("evil_wizard_boss");
                return true;
            }
            return false;
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
        enemySpawnChance: 30,
        enemies: [{ id: "skeleton", chance: 100 }],
        coords: { x: 6, y: 6 }
    },
    royalQuarters: {
        id: 'royalQuarters',
        name: "Royal Quarters",
        description: "Lavishly decorated, but long abandoned, this room was once clearly a royal bedchamber. Dust covers silk sheets and ornate furniture. A large, locked chest sits at the foot of the bed.",
        exits: { west: 'upperEastCorridor' },
        items: [],
        npcs: [],
        chest: {
            locked: true,
            unlockItem: items.fancyKey,
            loot: [items.gemstoneAmulet, items.manaPotion],
            goldLoot: 50,
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
        enemySpawnChance: 30,
        enemies: [{ id: "orc", chance: 100 }],
        coords: { x: 4, y: 6 }
    },
    servantsQuarters: {
        id: 'servantsQuarters',
        name: "Servants' Quarters",
        description: "Small, utilitarian rooms, tightly packed together. Life here must have been harsh. Scattered belongings suggest a hasty departure.",
        exits: { east: 'upperWestCorridor' },
        items: [items.healingPotion],
        gold: 8,
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
        gate: {
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
        items: [items.healingPotion],
        npcs: [],
        enemySpawnChance: 40,
        enemies: [{ id: "skeleton", chance: 100 }],
        coords: { x: 8, y: 11 }
    },
    tortureChamber: {
        id: 'tortureChamber',
        name: "Torture Chamber",
        description: "Rusting instruments of pain hang on the walls of this grim chamber. The air is heavy with the lingering scent of fear and old blood. You shudder.",
        exits: { south: 'dungeonLevel1' },
        items: [items.bloodyShiv],
        npcs: [],
        enemySpawnChance: 45,
        enemies: [{ id: "skeleton", chance: 80 }, { id: "orc", chance: 20 }],
        coords: { x: 8, y: 12 }
    },
    dungeonCells: {
        id: 'dungeonCells',
        name: "Dungeon Cells",
        description: "A series of dank, empty cells with broken iron bars. The ground is littered with moldy straw and skeletal remains. A sense of despair hangs heavy here.",
        exits: { north: 'dungeonLevel1' },
        items: [],
        gold: 20,
        npcs: [],
        enemySpawnChance: 50,
        enemies: [{ id: "skeleton", chance: 100 }],
        puzzle: {
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
        enemySpawnChance: 35,
        enemies: [{ id: "goblin", chance: 100 }],
        coords: { x: 7, y: 11 }
    },
    sewerJunction: {
        id: 'sewerJunction',
        name: "Sewer Junction",
        description: "The sewer branches here. Murky water flows sluggishly around your feet. The air is thick and cloying. There are multiple tunnels leading off.",
        exits: { west: 'sewerEntrance', north: 'sewerPipe', south: 'undercroft' },
        items: [],
        npcs: [],
        enemySpawnChance: 40,
        enemies: [{ id: "goblin", chance: 70 }, { id: "orc", chance: 30 }],
        coords: { x: 7, y: 12 }
    },
    sewerPipe: {
        id: 'sewerPipe',
        name: "Sewer Pipe",
        description: "A very narrow pipe, barely wide enough to crawl through. The darkness is absolute, and the sound of dripping water is constant.",
        exits: { south: 'sewerJunction' },
        items: [],
        npcs: [],
        enemySpawnChance: 45,
        enemies: [{ id: "goblin", chance: 100 }],
        coords: { x: 7, y: 13 }
    },
    undercroft: {
        id: 'undercroft',
        name: "The Undercroft",
        description: "A surprisingly dry, spacious chamber beneath the castle, far from the sewers. Ancient stone sarcophagi line the walls. A powerful, unsettling aura emanates from a large, sealed vault door.",
        exits: { north: 'sewerJunction' },
        items: [],
        gold: 30,
        npcs: [],
        enemySpawnChance: 30,
        enemies: [{ id: "skeleton", chance: 100 }],
        vault: {
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
        items: [items.ancientScroll, items.gemstoneAmulet, items.masterworkSword],
        gold: 100,
        npcs: [],
        coords: { x: 6, y: 13 }
    },
    gameOver_flee: {
        id: 'gameOver_flee',
        name: "The Escape",
        description: "You turn your back on the mysterious castle. The thrill of adventure fades, and the volcano's heat slowly disappears behind you. You begin your journey home, and the Castle Of Dread remains nothing but a distant memory. Your adventure has ended.",
        exits: {}, // No exits, game over
        items: [],
        npcs: [],
        coords: { x: 5, y: 11 }
    }
};

// IMPORTANT: Store initial states for deep reset
const initialRoomsState = JSON.parse(JSON.stringify(rooms));
const initialNpcsState = JSON.parse(JSON.stringify(npcs));


// --- Eseménykezelők ---

// Menü gombok
startGameMenuButton.addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    charCreationScreen.classList.remove('hidden');
});

storyMenuButton.addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    storyScreen.classList.remove('hidden');
});

settingsMenuButton.addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
});

// Vissza a menübe gombok
backToMenuButtonStory.addEventListener('click', () => {
    storyScreen.classList.add('hidden');
    mainMenuScreen.classList.remove('hidden');
});

backToMenuButtonSettings.addEventListener('click', () => {
    settingsScreen.classList.add('hidden');
    mainMenuScreen.classList.remove('hidden');
});

// Karaktergeneráló gomb
startGameCharCreateButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const playerClass = document.querySelector('input[name="class"]:checked')?.value;

    if (!name || !gender || !playerClass) {
        alert("Please fill in all character details!");
        return;
    }

    createPlayer(name, gender, playerClass);
    charCreationScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
});

// Parancs bevitel
submitCommandButton.addEventListener('click', processCommand);
commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        processCommand();
    }
});

// --- Játéklogika függvények ---

// Üzenet megjelenítése a konzolon
function displayMessage(message, clear = false, isHeader = false) {
    if (clear) {
        gameTextOutput.innerHTML = '';
    }
    const p = document.createElement('p');
    p.textContent = message;
    if (isHeader) {
        p.classList.add('header');
    }
    gameTextOutput.appendChild(p);
    gameTextOutput.scrollTop = gameTextOutput.scrollHeight; // Görgetés az aljára
}

// Játékos státusz és inventory megjelenítése a fix panelen
function updatePlayerStatusPanel() {
    if (!player || !player.name) {
        statusPanelTitle.textContent = "Player Status";
        statusPanelContent.innerHTML = "<p>No player data.</p>";
        return;
    }

    if (isShowingInventory) {
        statusPanelTitle.textContent = "Inventory";
        if (player.inventory.length === 0) {
            statusPanelContent.innerHTML = "<p>Your inventory is empty.</p>";
        } else {
            let invHtml = "";
            player.inventory.forEach(item => {
                invHtml += `<p>- ${item.name} (${item.type})</p>`;
            });
            statusPanelContent.innerHTML = invHtml;
        }
    } else {
        statusPanelTitle.textContent = `${player.name}'s Status`;
        const weaponName = player.equipped.weapon ? player.equipped.weapon.name : 'None';
        const armorName = player.equipped.armor ? player.equipped.armor.name : 'None';
        const totalAttack = player.attack + (player.equipped.weapon ? player.equipped.weapon.attackBonus : 0);
        const totalDefense = player.defense + (player.equipped.armor ? player.equipped.armor.defenseBonus : 0);

        statusPanelContent.innerHTML = `
            <p>Class: ${player.class}</p>
            <p>Gender: ${player.gender}</p>
            <p>Health: ${player.health}/${player.maxHealth}</p>
            <p>Mana: ${player.mana}/${player.maxMana}</p>
            <p>Attack: ${totalAttack} (Base: ${player.attack}, Weapon: ${player.equipped.weapon ? '+' + player.equipped.weapon.attackBonus : '0'})</p>
            <p>Defense: ${totalDefense} (Base: ${player.defense}, Armor: ${player.equipped.armor ? '+' + player.equipped.armor.defenseBonus : '0'})</p>
            <p>Gold: ${player.gold} | XP: ${player.xp}</p>
            <p>Equipped: Weapon: ${weaponName}, Armor: ${armorName}</p>
        `;
    }
}

// Játékos objektum létrehozása
function createPlayer(name, gender, playerClass) {
    player = {
        name: name,
        gender: gender,
        class: playerClass,
        health: 100,
        maxHealth: 100,
        mana: 20,
        maxMana: 20,
        attack: 10,
        defense: 5,
        gold: 10,
        xp: 0,
        level: 1,
        inventory: [],
        equipped: {
            weapon: null,
            armor: null
        },
        location: "lavaBridge", // Játék indításakor a lávahídon kezd!
        isInCombat: false,
        exploredRooms: new Set(), // Felfedezett szobák ID-i
        hasKey: function(keyId) {
            return this.inventory.some(item => item.id === keyId);
        },
        hasDefeatedMimicInLibrary: false,
        hasDefeatedThroneRoomBoss: false,
        isTrappedByEvilNPC: false,
        evilNPCCounter: 0,
        evilNPCQuestions: [],
        evilNPCAnswers: [],
        isDisguised: false
    };

    // Osztályspecifikus statisztikák
    switch (playerClass) {
        case "warrior":
            player.maxHealth = 120;
            player.health = 120;
            player.attack = 15;
            player.defense = 8;
            player.inventory.push(items["rusty_sword"]); // Kezdő fegyver
            player.equipped.weapon = items["rusty_sword"];
            break;
        case "mage":
            player.maxMana = 50;
            player.mana = 50;
            player.attack = 7;
            player.defense = 3;
            // Kezdő varázstárgyak később
            break;
        case "rogue":
            player.attack = 12;
            player.defense = 6;
            // Képességek később: magasabb menekülési esély, dodge
            break;
    }
}

// Játék indítása
function startGame() {
    displayMessage("Welcome, " + player.name + " the " + player.class + "!", true);
    displayMessage("Type 'help' to see available commands.");
    renderRoom();
    updatePlayerStatusPanel(); // Státusz panel frissítése
}

// Szoba megjelenítése
function renderRoom() {
    const currentRoom = rooms[player.location];
    
    player.exploredRooms.add(player.location);

    displayMessage(`\n--- ${currentRoom.name} ---`, false, true);
    displayMessage(currentRoom.description);

    const exits = Object.keys(currentRoom.exits).map(dir => dir.charAt(0).toUpperCase() + dir.slice(1));
    if (exits.length > 0) {
        displayMessage(`Exits: ${exits.join(', ')}.`);
    } else {
        displayMessage("There are no visible exits from here.");
    }

    let itemsInRoom = [];
    if (currentRoom.items && currentRoom.items.length > 0) {
        itemsInRoom = itemsInRoom.concat(currentRoom.items.map(item => item.name));
    }
    if (currentRoom.gold && currentRoom.gold > 0) { // Ha van arany a szobában
        itemsInRoom.push(`${currentRoom.gold} gold`);
    }

    if (itemsInRoom.length > 0) {
        displayMessage(`You see: ${itemsInRoom.join(', ')}.`);
    } else {
        displayMessage("You see no items here.");
    }

    if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        const livingNPCs = currentRoom.npcs.filter(npcId => npcs[npcId] && npcs[npcId].state !== "defeated");
        if (livingNPCs.length > 0) {
            const npcNames = livingNPCs.map(npcId => npcs[npcId].name).join(', ');
            displayMessage(`You see ${npcNames} here.`);
        }
    }

    if (!player.isInCombat) {
        // Trigger onEnter event for the room (pl. Mimic a library-ban)
        if (currentRoom.onEnter && currentRoom.onEnter(player)) { // Pass player object
            return;
        }

        // Random ellenfél spawnolás (ha az onEnter nem indított harcot)
        if (currentRoom.enemySpawnChance && Math.random() * 100 < currentRoom.enemySpawnChance) {
            const possibleEnemies = currentRoom.enemies;
            if (possibleEnemies && possibleEnemies.length > 0) {
                let totalChance = 0;
                possibleEnemies.forEach(e => totalChance += e.chance);
                let randomRoll = Math.random() * totalChance;
                let selectedEnemyId = null;

                for (const enemyDef of possibleEnemies) {
                    if (randomRoll < enemyDef.chance) {
                        selectedEnemyId = enemyDef.id;
                        break;
                    }
                    randomRoll -= enemyDef.chance;
                }

                if (selectedEnemyId) {
                    startCombat(selectedEnemyId);
                    return;
                }
            }
        }
    }

    updatePlayerStatusPanel();
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
    const target = parts.slice(1).join(' ');

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
            toggleInventoryDisplay();
            break;
        case 'use':
            useItem(target);
            break;
        case 'equip':
            equipItem(target);
            break;
        case 'status':
            isShowingInventory = false;
            updatePlayerStatusPanel();
            displayMessage("Displaying player status on the side panel.");
            break;
        case 'map':
            displayMap();
            break;
        case 'help':
            displayMessage("\n--- Available Commands ---", false, true);
            displayMessage("go [direction] (e.g., go north, go east) - Move in a specific direction.");
            displayMessage("look - Look around the current room for details.");
            displayMessage("take [item/gold] - Pick up an item or take gold.");
            displayMessage("use [item] - Use an item from your inventory.");
            displayMessage("inspect [item/object] - Get more details about an item or object.");
            displayMessage("talk [NPC] - Talk to a non-player character.");
            displayMessage("attack - Attack an enemy (only in combat).");
            displayMessage("inventory (or inv) - Toggle your inventory view on the side panel.");
            displayMessage("equip [item] - Equip a weapon or armor.");
            displayMessage("save - Save your current game progress.");
            displayMessage("load - Load a previously saved game.");
            displayMessage("tips - Get a hint (costs gold).");
            displayMessage("map - View the map of explored areas.");
            displayMessage("status - Switch to player status view on the side panel.");
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
        case 'tips':
            handleTips();
            break;
        case '1991rusty': // Cheat code
            if (target.includes("sword")) {
                player.inventory.push(items["rusty_sword"]);
                displayMessage("A rusty sword magically appears in your inventory!");
            } else if (target.includes("gold")) {
                player.gold += 100;
                displayMessage("You gained 100 gold!");
            } else if (target.includes("heal")) {
                player.health = player.maxHealth;
                displayMessage("Your health has been fully restored!");
            }
            updatePlayerStatusPanel();
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
        if (player.location === "lavaBridge") {
            if (direction === "south") {
                player.location = newLocationId;
                renderRoom();
                displayMessage("\n--- GAME OVER ---", false, true);
                displayMessage("You decided to leave the mysterious castle behind. Your adventure ends here. LOL...fearful...");
                commandInput.disabled = true;
                submitCommandButton.disabled = true;
                return;
            } else if (direction === "north" && !lavaBridgeBroken) {
                displayMessage("As you step onto the Castle Entrance, the ancient iron bridge behind you groans loudly and collapses into the searing lava below, cutting off your retreat!");
                lavaBridgeBroken = true;
                if (rooms["castleEntrance"].exits.south) {
                    delete rooms["castleEntrance"].exits.south;
                }
                if (rooms["lavaBridge"].exits.north) {
                    delete rooms["lavaBridge"].exits.north;
                }
            }
        }

        player.location = newLocationId;
        displayMessage(`You go ${direction}.`);
        renderRoom();
        playerAttackedInTurn = false;
    } else {
        displayMessage("You can't go that way.");
    }
}

// Tárgy felvétele
function takeItem(itemName) {
    const currentRoom = rooms[player.location];
    
    if (itemName.toLowerCase().includes("gold")) {
        if (currentRoom.gold && currentRoom.gold > 0) {
            player.gold += currentRoom.gold;
            displayMessage(`You took ${currentRoom.gold} gold from the room.`);
            currentRoom.gold = 0;
            updatePlayerStatusPanel();
            return;
        } else {
            displayMessage("There is no gold here to take.");
            return;
        }
    }

    const itemIndex = currentRoom.items.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex !== -1) {
        const item = currentRoom.items[itemIndex];
        player.inventory.push(item);
        currentRoom.items.splice(itemIndex, 1);
        displayMessage(`You picked up the ${item.name}.`);
        updatePlayerStatusPanel();
    } else {
        displayMessage(`There's no "${itemName}" here to take.`);
    }
}

// Inventory megjelenítés váltása a fix panelen
function toggleInventoryDisplay() {
    isShowingInventory = !isShowingInventory;
    updatePlayerStatusPanel();
    displayMessage(`Toggled ${isShowingInventory ? 'inventory' : 'status'} view on the side panel.`);
}

// Tárgy használata (consumable)
function useItem(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase() && item.type === "consumable");

    if (itemIndex !== -1) {
        const item = player.inventory[itemIndex];
        if (item.effect === "heal") {
            const healedAmount = Math.min(item.value, player.maxHealth - player.health);
            player.health += healedAmount;
            displayMessage(`You used the ${item.name} and restored ${healedAmount} health.`);
        } else if (item.effect === "mana") {
            const manaRestored = Math.min(item.value, player.maxMana - player.mana);
            player.mana += manaRestored;
            displayMessage(`You used the ${item.name} and restored ${manaRestored} mana.`);
        }
        player.inventory.splice(itemIndex, 1);
        updatePlayerStatusPanel();
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
                player.inventory.push(oldEquippedItem);
                displayMessage(`You unequipped your ${oldEquippedItem.name}.`);
            }
            player.equipped.weapon = item;
            displayMessage(`You equipped the ${item.name}. Attack bonus: +${item.attackBonus}.`);
        } else if (item.type === "armor") {
            if (player.equipped.armor) {
                oldEquippedItem = player.equipped.armor;
                player.inventory.push(oldEquippedItem);
                displayMessage(`You unequipped your ${oldEquippedItem.name}. Defense bonus: +${item.defenseBonus}.`);
            }
            player.equipped.armor = item;
            displayMessage(`You equipped the ${item.name}. Defense bonus: +${item.defenseBonus}.`);
        }
        player.inventory.splice(itemIndex, 1);
        updatePlayerStatusPanel();
    } else {
        displayMessage(`You don't have an equipable item called "${itemName}".`);
    }
}

// Objektumok vizsgálata
function inspectObject(targetName) {
    const currentRoom = rooms[player.location];

    const foundItem = currentRoom.items.find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (foundItem) {
        displayMessage(`You inspect the ${foundItem.name}: ${foundItem.description}`);
        return;
    }

    const foundInventoryItem = player.inventory.find(item => item.name.toLowerCase() === targetName.toLowerCase());
    if (foundInventoryItem) {
        displayMessage(`You inspect the ${foundInventoryItem.name} in your inventory: ${foundInventoryItem.description}`);
        return;
    }

    const foundNPC = currentRoom.npcs.find(nId => npcs[nId] && npcs[nId].name.toLowerCase() === targetName.toLowerCase());
    if (foundNPC) {
        displayMessage(`You inspect ${npcs[foundNPC].name}: ${npcs[foundNPC].description}`);
        return;
    }

    if (player.isInCombat && currentEnemy && currentEnemy.name.toLowerCase() === targetName.toLowerCase()) {
        displayMessage(`You inspect the ${currentEnemy.name}: ${currentEnemy.description}`);
        return;
    }

    if (currentRoom.trapdoor && targetName.toLowerCase().includes("trapdoor")) {
        displayMessage("You inspect the trapdoor. It appears to be rusty.");
        if (currentRoom.trapdoor.locked) {
            displayMessage("It's stuck tight. Perhaps some oil would help?");
        }
        return;
    }
    if (currentRoom.secretPassage && targetName.toLowerCase().includes("fireplace") && !currentRoom.secretPassage.revealed) {
        displayMessage(currentRoom.secretPassage.hint);
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
    if (currentRoom.puzzle && targetName.toLowerCase().includes("walls") && currentRoom.id === "dungeonCells") {
        displayMessage(currentRoom.puzzle.message);
        return;
    }
    if (currentRoom.gold > 0 && targetName.toLowerCase().includes("gold")) {
        displayMessage(`You inspect the pile of gold. There are ${currentRoom.gold} gold coins here.`);
        return;
    }

    displayMessage(`You don't see or have "${targetName}" to inspect.`);
}

function talkToNPC(npcName) {
    const currentRoom = rooms[player.location];
    const npcKey = Object.keys(npcs).find(key => npcs[key].name.toLowerCase() === npcName.toLowerCase());
    const npc = npcKey ? npcs[npcKey] : null;

    if (npc && currentRoom.npcs.includes(npc.id) && npc.state !== "defeated") {
        displayMessage(`${npc.name}: "${npc.dialogue}"`);

        // Librarian quest logic
        if (npc.id === "librarian") {
            if (player.hasKey(npc.questItemNeeded) && !npc.questCompleted) {
                const questItem = player.inventory.find(item => item.id === npc.questItemNeeded);
                if (questItem) {
                    displayMessage(`${npc.name}: "Ah, you found the ${questItem.name}! Excellent! This is invaluable. Here, take this old key. It might open something important."`);
                    player.inventory = player.inventory.filter(item => item.id !== npc.questItemNeeded);
                    player.inventory.push(npc.reward);
                    npc.questCompleted = true;
                    updatePlayerStatusPanel();
                }
            } else if (npc.questCompleted) {
                displayMessage(`${npc.name}: "Thank you again for the Tome. I'm busy with my studies."`);
            }
        }
    } else {
        displayMessage(`There's no one named "${npcName}" here to talk to.`);
    }
}

// Harc indítása
function startCombat(enemyId) {
    currentEnemy = { ...enemies[enemyId] }; // Shallow copy is okay for currentEnemy as it's temporary
    player.isInCombat = true;
    displayMessage(`\n--- COMBAT STARTED ---`, false, true);
    displayMessage(`A ${currentEnemy.name} appears! ${currentEnemy.description}`);
    displayMessage(`Type 'attack' to fight, or 'flee' to attempt to escape.`);
    playerAttackedInTurn = false;
    updatePlayerStatusPanel(); // Harc indításakor is frissüljön a státusz
}

// Harc parancsok kezelése
function handleCombatCommand(command) {
    // Only allow one action per turn (attack or flee)
    if (playerAttackedInTurn && command !== 'flee' && command !== 'use') { // Allow 'use' item without counting as attack
        displayMessage("You can only perform one action per turn during combat. Type 'flee' or 'use [item]' or wait for the enemy's turn.");
        return;
    }

    switch (command) {
        case 'attack':
            playerAttack();
            playerAttackedInTurn = true; // Mark player as having acted
            break;
        case 'use':
            const parts = command.split(' ');
            const targetItem = parts.slice(1).join(' ');
            useItemInCombat(targetItem); // Use item, then enemy attacks
            playerAttackedInTurn = true; // Consuming an item also counts as player's turn
            break;
        case 'flee':
            attemptFlee();
            return; // Fleeing attempts don't immediately trigger enemy attack
        case 'status':
            updatePlayerStatusPanel();
            displayMessage("Displaying player status on the side panel.");
            return; // Status command doesn't end turn
        default:
            displayMessage("Invalid combat command. Type 'attack', 'use [potion]', or 'flee'.");
            return; // Invalid command doesn't end turn
    }

    // If combat is still ongoing and player has acted, enemy attacks after a short delay
    if (player.isInCombat && playerAttackedInTurn) {
        // Delay enemy attack slightly for better user experience
        setTimeout(() => {
            if (player.isInCombat) { // Re-check if still in combat (e.g., player might have won after attack)
                enemyAttack();
                playerAttackedInTurn = false; // Reset for next turn
            }
        }, 1000);
    }
}

// Játékos támadása
function playerAttack() {
    if (!player.isInCombat || !currentEnemy) {
        return;
    }

    const playerTotalAttack = player.attack + (player.equipped.weapon ? player.equipped.weapon.attackBonus : 0);
    // Add some randomness to damage
    let damage = Math.max(0, playerTotalAttack - currentEnemy.defense + Math.floor(Math.random() * 5) - 2);
    
    // Ensure at least 1 damage if player has a higher attack than enemy defense (unless attack is very low)
    if (damage <= 0 && playerTotalAttack > currentEnemy.defense) {
        damage = 1;
    } else if (damage <= 0 && playerTotalAttack <= currentEnemy.defense) {
        damage = Math.max(0, Math.floor(Math.random() * 2)); // Minimal damage even if defense is high
    }
    
    currentEnemy.health -= damage;
    displayMessage(`You attack the ${currentEnemy.name} for ${damage} damage!`);

    if (currentEnemy.health <= 0) {
        displayMessage(`${currentEnemy.name} defeated! You gained ${currentEnemy.xpReward} XP and ${currentEnemy.goldReward} gold.`);
        player.xp += currentEnemy.xpReward;
        player.gold += currentEnemy.goldReward;
        
        // Handle specific boss defeat flags
        if (currentEnemy.id === "mimic") {
            player.hasDefeatedMimicInLibrary = true;
        } else if (currentEnemy.id === "evil_wizard_boss") {
            player.hasDefeatedThroneRoomBoss = true;
            displayMessage("The dark magic dissipates as Lord Dred's form crumbles to dust. You have vanquished the master of the castle!", false, true);
        }

        dropEnemyLoot(currentEnemy);
        endCombat();
        checkLevelUp();
        renderRoom(); // Rerender room after combat ends successfully
    } else {
        displayMessage(`${currentEnemy.name} HP: ${currentEnemy.health}/${currentEnemy.maxHealth}`);
    }
    updatePlayerStatusPanel();
}

// Ellenfél támadása
function enemyAttack() {
    if (!player.isInCombat || !currentEnemy) {
        return;
    }

    const playerTotalDefense = player.defense + (player.equipped.armor ? player.equipped.armor.defenseBonus : 0);
    // Add some randomness to damage
    let damage = Math.max(0, currentEnemy.attack - playerTotalDefense + Math.floor(Math.random() * 5) - 2);

    if (damage <= 0 && currentEnemy.attack > playerTotalDefense) {
        damage = 1;
    } else if (damage <= 0 && currentEnemy.attack <= playerTotalDefense) {
        damage = Math.max(0, Math.floor(Math.random() * 2));
    }

    player.health -= damage;
    displayMessage(`${currentEnemy.name} attacks you for ${damage} damage!`);

    if (player.health <= 0) {
        displayMessage("You have been defeated! Game Over.");
        endCombat();
        setTimeout(() => {
            alert("Game Over!");
            resetGame();
        }, 1000);
    } else {
        displayMessage(`Your HP: ${player.health}/${player.maxHealth}`);
    }
    updatePlayerStatusPanel();
}

// Use item during combat (similar to normal use, but also triggers enemy turn)
function useItemInCombat(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase() && item.type === "consumable");

    if (itemIndex !== -1) {
        const item = player.inventory[itemIndex];
        if (item.effect === "heal") {
            const healedAmount = Math.min(item.value, player.maxHealth - player.health);
            player.health += healedAmount;
            displayMessage(`You used the ${item.name} and restored ${healedAmount} health.`);
        } else if (item.effect === "mana") {
            const manaRestored = Math.min(item.value, player.maxMana - player.mana);
            player.mana += manaRestored;
            displayMessage(`You used the ${item.name} and restored ${manaRestored} mana.`);
        }
        player.inventory.splice(itemIndex, 1);
        updatePlayerStatusPanel();
    } else {
        displayMessage(`You don't have a consumable item called "${itemName}".`);
    }
}

// Menekülés kísérlete
function attemptFlee() {
    let fleeChance = 40;
    if (player.class === "rogue") {
        fleeChance += 20; // Rogue has higher flee chance
    }

    if (Math.random() * 100 < fleeChance) {
        displayMessage("You successfully fled from combat!");
        endCombat();
        renderRoom(); // Rerender room after fleeing
    } else {
        displayMessage("You failed to flee!");
        // If flee fails, it's still the player's turn for the next combat action
        // The handleCombatCommand will call enemyAttack after this.
    }
    updatePlayerStatusPanel();
}

// Harc vége
function endCombat() {
    player.isInCombat = false;
    currentEnemy = null;
    displayMessage("\n--- COMBAT ENDED ---");
    updatePlayerStatusPanel();
}

// XP és szintlépés
function checkLevelUp() {
    const xpNeededForNextLevel = player.level * 50;
    if (player.xp >= xpNeededForNextLevel) {
        player.level++;
        player.maxHealth += 10;
        player.health = player.maxHealth;
        player.maxMana += 5;
        player.mana = player.maxMana;
        player.attack += 2;
        player.defense += 1;
        displayMessage(`\n*** CONGRATULATIONS! You reached Level ${player.level}! ***`, false, true);
        displayMessage(`Your stats have increased!`);
        updatePlayerStatusPanel();
    }
}

// Ellenféltől loot dobása
function dropEnemyLoot(defeatedEnemy) {
    if (defeatedEnemy.drops && defeatedEnemy.drops.length > 0) {
        defeatedEnemy.drops.forEach(drop => {
            if (Math.random() * 100 < drop.chance) {
                const droppedItem = { ...items[drop.id] }; // Ensure it's a copy
                rooms[player.location].items.push(droppedItem);
                displayMessage(`The ${defeatedEnemy.name} dropped a ${droppedItem.name}!`);
            }
        });
    }
    updatePlayerStatusPanel();
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
    mapString += "```\n"; // For monospace formatting

    for (let y = minY; y <= maxY; y++) {
        let row = "";
        for (let x = minX; x <= maxX; x++) {
            let roomSymbol = "   "; // Default empty space
            let roomFoundAtCoord = false;

            for (const roomId in rooms) {
                if (rooms.hasOwnProperty(roomId) && rooms[roomId].coords) {
                    const room = rooms[roomId];
                    if (room.coords.x === x && room.coords.y === y) {
                        if (player.location === roomId) {
                            roomSymbol = " P "; // Player's current location
                        } else if (player.exploredRooms.has(roomId)) {
                            roomSymbol = " X "; // Explored room
                        } else {
                             roomSymbol = " ? "; // Unexplored but existing room
                        }
                        roomFoundAtCoord = true;
                        break;
                    }
                }
            }
            row += roomSymbol;
        }
        mapString += row + "\n";
    }
    mapString += "```\n"; // Close monospace formatting
    mapString += "------------------\n";
    mapString += "P = Your position, X = Explored Room, ? = Unexplored Room (visible on map)\n";
    displayMessage(mapString);
}


// Új: Tips parancs implementálása
function handleTips() {
    const tipCost = 10;
    if (player.gold >= tipCost) {
        player.gold -= tipCost;
        updatePlayerStatusPanel();
        displayMessage(`You paid ${tipCost} gold for a tip.`);
        const currentRoom = rooms[player.location];
        let tipGiven = false;

        // Szobához tartozó tipp (pl. zárt ajtók, feladványok)
        if (currentRoom.door && currentRoom.door.locked) {
            displayMessage(`Tip: The door in this room is locked. Perhaps you need a specific key: "${currentRoom.door.unlockItem.name}".`);
            tipGiven = true;
        } else if (currentRoom.trapdoor && currentRoom.trapdoor.locked) {
            displayMessage(`Tip: The trapdoor seems stuck. It might need some lubricant: "${currentRoom.trapdoor.unlockItem.name}".`);
            tipGiven = true;
        } else if (currentRoom.vault && currentRoom.vault.locked) {
            displayMessage(`Tip: The vault door is complex. Its mechanism might require a special item: "${currentRoom.vault.unlockItem.name}".`);
            tipGiven = true;
        } else if (currentRoom.secretPassage && !currentRoom.secretPassage.revealed) {
            displayMessage(`Tip: There might be a hidden passage in this room. Try to "${currentRoom.secretPassage.unlockCommand}" specific objects.`);
            tipGiven = true;
        } else if (currentRoom.puzzle && currentRoom.puzzle.hint) {
            displayMessage(`Tip: Regarding the puzzle in this room: "${currentRoom.puzzle.hint}".`);
            tipGiven = true;
        }
        
        // Általános tippek, ha nincs szoba-specifikus
        if (!tipGiven) {
            const generalTips = [
                "Remember to 'look' around every new room.",
                "Check your 'inventory' regularly for useful items.",
                "Use 'inspect [item]' to learn more about objects.",
                "Talk to 'NPCs' by typing 'talk [NPC name]'. They might have quests!",
                "Keep an eye on your health and mana on the side panel.",
                "Equip better 'weapon' and 'armor' to improve your combat effectiveness.",
                "Defeated enemies often drop useful items or gold."
            ];
            const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];
            displayMessage(`General Tip: ${randomTip}`);
            tipGiven = true;
        }

    } else {
        displayMessage("You don't have enough gold for a tip. You need 10 gold.");
    }
}


// Mentés és Betöltés
function saveGame() {
    try {
        const gameData = {
            player: {
                name: player.name,
                gender: player.gender,
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
                inventory: player.inventory,
                equipped: player.equipped,
                location: player.location,
                isInCombat: player.isInCombat,
                exploredRooms: Array.from(player.exploredRooms),
                hasDefeatedMimicInLibrary: player.hasDefeatedMimicInLibrary,
                hasDefeatedThroneRoomBoss: player.hasDefeatedThroneRoomBoss, // Ensure this is saved
                isTrappedByEvilNPC: player.isTrappedByEvilNPC,
                evilNPCCounter: player.evilNPCCounter,
                evilNPCQuestions: player.evilNPCQuestions,
                evilNPCAnswers: player.evilNPCAnswers,
                isDisguised: player.isDisguised,
            },
            currentEnemy: currentEnemy,
            lavaBridgeBroken: lavaBridgeBroken,
            roomsState: JSON.parse(JSON.stringify(rooms)), // Deep copy of rooms
            npcsState: JSON.parse(JSON.stringify(npcs)),   // Deep copy of npcs
            isShowingInventory: isShowingInventory
        };
        localStorage.setItem('castleOfDredSave', JSON.stringify(gameData));
        displayMessage("Game saved successfully!");
    } catch (e) {
        displayMessage("Error saving game: " + e.message);
        console.error("Save error:", e);
    }
}

function loadGame() {
    try {
        const savedData = localStorage.getItem('castleOfDredSave');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            
            // Restore player object
            player = gameData.player;
            player.exploredRooms = new Set(player.exploredRooms); 
            // Re-add hasKey method
            player.hasKey = function(keyId) {
                return this.inventory.some(item => item.id === keyId);
            };

            currentEnemy = gameData.currentEnemy;
            lavaBridgeBroken = gameData.lavaBridgeBroken;
            isShowingInventory = gameData.isShowingInventory || false;

            // Restore rooms state
            // Iterate over the saved rooms state and deep copy back into the live `rooms` object
            for (const roomId in gameData.roomsState) {
                if (rooms.hasOwnProperty(roomId)) {
                    rooms[roomId] = JSON.parse(JSON.stringify(gameData.roomsState[roomId]));
                    // Re-assign onEnter functions if they were lost during JSON stringify/parse
                    if (initialRoomsState[roomId] && initialRoomsState[roomId].onEnter) {
                        rooms[roomId].onEnter = initialRoomsState[roomId].onEnter;
                    }
                }
            }

            // Restore NPCs state
            for (const npcId in gameData.npcsState) {
                if (npcs.hasOwnProperty(npcId)) {
                    // Deep copy properties from saved state back to the live npcs object
                    Object.assign(npcs[npcId], JSON.parse(JSON.stringify(gameData.npcsState[npcId])));
                }
            }

            displayMessage("Game loaded successfully!", true);
            charCreationScreen.classList.add('hidden');
            mainMenuScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            renderRoom();
            updatePlayerStatusPanel();

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
        displayMessage("Error loading game: " + e.message);
        console.error("Load error:", e);
    }
}

function resetGameConfirmation() {
    if (confirm("Are you sure you want to reset the game? All progress will be lost.")) {
        resetGame();
    }
}

function resetGame() {
    console.log("resetGame() called!");
    localStorage.removeItem('castleOfDredSave');
    player = {};
    currentEnemy = null;
    gameTextOutput.innerHTML = '';
    lavaBridgeBroken = false;
    isShowingInventory = false;

    // Restore rooms state from initialRoomsState
    for (const roomId in initialRoomsState) {
        if (rooms.hasOwnProperty(roomId)) {
            rooms[roomId] = JSON.parse(JSON.stringify(initialRoomsState[roomId]));
            // Also re-assign onEnter functions for rooms that have them
            if (initialRoomsState[roomId].onEnter) {
                rooms[roomId].onEnter = initialRoomsState[roomId].onEnter;
            }
        }
    }
    
    // Restore NPCs state from initialNpcsState
    for (const npcId in initialNpcsState) {
        if (npcs.hasOwnProperty(npcId)) {
            Object.assign(npcs[npcId], JSON.parse(JSON.stringify(initialNpcsState[npcId])));
        }
    }

    commandInput.disabled = false;
    submitCommandButton.disabled = false;

    gameScreen.classList.add('hidden');
    storyScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    charCreationScreen.classList.add('hidden');
    mainMenuScreen.classList.remove('hidden');

    displayMessage("Game reset. Welcome back to the main menu.", true);
    updatePlayerStatusPanel();
}


// --- Játék indítása az első betöltéskor ---
document.addEventListener('DOMContentLoaded', () => {
    mainMenuScreen.classList.remove('hidden');
    charCreationScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    storyScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    updatePlayerStatusPanel();
});