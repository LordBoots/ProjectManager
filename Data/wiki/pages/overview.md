1.  [Game Description](#game-description)
2.  [Story and Setting](#story-and-setting)
3.  [Player Character](#player-character)
4.  [Saving & Loading](#saving-&-loading)
5.  [Starting States & Difficulty](#starting-states-&-difficulty)
6.  [Game States](#game-states)
7.  [Fighters](#fighters)
8.  [Equipment](#equipment)
9.  [Shops](#shops)
10. [Time & Calendar](#time-&-calendar)
11. [Combat](#combat)
12. [Locations](#locations)
13. [Sabotage](#sabotage)
14. [Mini-Games](#mini-games)
15. [Jobs](#jobs)
16. [Accomodation](#accomodation)
17. [Arena](#arena)

# Game Description
==================================================
[ Title ]: "Dynasty: Arena"
[ Genre ]: Classic Sandbox RPG with DC20 style stat checks and rolls mixed with Arena Combat
[ Setting ]: Low-Fantasy Medieval
[ Era ]: (800-1200 AD) Late iron age type setting, not much machinery but simple technology. For example the highest technology would be water wheel or windmill powered. 

Dynasty Arena is a medieval RPG game set in a single town/region. 
The player starts as a lowly commoner making their way to a new life of fame and fortune.
Life is a stuggle to survive in the town and make a name for themselves.
The player starts in the streets or at the Black Goose Tavern or at a camp ground. They must find ways to aquire wealth, hire rooms, hire fighters, keep themselves alive and make a name for themselves.
Stats play heavily into the game, the player must manage their stats to survive and succeed.

The main "hub" of the game is the map. The player can navigate the map to visit different locations and interact with the world.
When a player moves to a new location, they will be presented with a view of the general environment and NPCs in the location.
The player will be able to interact with many of these NPCs and objects. 
The patrons/actors at locations will change based on the players progression, choices and time of day.

The player plays as they wish - this is not a linear story and there are no overarching story goals.
The player can choose to:
- Explore the town and find ways to make gold
- Hire fighters and train them
- Upgrade their equipment
- Attend the Arena and fight for fame and fortune
- Attend the Tavern and socialize with NPCs
- Participate in gambling in various tavern games or betting on fights
- Complete quests and missions
- Delve into the town sewers or dungeons for treasure and danger
- Steal from the town or other NPCs
- Enguage in random encounters
- Collect materials an items for various purposes

Summary (marketing blurb): 
 "A single-city medieval sandbox where you survive, fight in arenas, manage fighters, gamble, take jobs, and slowly climb from a nobody to a powerful arena champion through layered systems of combat, economy, and risk. The town of Dynasty is a city of opportunity and danger, where you can make a name for yourself or fade into obscurity."

# Story and Setting
==================================================
World Context:
 The "World" for this game is a single walled city with different districts. 
 The city is infested with crime, scuffles and power struggles. 
 Factions are tight knit groups of people that are often at odds with each other. They are symbolic for the most part and do not have a lot of impact on the game.
 Reputation with factions affects the willingness of their faction fighters to join the player's team. (higher reputation - more fighters from that faction available to hire)

Player's Story:
 The player can choose to start on the Streets or at the Black Goose Tavern.
 This is done at the character creation screen through the "Starting Location" page.
 The starting location affects multiple aspects of the start of the game including location, items and available activities.  

 During the game the player will have full control over their adventure. The player's story is intentionally vague in order to 
 let the user imprint their own and build it up through gameplay instead. 

Narrative Delivery:
 The narrative is delivered through environmental storytelling and the Scene interaction system. Text-based storytelling is intentionally minimized in favor of visual storytelling.

Story Expression:
 Environmental storytelling is key. Story is glimpsed through:
 - Exploring the town and locations
 - NPC interactions and overheard conversations
 - Hinted implications in the town and the arena
 - The players own choices and actions
 - Notebooks and diaries that can be collected and read (making long text completely optional)


# Player Character
==================================================
 The player character is the player's avatar in the game. They are the player's representative in the game and are the player's main asset.
 The player's stats are determined based on their initial choice of distribution and their current level/progression/training.
 In Location State the player is visible in scene but is not controllable, they just appear where they need to after clicking interactions or events.
 In Combat State the player is controllable and can move around, swing their wepon, block, dodge, activate traps, etc.

[Power Progression]:
 The mechanical progression of the character is driven by a three tier system:
 1. Stats: These are the core of the players progression, they have the most influence on the character's abilities and performance.
 2. Items: These are used to flatten the arch occasionally, allowing the player to bypass or lessen the impact of a stat check for a SPECIFIC interaction.
 Items are not intended to be plentiful in quantity, they are intended to be a rare and valuable resource.
 3. Skills/Levels: These are considered "proficiencies" that the player can develop and use to their advantage. They add small advatages or percentage bonuses in many different areas. They are not designed to be a "game changer" but rather a small advantage. Each level the player gains, they can pick a skill to level up.
 Levels are gained through experience points (XP) and are gained through ALL activites in the game.

Player Stats: 
|----------------------|---------------------------------------------------------------------------------------------------------------|
| Stat                 | Description                                                                                                   | 
|----------------------|---------------------------------------------------------------------------------------------------------------|
| **AGI**              | The player's agility.                                                                                         | 
| **STR**              | The player's strength.                                                                                        | 
| **CON**              | The player's constitution.                                                                                    | 
| **DEX**              | The player's dexterity.                                                                                       | 
| **PER**              | The player's perception.                                                                                      | 
| **CHA**              | The player's charisma.                                                                                        | 
|----------------------|---------------------------------------------------------------------------------------------------------------|

Player Gear:
 The player can equip gear to the character to improve their abilities and performance.
 The gear types are: 
 1. Weapons: These are used to attack and damage enemies, they can be upgraded to improve their damage and durability.
 2. Armour: These are used to protect the character from damage, they can be upgraded to improve their defense and durability.

Player Skills & Levels:
 Skills are passive abilities that the player can improve by leveling up.
 They affect all areas of the game, from rolls to interactions to combat to quests to missions to ect.
 The player can choose to level up a skill to improve their abilities and performance.

 The player has a "proficiency" bar - this bar shows how proficient overall the player is. This can be considered a "rebranded" leveling system.
 Each "level" is just a point that you progress past on the bar.
 Every tick on the bar gives a proficiency point that can be placed in ANY of the skills. 

 Skills are displayed in category lists that are shown in the UI.
 The player can gover over a skill to see what it does, they can click to add a point to the skill.
 These are permanently added to the skill and cannot be removed.

 Visual Example: (completely placeholder items, nothing here is "planned", They are examples only)
  PROFICIENCY: ●●●●●●●●●●●●●●●●●○○○○○○○○○○○○○○○○○ (18/36 points)
  ------------------------------------------------------------------------------------------------
   Skills list:
   ------------------------------------------------------------
    Combat
     [ I know The Spot ] [+1] - Increased chance to hit a target with a critical strike.
     [ Elegance Isn't Dead ] [+2] - Increased chance to avoid being hit by a target.
     [ I know My Weapons] [0] - Less damage to weapons as they are used. Less durability loss. 
     [ With The Wind] [0] - Lern to roll with the punches and avoid damage. Taking glancing blows is more common.
    ------------------------------------------------------------
    Thievery
     [ Quick Hands ] [+1] - Increased chance to steal items from vendors and other NPCs.
     [ Lightened Breath ] [+3] - Reduced chance to be caught by guards or other NPCs when hiding.
     [ Sneaky Feet ] [0] - Reduced chance to be heard by guards or other NPCs when sneaking.
    ------------------------------------------------------------
    Crafting
     [ A luck So Petty ] [0] - Increased chance to find materials for crafting.
     [ Large Pockets] [+2] - Change to find gold you don't know you had handing over gold for crafting.
    ------------------------------------------------------------
    Social
     [ Golden Tongue ] [0] - Increased chance to get a better price for items sold.
     [ Philosopher's Wit] [+1] - Better chance at negotiation and persuasion.
     [ Critical Mind ] [+2] - Less chance to be fooled by deception and trickery.    
    ------------------------------------------------------------
    Many More...


# Saving & Loading
==================================================
  [Slots]:
  Like classic games, the game will have a limited number of save slots.
  This number will initially be set to 10.
  They will be displayed as "cards" in a horizontal row.
  Players can:
  - Create new saves. (same as starting new game but skips the save slot selection screen)
  - Delete saves.
  - Rename saves.
  - Load saves.
  - Sort saves by name, date, ect.
  - Duplicate saves.

  [Saving]:
  Autosave is enabled and will save the game automatically at regular intervals. (this can be adjusted in the settings - defualy is on, save at morning)
  Manual save is available through the save menu.
  Autosave can be disabled in the settings.

  [Loading]:
  Loading is available from the main menu OR the pause menu.
  The player can load a save from the save slot selection screen.

# Starting States & Difficulty
==================================================
  The Diffuculty of the game is mixed between the starting location and the difficulty settings.
  Different starting locations affect what the player can do right away due to scarcity of suplies and fighters.

  Mode Selection:
  The player can choose one of THREE modes:
  1. RPG Mode: This is the default mode. It includes all RPG elements and the Arena system.
  2. Arena Mode: This mode only includes the Arena system.
  3. RPG Only: This mode only includes the RPG elements.

  Difficulty Settings:
  1. Easy: This is the easiest difficulty. - Rolls are easier, enemies are weaker, items are more plentiful, quests are easier, ect.
  2. Normal: This is the default difficulty. - No modifiers.
  3. Hard: This is the hardest difficulty - Items are more scarce, enemies are stronger, quests are harder, ect.

  Difficulty Flags:
  1. Permadeath: Permadeath is a setting that is available in all difficulty settings.
  2. Auto-Retry: When enabled the game will restart after a death automatically. (This is only available if Permadeath is enabled)
  3. Auto-Retry-Mode: Retry Save Point or Restart from Morning. (This is only available if Auto-Retry is enabled)
  4. Disable Auto-Save: Autosave is disabled and the player must manually save the game
  5. Auto Save in Morning: Autosave is enabled and the game will save automatically when the player wakes up in the morning. (This is only available if Auto-Save is enabled)

  Starting Location:
  The player can choose one of THREE starting locations: 
  1. The Streets - This is the "First day in town and I had no plan and brought nothing and no one with me" scenario. 
  2. The Camp Ground - This is the "First day in town and I'm broke but have my friend, my gear and a few gold" scenario. 
  3. The Black Goose Tavern - This is the "First day in town but I came with some savings, my friend and our gear and I have a plan" scenario.

  Streets:
  This is the "worst case scenario" starting location. 
  The player will have to sleep on the streets in one of a few locations.
  The player will have to work their way up to enough gold to hire a room.

  Cons:
  - No protection from negative encounters at night.
  - Player will start each day with a small penalty to their stats from poor sleep.
  - The player will start with almost no gold to their name.
  - The player has only a sword and sheild in their inventory.
  - The player does not yet have a team of fighters.

  Pros:
  - None - this is intended to be a challenging starting location.

  Camp Ground:
  This is the mid grade starting location.
  The player will have to setup a small camp just on the outskirts of town.
  The player brought some items with them, has some gold and their family guard/friend with them.

  Pros:
    - Some protection from negative encounters at night.
    - The player will start with a small sum of gold to their name.
    - The player has a small inventory of items with them: A sword, Shield, some basic leather armour and some basic tools or tinctures/potions.
    - The player has one fighter with them: A family guard that was gifted to them by their family.

  Cons:
    - Player will have a small chance of a stat penalty from poor sleep. (it is assumed the player and their guard take turns sleeping)
    - The player is slightly further distance from the town and it's activities.
    - The player has a chance to be robbed or attacked by bandits or other NPCs.
    - Player might be intimidated to pay to stay at the camp ground by guards or other NPCs.

  Black Goose Tavern: 
   The player will start in the lobby of the tavern as if they have just entered town and are looking for a place to stay. 
   The player has no room hired and they can chose to do so OR find their own way.

    Pros:
    - Decent protection from negative encounters at night.
    - The player will start with a small sum of gold to their name.
    - The player has a small inventory of items with them: A sword, Shield, some basic leather armour and some basic tools or tinctures/potions.
    - The player has one fighter with them: A family guard that was gifted to them by their family.
    - The player has enough gold to potentially hire one more fighter right away.

    Cons:
    - Player will have a small chance their room is stolen from when they are not in it. (This minimizes and then vanishes based on the player progression of that tavern and the price of the room)
    - The player now has a daily upkeep cost for the room. This reduces over time as the player progresses and the tavern level increases.
   (All cons can be eventually alleviated by the player's actions and progression)



# Game States
==================================================
  Map: 
  A top down 3D town overview. The main hub of the game.
    - Icons are displayed to show the locations and what is available.
    - The player can navigate the map to visit different locations and interact with the world.
    - When a player moves to a new location, they will be presented with a view of the general environment and NPCs in the location.
    - The player will be able to interact with many of these NPCs and objects. 
    - The patrons/actors and activities available at locations will change based on the players progression, choices and time of day.

  Location:
   An interior/area view accessed by clicking locations in Map State. Interact with services, NPCs, and items.
   For instance taverns, inns, guilds, arenas, docks, slums, shops, etc.
   These are typically the main locations that the player will visit and interact with.
   They are almost always shown from a first person perspective.

  Scenario:
   A specific scenario or event that is happening in the game. For instance opening a chest, finding a hidden object, breaking into a house, etc.
   The player can interact with the scenario and complete objectives.
   The scenario will have a unique set of NPCs and objects.

   These are presented as a 3D scene with a camera view from a first person perspective.
   The camera is free to move around the environment based on the players actions and the scenario's design.

  Combat:
   A combat mode for scheduled or unscheduled fights. Control your character manually.
   The combat is "Twin Stick" style combat in that is is top down, WASD/Left Analog Stick movement with Mouse/Right Analog Stick camera rotation. 
   The player can move around the environment, swing their wepon, block, dodge, activate traps, etc.
   This is always presented as top down isometric style combat. The roofs are removed to show the combat area.
   Combat is used for Arena, The Pit, Dungeons, ect. (whever a combat event triggers)
   see more in [Combat](#combat) OR [Arena](#arena)

   In a scenario, say the player is caught by a guard. The camera will move out to the topdown isometric view of the combat area and the combat controls will be shown.
   If the player has team members and the scenario allows, the players fighters will automatically spawn in the combat area to help.

  End State: 
   No overarching story goal. Player-driven progression with finite completion goals.
   The player ends up with a full team, plenty of gold, maxed tavern level, maxed arena level, maxed equipment level, maxed fighters level, maxed quests and missions completed.
   The intent is always that the player plays as they wish and are never "forced" to do anything.


# Items
==================================================
  Items are the consumable and non-consumable items that the player can use in the game.
  They are all stored in the inventory.
  They can be aquired from various locations and activities in the game.
  They can be used to improve the player's stats, perform actions, craft items, equip the player or a fighter, ect.

  [Types]:
  1. Consumables: These are items that are consumed by the player or a fighter. See [Consumables](#consumables)
  2. Materials: These are items that are used to craft other items. See [Materials](#materials)
  3. Tools: These are items that are used to perform actions. See [Tools](#tools)
  4. Equipment: These are items that are used to equip the player or a fighter. See [Equipment](#equipment)

  ## Consumables
  ==================================================
  Consumables are items that are consumed by the player or a fighter.

  [Types]:
  1. Tinctures: These are items that are used to improve the player's stats.
  2. Potions: These are items that are used to improve the player's stats.
  3. Food: These are items that are used to improve the player's stats.
  4. Alcohol: These are items that are used to improve the player's stats.

  ## Equipment
  ==================================================
  Equiptment refers to the gear that the player can equip to the fighters or the player character.

  [Types]:
  1. Weapons: These are used to attack and damage enemies, they can be upgraded to improve their damage and durability.
  2. Armour: These are used to protect the character from damage, they can be upgraded to improve their defense and durability.

  [Equipment Slots]:
  1. Weapon Slots: Main Hand, Shield Hand, Two Handed, Bow, Thrown
  2. Armour Slots: Helmet, Chest, Legs, Feet, Hands

  [Weapon Sub-Types]:
  - One hand Bladed Weapons (main hand): Short Sword, Long Sword, Rapier, Scimitar, Axe, Dagger
  - Two hand Bladed Weapons (two hand): Great Sword, Great Axe, Spear
  - Blunt one hand Weapons (main hand): Hammer, Mace, Club
  - Blunt two hand Weapons (two hand): Great Hammer, Great Mace
  - Thrown Weapons (thrown): Throwing Knife, Throwing Axe, Dart, Rock
  - Ranged Weapons (bow): Bow, Crossbow, Throwing Spear
  - Defensive Weapons (shield): Buckler, Kite Shield, Square Shield

  [Armour Sub-Types]:
  - Metal Armor: Plate Mail, Chainmail, Scale Mail
  - Leather Armor: Leather Body, Hardened Leather, Leather Scale Mail
  - Quilted Armour: Various quilted armour items - tyically used early game for low level fighters, they offer very little defense.

  [Durability]:
  Every item has a durability rating. This is a measure of how much damage the item can take before it is destroyed.
  The durability of the item is affected by the quality of the item and what materials are used in the item.
  During a fight the durability ot items is reduced based on the clashing of equipment and the quality of the items involved.
  For instance: Hitting a metal object with a bladed weapon will reduce the durability by a larger amount than hitting a wooden shield with the same weapon.
  When the durability of an item reaches 0 it is considered "broken" and must be repaired or replaced.

  [Repair]:
  Items can be repaired by the blacksmith in the town.
  The repair cost is also affected by:
    - The quality of the item.
    - The amount of degradation the item has.
    - Certain quests done for the blacksmith that reduce the repair cost.
    - Certain items the player has in their inventory that reduce the repair cost.
    - The reputation of the player with the blacksmith.
    - If the player has materials themselves to supply the repair.  


  ## Materials
  ==================================================
  Materials are items that are used to craft other items.
  They are stored in the materials tab of the inventory.
  Materials are used to hand to shop owners to craft items. See [Crafting](#crafting)

  [Types]:
  1. Wood
  2. Stone
  3. Metal
  4. Cloth
  5. Foodstocks

  [Obtained From]:
  1. Gather Jobs: When performing jobs that involve gathering there is a chance to obtain materials.
  2. Mining Jobs: When performing jobs that involve mining there is a chance to obtain materials.
  3. Farming Jobs: When performing jobs that involve farming there is a chance to obtain materials.
  4. Rogue Traders: Rogue traders sometimes have materials for sale.
  5. General Stores: General stores sometimes have materials for sale.
  6. Quest and Task rewards.
  7. Random encounters.
  8. Chests.
  9. Crates.
  10. Found in Scenario Locations.


  ## Tools
  ==================================================
  Tools are items that are used to perform actions.
  They are primarily used as rare items that allow players to level the odds or rolls OR access locations and activities that are otherwise not available.
  They are designed to be expensive and rare.
  They are stored in the tools tab of the inventory.

  [Types]:
  1. Lockpicks
  2. Info Packages (Notes, Letters, ect.)
  3. Poisons

  [Obtained From]:
  1. Rogue Traders: Rogue traders sometimes have tools for sale.
  2. General Stores: General stores sometimes have tools for sale.
  3. Quest and Task rewards.
  4. Random encounters.
  5. Chests.
  6. Crates.
  7. Other locations.
  8. Conversations with NPCs.
  9. Found in Scenario Locations.


# Fighters
==================================================
  Fighters are one of the players main assets. They are used almost exclusively combat encounters. 

  [Aquiring Fighters]:
  Fighters can be aquired in a few ways, typically from the tavern or the fighter's guild:
  1. By hiring them from the tavern.
  2. By finding them in the town or dungeons (random encounters).
  3. By completing quests and missions. (Available to purchase from the tavern or the fighter's guild)
  4. Checking the fighter's guild for available fighters.
  5. Tournament wins (Fighters from a losing team may offer to desert and join the player's team for a price).

  [Fighter Stats]:
  Only combat related stats are displayed and relevant for fighters.
  |----------------------|---------------------------------------------------------------------------------------------------------------|
  | Stat                 | Description                                                                                                   | 
  |----------------------|---------------------------------------------------------------------------------------------------------------|
  | **AGI**              | The player's agility.                                                                                         | 
  | **STR**              | The player's strength.                                                                                        | 
  | **CON**              | The player's constitution.                                                                                    | 
  | **DEX**              | The player's dexterity.                                                                                       | 
  |----------------------|---------------------------------------------------------------------------------------------------------------|

  Fighter Aquisition System Progression:
  The town will intentionally have a smaller set or lesser quality fighters visiting/staying in the town initially.
  As the player progresses through the game, the quality and quantity of fighters will increase:
  - Taverns will have more fighters available to hire.
  - The fighter's guild will have more fighters available to purchase.
  - The town will have more random encounters that offer fighters.
  
  Fighter Training:
  Fighters can be trained to improve their stats and skills. This takes time and gold, the Fighter becomes unavailable for other activities during this time.
  When Training a Fighter, the player can choose to focus on a specific skill. 
  When Fighters level up their proficiency bar during training, they will gain a randomized compatible proficiency bonus to a random skill.
  Training is done through the fighter's guild.
  The physical "training" of the fighters can be viewed in the fighter's guild at the fighter's field (the training courtyard)

  Fighter Equipment:
  Fighters can be equipped with gear to improve their defence and offensive capabilities.
  This is all done through the player's Fighters Panel UI. 
  The player and fighter equiptment are mechanically the same, in that both can wear all items. 

  Fighter Accomodation:
  Fighters live with the player either in their room, on the street, the player's camp or their house.
  The fighter's quality of accomodation effects their welbeing bonuses which directly affect their stats and abilities.

  During Fights:
  Fighters are driven by AI and will act based on the situation.
  They will have the same combat actions available as a player character, there is no real differentiation between the two other than the AI is driving one, the player the other. 
  AI will be programmed to have in depth telemetry of what is happening around them and will act accordingly.
  The AI will use confidence levels to determine how aggressive they should be.
  Confidence is based on:
  - How many allies nearby.
  - How many enemies nearby.
  - How much health the fighter has.
  - How much health the enemies have.
  - How much damage the fighter is taking.
  - The distance to the enemies.
  - The distance to the allies.
  - The distance to traps or other hazards.

  The Ai is designed to be "smart" without becoming "too smart" in that they beat the player reliably. 
  They are designed to be infintely tunable. 

  Fighter death: 
  If a fighter is killed in combat, they are removed from the player's team and the player must hire a new fighter.
  The equiptment they were wearing will be heavily degraded and must be repaired or replaced.
  The player will lose a small amount of gold for the fighter's death for "disposal" costs.


# Shops
==================================================
  Shop views usually show the storefront and the items on display.
  The shopkeeper is usually visible and can be talked to if required (some quests may require the player to purchase items from a shopkeeper that are not displayed in the shop)

  Players can click on items to see more details and purchase them.
  Items will have an eyeball symbol above them to make them easily identifiable as being available for purchase.
  Players can purchase items by dragging the item onto the counter and then clicking the "Purchase" button.

  player can sell items by dragging items from their inventory onto the counter and then clicking the "Sell" button.
  When items are on the counter they will be highlighted in the players inventory to alert them that they are being sold.
  A gold pile is displayed on the counter and grows as the player adds items, a value is shown hovering above the gold pile to show the total value of the items being sold.
  Next to the gold pile is a button to "Sell All". Clicking this will sell all items on the counter and add the gold to the player's inventory.

  [Item Availability]:
  Item pools will be somewhat procedural within broader categories.
  As the player progresses through the game, the availability and quality of items will increase.
  Some quests, activities or favors may offer items that are not available in the shop.
  Item quantities will be relatively scarce regardless of the progress through the game. This is to keep iten aquisition, hunting, trasding and rewards relevant even in mid/late game.

  [Time of Day]:
  Shops are usually shut during the night apart from taverns and rogue traders.
  Rogue traders are available to the player at random times of day and will offer items for sale. 

  [Rogue Traders]:
  Rogue traders are "black market" traders that are not part of the town's economy and are not subject to the same rules as other shops. 
  They are not guaranteed to be safe or honest. 
  Rogue traders will typically offer items that are not available in the town's shops (lockpicks, info packages, rare items, ect).
  Negative events can happen when leaving a rogue trader's shop.
  For instance:
  - The player is robbed or attacked by the rogue trader's guards.
  - The player is intinidated to pay more gold for the items they are buying.
  - The player is caught in a trap or hazard set by the rogue trader.
  - The player is poisoned or diseased by the rogue trader.
  - The player is arrested by the guard for breaking the law. (Rogue traders are illegal in general)
  - The player is fined by the guard for breaking the law. 
  - The player is given a warning by the guard for breaking the law. 

# Time & Calendar
==================================================
  Day/Night Cycle:
  - Every day consistes of a full day and night cycle. 
  - The day and night cycle is used to determine the availability of events and activities in the town.
  - There are no seasons in the game. Sundown is always 8pm.
  - The day progresses slightly every time the player performs an action.

  Player Sleep:
  - The player must sleep at night if they do not wish to incur Sleep Deprivation penalties.
  - A standard day is 16 hours long. (8am - 8pm).
  - Sleeping in a Tavern reduces the chances of negative things happening while the player sleeps.
  - The current Tavern level dictates what buffs or lack there of the player recieves while Sleeping.
  - Sleeping in a good room will give a Well Rested buff for a short period of time, this will wear off as the day progresses.

  Sleep Deprevation:
  - For every hour the player is awake past bed time they will incur a penalty to their stats.
  - If the player is still awake at 5am they will automatically take themselves to their room or camp and will sleep for the rest of the night.
  - The penalty is not yet determined.
  - The penalty is active upon waking the next day.
  - To remove the penalty the player must sleep a full night.
  - Multiple nights of lost sleep increases the potency of Sleep Deprevation.
  - The players stats can be reduced to a maximum of half their original value.

  - Tinctures/potions can be used to reduce the penalty of lost sleep but also incur their own penalties. 
    For instance one potion may reduce the penalty to sleep deprived stats BUT add a small penalty to other stats. They may even apply their own debuff that disallows the use use of subsequent potions/tinctures for a short period of time (to mitigate potion abuse - staying up all night and just taking potions to stay awake).


# Combat
==================================================
  Combat is a top down isometric style combat system.
  It is a Twin Stick style combat system in that is is top down, WASD/Left Analog Stick movement with Mouse/Right Analog Stick camera rotation. 

  [Death]:
  Death is not available to the player character themselves unless permadeath is enabled.
  If permadeath is NOT enabled the player will just wake up at the hospital with heavy penalties due to needing time to recover.
  With Permadeath enabled, the player will restart from the beginning of the day OR from their last save depending on the setting.

  [Arena]:
  Fights are typically scheduled for the arena through the Arena UI.
  The rewards are typically equipment, materials, gold, reputation, unlocks, ect.
  The reward are shown in the Arena UI.
  This is a dangerous combat encounter and the player must be prepared for the worst.
  In all game modes, fighters can be permanently lost in combat.
  see more in [Arena](#arena)

  [The Pit]:
  The pit is a bare knuckle fight arena.
  These fights are entered at the players will. 
  The player cannot die here but they can become injured and require medical attention. 

  This is a black market style fight arena. The rewards are typically gold through a bet type system.
  The player can enter the fights, or bet on other fights.
  The player can send team members to fight for them and bet on them also. 

  [Scenarios]:
  During some scenarios, combat can be triggered. For example a guard may catch the player stealing from a shop. The player can either fight the guard, run away, or negotiate with the guard.
  If the player fights the scenario camera will pull back towards the sky to show the combat area.
  The game will give the player control of the character and they must fight. 

# Locations
==================================================
Locations are the main areas of the game.
Shops, Taverns, Guilds, Docks, ect.

Location List:
 - Black Goose Tavern
 - Three Coins Inn
 - Golden Swan Tavern
 - Fighter's Guild
 - Rogues Den
 - Arena
 - Bank
 - General Stores
 - Armourer
 - Blacksmith
 - The Pit
 - Docks
 - Mines 
 - Sewers
 - Library
 - Prison
 - Temple
 - Hospital
 - Dungeons/Catacombs/Underground Bases
 - Mansions
 - Markets
 - Camp Sites
 - Various Slums Houses, alleyways, ect.
 - Various Dock Areas, Ships, ect.
 - Various Citizen Houses, Shacks, ect.
 - Various outskirt locations, farms, ect.

# Sabotage
==================================================
 Arena fights can be sabotaged in multiple ways.
 This is usually done in the interrum leading up to the fight.
 The outcomes include: 
 - Apponent team suffers a loss (fighter injured, fighter lost, ect)
 - Apponent team is delayed (fight is postponed)
 - Apponent team is denied equipment (equipment is destroyed, missing, ect)
 - Apponent team is denied resources (resources are destroyed, missing, ect)
 - Apponent team is denied gold (gold is destroyed, missing, ect)
 - Apponent team suffers a reputational penalty/scandal (They are capped from bringing one of their best fighters)
 - Apponent team's training is interrupted (you fight against lower level fighters)

 Sabotage is not always successful and the other team will try to sabotage you back OR you could incur penalties if caught.

 Sabotage is usually done by hiring an oporative agent from the slums district or other outcast regions. - it is usually costly and the player must be prepared for the consequences. 

# Mini-Games
==================================================
Mini-Games are small games that the player can play to earn rewards.
They are designed to be simple in nature.

Current Mini-Games planned:
 Tavern Games:
  - Knife Throwing
  - Dice Rolling
  - Coin flipping
  - Card Game (Blackjack, Poker or something simple like Rummy)
 Fighting Games:
  - The Pit Betting 
  - Arena Betting
 World Games:
  - Fishing
  - Hunting
  - Trading
  - General World Events

[Knife Throwing]:
 Location: Tavern
 Description: The camera shows a first person view of a knife throwing target. The player has limit time to line up their shot and take it, The outcome is based on a mix of the players accuracy and a ganeral luck roll.
 Rewards: Gold.

Dice Rolling:
 Location: Tavern
 Description: The Camera shows a mostly top-down view of a table with The relevant info written on paper notes. The player can bet hight or low on the outcome of the dice roll. The player sets the amount of gold they like to bet and it appears on the side of the table. The dice are rolled, An animation plays and the outcome is displayed.
 Rewards: Gold.
 Options: Disable Animation, Auto-Roll (rolls the dice a given amount of times with the same high/low bet)

Coin Flipping:
 Location: Tavern
 Description: The Camera shows a mostly top-down view of a table with The relevant info written on paper notes. The player can bet heads or tails on the outcome of the coin flip. The player sets the amount of gold they like to bet and it appears on the side of the table. The coin is flipped, An animation plays and the outcome is displayed.
 Rewards: Gold.
 Options: Disable Animation, Auto-Roll (flips the coin a given amount of times with the same heads/tails bet)

Card Game:
 Location: Tavern
 Description: The Camera shows a mostly top-down view of a table with The relevant info written on paper notes. The player can bet on the outcome of a card game. The player sets the amount of gold they like to bet and it appears on the side of the table. The cards are dealt, the player plays through the game and after a win or loss the outcome is displayed.
 Rewards: Gold.
 Options: Fast Animation, Auto-Roll (deals the cards a given amount of times with the same bet)

The Pit Betting:
 Location: The Pit
 Description: The Camera shows a betting table with a background view of the ongoing fights. The player can chose to bet on the outcome of the current fight. They may then move to the viewing area upstairs by clicking to view the fight. In this view it will be a first person view of the fight from the player's table upstairs.
 (There maybe multiple camera angles offered to the player to choose from/swap between)
 Rewards: Gold.
 Options: Fast Forward Fight (fast forwards the fight to the end - consumes the same time an average fight would take)

Arena Betting:
 Location: Arena
 Description: The Camera shows a betting table with a background view of the ongoing fights. The player can chose to bet on the outcome of the current fight. They may then move to the viewing area upstairs by clicking to view the fight. In this view it will be a first person view of the fight from the player's table upstairs.
 (There maybe multiple camera angles offered to the player to choose from/swap between)
 Rewards: Gold.
 Options: Fast Forward Fight (fast forwards the fight to the end - consumes the same time an average fight would take)

Fishing:
 Location: Docks, River canals, ect.
 Description: The Mechanic for this are completely unknown as of yet.
 Rewards: Fish, Materials, Gold.
 Options: Fast Forward Fishing (fast forwards the fishing to the end - consumes the same time an average fishing would take)

# Jobs
==================================================
Jobs are a way for the player to earn gold.
When a job is accepted, time will pass and the player will be rewarded with gold.
The trade-offs for working is simple - jobs take a large portion of the day away from the player and they will be unable to do other activities during that time.

Avialbility:
 Jobs are not always available, their availability is largely random - per day and time of day.

Finishing a Job:
 When a job is finished, the player will be rewarded with the rewards.
 The rewards are shown in the job UI.
 Rewards are automatically added to the player's inventory.

Job Types:
  - Bar Keep: Available at the Taverns.
  - Cook: Available at the Taverns.
  - Server: Available at the Taverns.
  - Bar Sweep: Available at the Taverns.
  - Delivery Jobs: Deliver items form one location/task giver to a specific location.
  - Collection Jobs: Collect items from a location.
  - Gathering Jobs: Gather resources from a location. (This could be anything from gathering wood, ore, herbs, ect.)
  - Mining Jobs: Available at the mines, Hits at the Tavern may lead to a mining job.
  - Farming Jobs: Available at the outskirts of town.


# Accomodation
==================================================
they playewr can store their fighters, goods and sleep at their place of residence as long as it is not the streets.

Camps:
 Camps are one step above being homeless/staying on the streets.
 Camps are a small area of land that the player can claim and set up a small camp.
 Camps have minimum security and protection from negative encounters at night.

Taverns:
 Taverns cost to stay at per night.
 Taverns offer multiple rooms of varying quality and cost.
 They have medium to good protection from negative encounters at night depending on the quality of the room and tavern level.
 They have Medium to good food and drink available.

 Doing jobs at a tavern can also offer a room at a tavern for the player to stay at for free for a set number of days.
 Doing tasks for the owner increases the tavern reputation with the owner, decreasing costs and increasing the quality of the rooms by default.

Houses:
 The player can rent a house from a citizen.
 Houses have a weekly rent cost.
 Houses have the best security and protection from negative encounters at night.
 Houses give the best sleep quality and bonuses.


# Arena
==================================================
The arena is central to town and is the main location for fights.

[Mode Differences]:
  Arena Mode:
  - No need to schedule fights, player clicks a fight or sets one up with custom settings and presses "Play"
  - Arena UI is the main hub for this mode.

Sheduling a Fight:
 Fights are scheduled through the Arena UI.
 The player ccan see upcoming fights and the opponents and sign up for them.
 If a player misses the fight time, they will be marked as "No Show" and will incur a penalty to their reputation.

Arena Layout:
 The Arena is a circular arena. 
 The layout of the arena can be changed per match by walls, objects, traps, ect.
 This allows for more complex fights and strategies.

Arena Rules:
 - The arena can support a maximum of 5 opponents per team (1 player, 4 Fighter AI) 
 - The rules change based on the arena type.

Arena Types:
 - Standard: Remove all opposing fighters from play (kill, bleed out, or retrieve).
 - King of the Hill: The team that can hold the hill for the longest time wins.
 - Scrap Battle: Opponents have to find equipment in the arena to fight with.
 - Civilian Fight: Players fight against the town's civilians they are outnumbered. Win when all civillians are out of play (killed, bled out, OR retrieved)
 - Street Fight: Kill or Down your opponent in the street. Win when the opponent is out of play (killed, bled out. NO RETRIEVALS as it wasn't an "official" fight.)
 - Trap Battle: Are only weapons inthe arena are bare hands and traps. Win when the opponent is out of play (killed, bled out, OR retrieved)

Arena Rewards:
 - Equipment
 - Materials
 - Gold
 - Reputation
 - Unlocks

Fighter Death:
 When a fighter dies in a fight, they are permanently lost.
 They are removed from the fighters roster and the player must hire a new fighter.
 The equiptment they were wearing will be heavily degraded and must be repaired or replaced. (see [Equipment](#equipment))
 The player will lose a small amount of gold for the fighter's death for "disposal" costs.

Fighter Injury:
 When a fighter is injured in a fight and retireved, they are considered "injured".
 These fighters will have to recover at the hospital for a set amount of time.
 After they have "recovered" they will lose some stats temporarily that can be earned back faster than usual through training.

 (Permanent injury is being considered but full limb removal would take a lot of custom assets to implement.
 It would require:
  - Custom limb models that were segmented at multiple points to allow for different levels of injury/different severities of injury.
  - End cap textures so the "flesh and bone" was visible and not just a solid color.
  - Special effects to show the injury and the recovery process.
  - A systme to allow the parts to drop off of the body and have physics enabled.
  - A system to stop that limb being considered "there" anymore in the physics and fight data.
  - If it was done- it would likely be better as an expansion or major update later on
 )

Retriever System:
 In a scheduled match the Fighters Guild assigns 2 voluntary retrievers to each team.
 One retriever is a dragger that can drag downed fighters to the staging area.
 One retriever is a defender that can protect the dragger from attackers during retrieval.

 Only the defender can fight back.
 Both of these retrievers are fair game for the opposing team to attack.
 They stand on the side of the battlefield and rush in when a fighter is downed.
 Downed fighters have a set amount of time they can be retrieved before they bleed out and die.
 They are not protected by the Fighter's Code. 

Sabotage:
 The player can sabotage the opposing team to gain an advantage in the fight.
 See more in [Sabotage](#sabotage)

# Game Modes
==================================================
Game Modes are the different ways to play the game.
They are selected upon creating a new save game. 

RPG Mode:
 In RPG mode there are RPG elements.
 This is the "entire game" mode where Arnea and the RPG progressions are intertwined.
 The hub for this mode is the Map UI.

Arena Mode:
 In arena mode there is no RPG elements. The player can only fight in the arena.
 The hub for this mode is the Arena UI.

 The player will be presented wil increasingly difficult fights as they progress.
 The player will be rewarded with equipment, materials, gold, unlocks, ect.
 Players will be able to hire fighters and train them from the arena UI.
 This mode includes a free Play option through the Arena UI. 

RPG Only:
 In RPG Only mode there are RPG elements.
 The Arena system is completely removed.
 The player still has a roster of fighters and can train them, equip them, ect.
 Fighters are only used here for random combat encounters tied to events.

 (
  To make this mode more interesting we might have to introduce psuedo-survival elements such as hunger, thirst, sleep deprivation, ect.
  The "End State" here is unclear - maybe the character's goal is a house/farm/healthy trade business/ect.
 )


# Ideas (Not to be considered at all currently)
==================================================
The above needs to be finished completely before even considering this section. 

1. Full Trade System:
  The player would be able to participate in trade.
  They would craft items to sell on the NPC market.
  They would potentially have a shop of their own, which they would stock, upgrade and manage.
  They would look through the trade regiter/couriers and find/purchase items at good prices and have them shipped to them.
  They would be able to set the prices of their items and gamble with the chance of them selling or not.

# Notes:
==================================================
1. The Index is out of order and needs to be corrected later - there is no point doing it while the document is changing so often.

# Implimentation order: 
==================================================
1. The Map Assets: Buildings, Rocks, Trees, Fences, Roads, ect.
 These need to be completed in order to put the map together.
 Completion Status: 40%

2. The Map Layout: This needs to be completed in order to know what areas are available, how everything looks and how it is laid out.
 The Scenarios happen ON the map so it is required to have the map complete.

3. Character Assets: Bodies, Heads, Hair, Rigging, Weight painting, Textures, ect.
 These need to be completed in order to populate the map and future scnearios.
 Completion Status: 60%
 
4. Character Creation: This needs to be completed in order to have a system to create the player's character AND a tool to use for NPC creation.
 This allows me to make a tool to create NPCs for the game, I can then distribute this tool to my partners to use to generate me some curated NPCs for the game.
 This beats out randomly generating NPCs and gives me a way to control the quality of the NPCs and the consistency of the game.

5. The Engines Asset Factory: This needs to be completed in order to have a system to place the assets from the map file. 
 Because of the scale of the city and how many objects are going to be on screen at one time, we need to be able to MeshInstance them. This means
 a factory system is required to handle the reading of a map file and the placement of the assets. This vastly reduces the tax on the CPU scheduling and memory usage.
 This is required for product accessability and performance.

6. Map UI: This needs to be completed in order to have a UI to navigate the map and enter into locations/Scenarios.
 This stage allows the first testing of the map and the engine assets.

7. RPG Scenarios: This is where the first RPG scenarios are placed and tested.
 RPG scenarios are events that happen like a guard catching the player stealing from a shop. The player can either fight the guard, run away, or negotiate with the guard.
 These are not "required" it;s just where the game starts to come together.

7. Combat System: This needs to be completed in order to have a system to handle combat and expand the scenarios into combat encounters.
 This requires me to build the actual player controller system and the Arena controller system.
 This allows me to test movemenet, weapon animations, combat mechanics, ect.

8. AI System: This needs to be completed in order to have a system to handle the AI for the fighters.
 This would be where I build the AI's "brains" and give them a way to act in the world.
 This allows for the arena to be semi functional until further polish is added. 

9. Various UI Screens: I will need to create multiple of these for things like shops, scenarios, the arena, ect.
 These are require to allow fot testing of an actual playthrough. At this point there is still a lot missing BUT there is enough there to do a full "cycle" of a day in the game.