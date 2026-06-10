1.  [Game Description](#game-description)
2.  [Story and Setting](#story-and-setting)
3.  [Game Modes](#game-modes)
4.  [Core Systems](#core-systems)
5.  [Game Flow](#game-flow)
6.  [Completion Goals](#completion-goals)
7.  [Related Documentation](#related-documentation)
Viewer does not need these as the headers catch them - remove once pushed to git.

# [ Game Description ]:
==================================================
[ Title ]: "Dynasty: Arena"
[ Genre ]: Classic RPG with DC20 style stat checks and rolls
[ Setting ]: Low-Fantasy Medieval
[ Era ]: (800-1200 AD) Late iron age type setting, not much machinery but simple technology. For example the highest technology would be water wheel or windmill powered. 

Dynasty Arena is a medieval RPG game set in a single town/region. The player starts as a lowly commoner making their way to a new life of fame and fortune.
live is a stuggle to survive in the town and make a name for themselves.
The player starts either in the streets or at the Black Goose Tavern. They must find ways to aquire wealth, hire rooms, hire fighters, keep themselves alive and make a name for themselves.
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
- Attend the arena and fight for fame and fortune
- Attend the tavern and socialize with NPCs
- Participate in gambling in various tavern games or betting on fights
- Complete quests and missions

# [ Story and Setting ]:
==================================================

## - World Context:
The "World" for this game is a single walled city with different districts. 
The city is infested with crime, scuffles and power struggles. 
Factions are tight knit groups of people that are often at odds with each other. They are symbolic for the most part and do not have a lot of impact on the game.
Reputation with factions affects the willingness of their faction fighters to join the player's team. (higher reputation - more fighters from that faction available to hire)

## - Player's Story:
The player can choose to start on the Streets or at the Black Goose Tavern.
This is done at the character creation screen through the "Starting Location" page.
The starting location affects multiple aspects of the start of the game including location, items and available activities.  

During the game the player will have full control over their adventure. The player's story is intentionally vague in order to 
let the user imprint their own and build it up through gameplay instead. 

## - Narrative and Progression:
The narrative is delivered through environmental storytelling and the Scene interaction system. Text-based storytelling is intentionally hidden inside the event system so that we don't annoy the player with text. All Dialogues, Cutscenes or transitions can be skipped. 

|-----------------|---------------------------------------------------------------------------------------------------------------------|
| Phase           | Narrative Context                                                                                                   |
|-----------------|---------------------------------------------------------------------------------------------------------------------|
| Tutorial        | Your first day. You're not known in town yet. You're struggling to get by.                                          |
| Early Game      | You have some gold to your name and 1-2 fighters hired. Things are looking up.                                      |
| Mid Game        | You have a decent sum of gold, fighters and gear. You're formidable and have plenty of opportunity.                 |
| Late Game       | You're a threat now. You have the means to fight endlessly, to buy gear in plenty and opportunities are endless.    |
|-----------------|---------------------------------------------------------------------------------------------------------------------|

## - Story Expression:
Environmental storytelling is key. Story is glimpsed through:
- The Events system (dialogue, encounters, consequences)
- Exploring the town and locations
- NPC interactions and overheard conversations
- Hinted implications in the town and the arena
- The players own words and actions
- The players own decisions and choices
- Notebooks and diaries that can be collected and read (making long dialogues optional)

# [ Player Character ]:
The player character is the player's avatar in the game. They are the player's representative in the game and are the player's main asset.
The player's stats are determined based on their initial choice of distribution and their current level/progression.
In Location State the player is visible in scene but is not controllable, they just appear where they need to after clicking interactions or events.
In Combat State the player is controllable and can move around, swing their wepon, block, dodge, activate traps, etc.

## - Player Stats: 
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


# [ Game Flow ]:
==================================================
New Game → Character Creation → Gameplay Loop

1. Main Menu: New Game, Load Game, Settings, Extras, Exit
2. Character Creation: Choose starting location, name, appearance and stat distribution.
3. Gameplay Loop: Explore town, train fighters, manage equipment, compete in scheduled arena fights or The Pit, gamble, theive, complete quests and missions, etc.

## - Starting Location:
The player can choose one of two starting locations: 
 - The Streets - This is the "First day in town and I'm broke" scenario. The player will have to sleep on the streets. 
 - Black Goose Tavern - This is the "First day in town but I came with my life savings" scenario. The player has the choice to rent a room in the tavern if they choose.

### -- Streets:
 The player will have to sleep on the streets in one of a few locations and setup a small camp. 
 The player will have to work their way up to enough gold to hire a room in the Black Goose Tavern.
 This can be done by:
  - Exploring the town and finding loose change or items to sell
  - Asking around the town for odd jobs
  - Fighting in the arena or The Pit for gold
  - Stealing/Pickpocketing and selling items to the black market for gold
  - Gambling at the tavern for gold
  - Others planned but not yet listed.  

### -- Black Goose Tavern: 
  The player will start in the lobby of the tavern as if they have just entered town and are looking for a place to stay. 
  They will start with a very small sum of gold (112 gold - for ambiguity sake).
  They will start with a weapon and sheild in their inventory as well as some minor items. 
  The player can chose to rent a room in the tavern for a daily cost OR camp on the streets for free if they choose.
  The player will get kicked out of their room if they don't pay the daily rent.
  Based on the reputation with the tavern owner, the player can get a discount on the daily rent.

## - Gameplay:
 The Gameplay consists of viewing the Map, chosing a location to visit, interacting with the location and the NPCs in the location.
 Inside of locations various activities and interactions are available to the player.

### -- Game States:
==================================================
 The game has three main states of gameplay. All systems branch from Map State.
 These states are semantic in that they are only listed here to delineate the different states of gameplay.
 |----------------------|---------------------------------------------------------------------------------------------------------------|
 | Mode                 | Description                                                                                                   |
 |----------------------|---------------------------------------------------------------------------------------------------------------|
 | **Map State**        | Top-down/Isometric 3D town overview. The main hub of the game. Icons are displayed to show the locations and what is available.             |
 | **Location State**   | Interior/area views accessed by clicking locations in Map State. Interact with services, NPCs, and items.     |
 | **Combat State**     | Combat mode for scheduled or unscheduled fights. Control your character manually.                             | 
 |----------------------|---------------------------------------------------------------------------------------------------------------|
 

 The player can choose to:
 - Explore Town/The region.
 - Train Fighters.
 - Upgrade Equipment.
 - Hire Fighters.
 - Collect resources.
 - Craft items.
 - Sell items.
 - Buy items.
 - Hire rooms.
 - Increase Tavern levels.
 - Increase Arena levels.
 - Increase Fighter's Guild reputation.
 - Increase Blacksmith level.
 - Increase Apothecary level.
 - increase Faction reputations.
 - Attend the arena or The Pit.
 - Attend the tavern and socialize with NPCs.
 - Participate in various gambling activities.
 - Complete quests and missions.
 - Steal from the town or other NPCs.
 - Enguage in random encounters.
 - Others planned but not yet listed.  

## - End State: 
 No overarching story goal. Player-driven progression with finite completion goals.
 The player ends up with a full team, plenty of gold, maxed tavern level, maxed arena level, maxed equipment level, maxed fighters level, maxed quests and missions completed.
 The intent is always that the player plays as they wish and are never "forced" to do anything.


# Fighters
==================================================
Fighters are one of the players main assets. They are used almost exclusively in the arena or on missions. 

# Equipment
==================================================
 - Equipment quality and upkeep directly influence fighter survival and performance. 
 - Items have quality ratings, degrade during combat, and can be repaired or replaced.
**Details:** [Equipment List](/Documentation/GDD/EquipmentList.md)

# [ Time & Calendar ]
==================================================
## - Day/Night Cycle:
 - Every day consistes of a full day and night cycle. 
 - The day and night cycle is used to determine the availability of events and activities in the town.
 - There are no seasons in the game. Sundown is always 6pm, giving the player 6 hours to do night time activities without incurring "Sleep Deprivation" penalties.

## - Player Sleep:
 [ACTION]
 - The player must sleep at night if they do not wish to incur [Sleep Deprivation] penalties.
 - A standard day is 16 hours long. (8am - 12am).
 - Sleeping in a Tavern reduces the chances of negative things happening while the player sleeps.
 - The current Tavern level dictates what buffs or lack there of the player recieves while Sleeping.
 - Sleeping in a good room will give a [Well Rested] buff for a short period of time.

## - Sleep Deprevation:
 [DEBUFF]
 - For every hour the player is awake past bed time they will incur a penalty to their stats.
 - If the player is still awake at 5am they will automatically take themselves to their room or camp and will sleep for the rest of the night.
 - The penalty is 1 point per stat per hour.
 - The penalty is active upon waking the next day.
 - To remove the penalty the player must sleep a full night. 
 - Multiple night of lost sleep insreases the potencey of [Sleep Deprevation].
 - The players stats can be reduced to a maximum of half their original value.


# [ Related Documentation ]:
==================================================
 |---------------------------------------------------------------------|------------------------------------------------------|
 | Document                                                            | Description                                          |
 |---------------------------------------------------------------------|------------------------------------------------------|
 | [Map](/Documentation/GDD/Map.md)                                    | Map Mode, districts, navigation, travel              |
 | [Locations](/Documentation/GDD/Locations.md)                        | All enterable locations and their services           |
 | [Combat](/Documentation/GDD/Combat.md)                              | Combat system, controls, AI, rewards                 |
 | [User Interface](/Documentation/GDD/UserInterface.md)               | All UI panels, menus, and HUD elements               |
 | [Fighters](/Documentation/GDD/Fighters.md)                          | Fighter stats, recruitment, training                 |
 | [Equipment](/Documentation/GDD/Equipment.md)                        | Inventory, quality, degradation, upgrades            |
 | [Time and Calendar](/Documentation/GDD/TimeAndCalendar.md)          | Time progression, scheduled fights                   |
 |---------------------------------------------------------------------|------------------------------------------------------|

