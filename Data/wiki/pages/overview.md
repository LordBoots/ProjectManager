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
**Genre**: Classic RPG with FnF style stat checks and rolls
**Setting**: Low-Fantasy Medieval
**Era**: (800-1200 AD) Late iron age type setting, not much machinery but simple technology. For example the highest technology would be water wheel or windmill powered. 

The Clock is always ticking! Players must manage their time wisely to be in optimal condition for scheduled fights.

**Main Gameplay Loop**:
    The player must work to increase their wealth, their inventory, their fighters and their relations. 
    The player must visit locations throughout the map to complete various tasks and unlock further progression points by interacting with people, objects and scenarios. 


# Story and Setting:
==================================================

## World Context:
    The "World" for this game is a single walled city with different districts. 
    The city is infested with crime, scuffles and power struggles. 

## Player's Story:
    The player can choose to start as a lowly farmer making their way to a new life OR they can pick from multiple starting points further along in their journey.
    This is done at the character creation screen through the "Background" page.
    The backgrounds affects multiple aspects of the start of the game including location, items, relations and available activities.  

    The player can choose one of three starting points (corresponding to the chosen background): 
     - The Streets - This is the "First day in town" scenario. The player will have to sleep on the streets. 
     - Black Goose Tavern - Tier 3 tavern with a single figther hired, gold and a starting inventory. Some relations will have already been made.
     - Three Coins Tavern - Tier 2 tavern with three fighters hired, more gold, starting inventory.  More relations will have already been made.
     - Golden Swan Tavern - Tier 1 tavern with 5 fighters hired, plenty of gold and a robust starting inventory. More relations will already be made. 
    
    Streets:
        The player will have to sleep on the streets in one of a few locations and setup a small camp. The player will have to work their way up to enough gold to hire a room in the Black Goose Tavern OR one of the other taverns.
        The players first move will likely be to find out how to make some gold to rent a room.

    Black Goose Tavern: 
        The player will start here with a room already rented and a single fighter. 
        They will start with a very small sum of gold.
        They will start with a weapon and sheild for the player and their fighter. 
    
    Three Coins Tavern:
        The player will start with a room already rented. 
        They will have a full set of armour and weapons for the player and their 2 fighters.
        They will already have a medium sum of gold. 
        They will already start with their mission 



The region's arena has fallen into disrepair due to the prior manager's incompetence. Attendance is low. The faction's fighters are poorly equipped and demoralized. Rival factions smell weakness.

Your mandate is simple: **Revitalize the arena. Restore the faction's honor. Win.** - But the arena is a subsidiary of the town and the town is a subsidiary of the faction - so you will have to do your best to get the region fuctioning well in order to get the arena working well.

But everyone knows the truth - in this world, power flows to those who control the arena. Your "mandate" is really an opportunity. Build your stable of fighters. Climb the brackets. And perhaps... rise even higher.

## Narrative Progression:
The narrative is delivered through environmental storytelling and the Events system. Text-based storytelling is intentionally hidden inside the event system so that we don't annoy the player with text.

|-----------------|----------------------------------------------------------------------------------------|
| Phase           | Narrative Context                                                                      |
|-----------------|----------------------------------------------------------------------------------------|
| Tutorial        | Your first day. The arena is empty. Your fighters are green. Prove you belong here.    |
| Early Game      | Rival factions test you with easy fights. They're measuring you.                       |
| Mid Game        | You've caught attention. Sabotage attempts increase. Harder opponents emerge.          |
| Late Game       | You're a threat now. The brackets tighten. Champions from other factions challenge you.|
| Post-Expansion  | Other faction cities take notice. Invitations arrive. New arenas await conquest.       |
|-----------------|----------------------------------------------------------------------------------------|

## Story Expression:
Environmental storytelling is key. Story is glimpsed through:
- The Events system (dialogue, encounters, consequences)
- Exploring the town and locations
- NPC interactions and overheard conversations
- The state of the arena and town reflecting your progress

## Game Length: 
I plan to target a gameplay length of 20-40 hours. The longer people PLAY the more WORD OF MOUTH which leads to quantity of sales.
As a solo dveloper with no advertising budget, this is the best we can do.

This gameplay time would be spread between the arena and the town mechanics.
- The "arena" is considered the main incentive for the player to play the game, which forces them to interact with the town mechanics if they want to win.
- I also plan to have a "sandbox arena" mode where the player can play the game without the resource pressure of the town. - this would act as a "free fighting" mode where the player can just fight for fun. It would likely include a bunch of arena types that does not actually fit the games theme but are still fun to play.


# Game Modes:
==================================================
The game has three main modes of gameplay. All systems branch from Map Mode.
|----------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| Mode                 | Description                                                                                                   | Documentation                                                    |
|----------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| **Map Mode**         | Top-down 3D town overview. Navigate districts, manage buildings, upgrade resources. The main hub of the game. | [Map Mode](/Documentation/GDD/MapMode.md)                        |
| **Location Mode**    | Interior/area views accessed by clicking locations in Map Mode. Interact with services, NPCs, and items.      | [Location Mode](/Documentation/GDD/LocationMode.md)              |
| **Arena Mode**       | Combat mode for scheduled fights. Control a fighter or command the field.                                     | [Arena Mode](/Documentation/GDD/ArenaMode.md)                    |
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

# Not Implemented in Version 1.0:
- **Expeditions** - Send fighters on missions for resources/equipment.
- **Trading** - Automated trade with non-hostile factions.
- **Crafting** - Convert materials into equipment/consumables.
- **Faction Reputation** - Faction reputation with other factions. Fame is the primary reputation metric for the player currently. Might actually be better being named "favour" or "favourability" as it is more fitting for the game's theme and we already have "Fame" acting as an attractor for events and rewards.
- **Sabotage** - Sabotage opposing factions to gain arena advantages. See [Sabotage](/Documentation/GDD/Sabotage.md) for design notes.


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
