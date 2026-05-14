# Index:
1.  [Game Description](#game-description)
2.  [Story and Setting](#story-and-setting)
3.  [Game Modes](#game-modes)
4.  [Core Systems](#core-systems)
5.  [Game Flow](#game-flow)
6.  [Completion Goals](#completion-goals)
7.  [Related Documentation](#related-documentation)

# Game Description:
==================================================
**Title**: "Dynasty: Arena"
**Genre**: Classic RPG with DC20 style stat checks and rolls
**Setting**: Low-Fantasy Medieval
**Era**: (800-1200 AD) Late iron age type setting, not much machinery but simple technology. For example the highest technology would be water wheel or windmill powered. 

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
- Attend the tavern and socialize with other players
- Participate in gambling in various tavern games or betting on fights
- Complete quests and missions

# Story and Setting:
==================================================

## World Context:
    The "World" for this game is a single walled city with different districts. 
    The city is infested with crime, scuffles and power struggles. 
    Factions are tight knit groups of people that are often at odds with each other.

## Player's Story:
    The player can choose to start on the Streets or at the Black Goose Tavern.
    This is done at the character creation screen through the "Starting Location" page.
    The starting location affects multiple aspects of the start of the game including location, items and available activities.  

    The player can choose one of two starting locations: 
     - The Streets - This is the "First day in town and I'm broke" scenario. The player will have to sleep on the streets. 
     - Black Goose Tavern - This is the "First day in town but I came with my life savings" scenario. The player has the choice to rent a room in the tavern if they choose.
    
    Streets:
        The player will have to sleep on the streets in one of a few locations and setup a small camp. 
        The player will have to work their way up to enough gold to hire a room in the Black Goose Tavern.
        This can be done by:
        - Exploring the town and finding loose change or items to sell
        - Asking around the town for odd jobs
        - Fighting in the arena or The Pit for gold
        - Stealing/Pickpocketing and selling items to the black market for gold
        - Gambling at the tavern for gold
        - Others planned but not yet listed.  

    Black Goose Tavern: 
        The player will start in the lobby of the tavern as if they have just entered town and are looking for a place to stay. 
        They will start with a very small sum of gold (112 gold - for ambiguity sake).
        They will start with a weapon and sheild in their inventory as well as some minor items. 
        The player can chose to rent a room in the tavern for a daily cost OR camp on the streets for free if they choose.
        The player will get kicked out of heir room if they don't pay the daily rent.
        Based on the reputation with the tavern owner, the player can get a discount on the daily rent.

## Narrative Progression:
The narrative is delivered through environmental storytelling and the Scene interaction system. Text-based storytelling is intentionally hidden inside the event system so that we don't annoy the player with text.

|-----------------|---------------------------------------------------------------------------------------------------------------------|
| Phase           | Narrative Context                                                                                                   |
|-----------------|---------------------------------------------------------------------------------------------------------------------|
| Tutorial        | Your first day. You're not known in town yet. You're struggling to get by.                                          |
| Early Game      | You have some gold to your name and 1-2 fighters hired. Things are looking up.                                      |
| Mid Game        | You have a decent sum of gold, fighters and gear. You're formidable and have plenty of opportunity.                 |
| Late Game       | You're a threat now. You have the means to fight endlessly, to buy gear in plenty and opportunities are endless.    |
|-----------------|---------------------------------------------------------------------------------------------------------------------|

## Story Expression:
Environmental storytelling is key. Story is glimpsed through:
- The Events system (dialogue, encounters, consequences)
- Exploring the town and locations
- NPC interactions and overheard conversations
- Hinted implications in the town and the arena
- The players own words and actions
- The players own decisions and choices
- Notebooks and diaries that can be collected and read (making long dialogues optional)

# Game States:
==================================================
The game has three main states of gameplay. All systems branch from Map Mode.
|----------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| Mode                 | Description                                                                                                   | Documentation                                                    |
|----------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| **Map State**        | Top-down/Isometric 3D town overview. The main hub of the game.                                                | [Map State](/Documentation/GDD/MapState.md)                      |
| **Location State**   | Interior/area views accessed by clicking locations in Map State. Interact with services, NPCs, and items.     | [Location State](/Documentation/GDD/LocationState.md)            |
| **Combat State**     | Combat mode for scheduled or unscheduled fights. Control your character manually.                             | [Combat State](/Documentation/GDD/CombatState.md)                  |
|----------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|


# Core Systems:
==================================================
Brief overview of core systems. See linked documentation for full details.

# Player Character
The player character is a non-combatant that manages the town and fighters. They have Fame and Charisma stats. Visible in Map Mode and Location Mode.
**Details:** [User Interface - Player Character Panel](/Documentation/GDD/UserInterface.md)

# Fighters
Fighters are the faction's primary asset. The player recruits, trains, equips, and develops them to improve arena performance. Up to 20 fighters can be housed at the Keep.
**Details:** [Fighter Management](/Documentation/GDD/FighterManagement.md)

# Equipment
Equipment quality and upkeep directly influence fighter survival and performance. Items have quality ratings, degrade during combat, and can be repaired or replaced.
**Details:** [Equipment Management](/Documentation/GDD/EquipmentManagement.md)

# Resources
The town has resource levels (Food, Wood, Metal, Special) that gate features and events. Upgrade resource buildings to increase levels.
**Details:** [Map Mode - Resources](/Documentation/GDD/MapMode.md)

# Events
Events add variety and depth. Triggered by travel, interaction, or time. Three types: Combat, Dialogue, and Passive.
**Details:** [Events](/Documentation/GDD/Events.md)

# Time & Calendar
Fights are scheduled via the in-game calendar (12 months, 30 days each). Time progresses in real-time unless traveling or interacting. Missing scheduled fights incurs penalties.
**Details:** [Time and Calendar](/Documentation/GDD/TimeAndCalendar.md)


# Game Flow:
==================================================
**New Game → Arena Tutorial → Town Tutorial → Gameplay Loop**

1. **Main Menu**: New Game, Load Game, Settings, Extras, Exit
2. **Character Creation**: Choose faction, name, banner, appearance
3. **Arena Tutorial**: Learn combat controls and movement
4. **Town Tutorial**: Introduction to shops, keep, and town management
5. **Gameplay Loop**: Explore town, train fighters, manage resources, compete in scheduled arena fights

**Goals**: Train fighters, manage town, win arena fights, build reputation, gain fame, unlock equipment.

**End State**: No overarching story goal. Player-driven progression with finite completion goals. See [Completion Goals](#completion-goals).


# Completion Goals:
==================================================
The game has finite progression. Once all goals are achieved, the game becomes a "fight for fun" sandbox where the player can enjoy arena combat without resource pressure.

## Version 1.0 - Max Completion:
|-----------------------|---------------------------------------------------------------------------|
| System                | Completion State                                                          |
|-----------------------|---------------------------------------------------------------------------|
| Buildings             | All upgrades purchased                                                    |
| Fame                  | Maxed                                                                     |
| Charisma              | Maxed                                                                     |
| Equipment             | All tiers unlocked, weapons break less often, surplus gear stockpile      |
| Services              | Near-instant (from upgrade bonuses)                                       |
| Arena                 | Schedule fights at will, all challenges complete                          |
| Fighters              | All 20 Keep slots filled with max-level fighters                          |
| Cosmetics             | All player cosmetics and equipment cosmetics unlocked                     |
| Events                | All event chains experienced                                              |
|-----------------------|---------------------------------------------------------------------------|

## Post-Expansion - Max Completion:
|-----------------------|---------------------------------------------------------------------------|
| System                | Completion State                                                          |
|-----------------------|---------------------------------------------------------------------------|
| Arenas                | Champion of all 4 faction cities (home + 3 expansion)                     |
| Expeditions           | All expedition types encountered at least once                            |
| Arena Cosmetics       | All arena-specific cosmetics unlocked                                     |
| Keep Customization    | All furniture and cosmetic customization options unlocked                 |
|-----------------------|---------------------------------------------------------------------------|

**True Endgame**: After max completion, the game becomes an arena sandbox. All resource pressure is removed - the player has earned the ability to simply enjoy combat.


# Related Documentation:
==================================================

## Game Design Documents:
|---------------------------------------------------------------------|------------------------------------------------------|
| Document                                                            | Description                                          |
|---------------------------------------------------------------------|------------------------------------------------------|
| [Map Mode](/Documentation/GDD/MapMode.md)                           | Map Mode, districts, navigation, travel              |
| [Location Mode](/Documentation/GDD/LocationMode.md)                 | Location Mode experience and interaction             |
| [Locations](/Documentation/GDD/Locations.md)                        | All enterable locations and their services           |
| [Arena Mode](/Documentation/GDD/ArenaMode.md)                       | Combat system, controls, AI, rewards                 |
| [User Interface](/Documentation/GDD/UserInterface.md)               | All UI panels, menus, and HUD elements               |
| [Fighter Management](/Documentation/GDD/FighterManagement.md)       | Fighter stats, recruitment, training                 |
| [Equipment Management](/Documentation/GDD/EquipmentManagement.md)   | Inventory, quality, degradation, upgrades            |
| [Events](/Documentation/GDD/Events.md)                              | Event types, triggers, consequences                  |
| [Time and Calendar](/Documentation/GDD/TimeAndCalendar.md)          | Time progression, scheduled fights                   |
| [Player Controls](/Documentation/GDD/PlayerControls.md)             | Input schemes for all modes                          |
|---------------------------------------------------------------------|------------------------------------------------------|

## Development Planning:
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| Document                                                                              | Description                                          |
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| [Planning Overview](/Documentation/Planning/PlanningOverview.md)                       | Development planning index                           |
| [Map Mode Plan](/Documentation/Planning/MapModeDevelopmentPlan.md)                     | Map Mode dependency graph and phases                 |
| Location Mode Plan (TBD)                                                              | Location Mode dependencies                           |
| Arena Mode Plan (TBD)                                                                 | Arena Mode dependencies                              |
|---------------------------------------------------------------------------------------|------------------------------------------------------|

## Progress Tracking:
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| Document                                                                              | Description                                          |
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| [Game Progress Overview](/Documentation/Tracking/GameProgressTrackingOverview.md)     | High-level progress summary                          |
| [Map Mode Progress](/Documentation/Tracking/MapModeDevelopmentProgress.md)            | Map Mode feature status                              |
| [Location Mode Progress](/Documentation/Tracking/LocationModeDevelopmentProgress.md)  | Location Mode feature status                         |
| [Arena Mode Progress](/Documentation/Tracking/ArenaModeDevelopmentProgress.md)        | Arena Mode feature status                            |
| [Framework Progress](/Documentation/Tracking/FrameworkProgressTracking.md)            | Core framework status                                |
|---------------------------------------------------------------------------------------|------------------------------------------------------|

## Technical Documentation:
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| Document                                                                              | Description                                          |
|---------------------------------------------------------------------------------------|------------------------------------------------------|
| [Framework Overview](/Documentation/Core%20Systems/FrameworkOverview.md)              | Technical framework documentation                    |
|---------------------------------------------------------------------------------------|------------------------------------------------------|
