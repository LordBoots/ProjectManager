# Index:
1.  [Game Description](#game-description)
2.  [Story and Setting](#story-and-setting)
3.  [Game Mechanics](#game-mechanics)
    - [Player Character](#player-character)
    - [Arena Combat](#arena-combat)
    - [Town Management](#town-management)
    - [Fighter Management](#fighter-management)
    - [Equipment Management](#equipment-management)
    - [Resource Management](#resource-management)
    - [Trading](#trading)
    - [Crafting](#crafting)
4.  [Customization](#customization)
5.  [Game Flow](#game-flow)


>>The purpose of this GDD is so that my casual investor can "get on the same page" with the concepts and features of the game - It is not intended to be a technical document.
>>AI can also use it to get on the same page with the developer.
>> These files are intentionally missing from this project as this is for developing the viewer.
>>Technical Documentation for the Game Framework is found in the [Framework Overview](/Documentation/Core%20Systems/FrameworkOverview.md) file.


# FEATURE FREEZE:
==================================================
**!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!:**
    - The game is currently in a feature freeze stage.
    - No new features are being added.
    - This allows current systems t mature properly and gives the game a chance of actually launching.

**Expansion Stage 1:** 
This is when I will re-open the game for feature expansion. This will be after the first version of the game is bug free and feels right.

# Game Description:
==================================================
This game is a medieval arena combat game mixed with a town/fighter management game.
The Clock is always ticking!
Players will have to manage their time wisely to make sure they are in optimal condition for scheduled fights.
These are rough lands so the player will have to watch out for threats as they wander about.

**Title**: "Dynasty: Arena".
**Main Gameplay Loop**:
    - The player is a part of a faction that presides over a town. They manage town resources and hire fighters to battle in the arena against other factions.
    - The player will have to upgrade their fighters and equipment to be able to compete in the arena.
    - The secondary focus is on managing the town and it's resources to sustain the fighters and the town.
    - Time is a resource and it costs to move around and perform some actions so players will have to be careful about how they use their time.


# Story and Setting:
    @collapsible @collapsed
==================================================
**Setting**: 
    Low-Fantasy Medieval

**Story**: 
    The world is obsessed with bloodsport and the arena is the center of the world. The player is a part of a faction that presides over a town. They manage town resources and hire fighters to battle in the arena against other factions. Factions are constantly at odds with each other over land and resources. The player must manage their town and fighters to survive and thrive in the arena.
    Sabotage and intrigue are rife in the world of the arena. The player must navigate the politics of the arena and the world to survive and thrive.

**Story Expression**: 
    Environmental storytelling is key to the game. The player will be able to explore the world and interact with the environment to learn about the world and the story. Text based storytelling will be used sparingly. Story Can be glimpsed through the Events system and exploring the world and locations.


# Game Mechanics:
==================================================
Click a section to expand it.

## Player Character:
    @collapsible @collapsed
==================================================
**Description**: 
    - The player character is the main character of the game. 
    - They are a non-combatant that manages the town and fighters.

**Character Panel View**: 
    - The player can be seen and managed at all times in the Character Panel.
    - Their entire body is visible.
    - The players stats are visible here.

**Character Name**: 
    - Player selects a name for their character at the start of the game.

**Character Appearance**: 
    - Player selects an appearance for their character at the start of the game.

**Character Stats**: 
    - The character stats are fame and charisma. 
    Charisma is used to influence decision outcomes.
    Fame influences the frequency and quality of some systems.

**Appearance in game**: 
    - The player character will only appear in Map Mode and Location Mode
    - In map mode the player appears outside the last location they visited.
    - When interacting with people they will be seen talking to them in the 3D scene.

**More Information:** on the character creation process can be found in [Character Creation](/Documentation/CharacterCreation.md)


## Arena Combat:
    @collapsible @collapsed
==================================================
**Description**: 
    - The arena is the town’s economic and political lifeline; fighters risk permanent consequences in scheduled battles that determine the faction’s reputation, income, and survival.
    - The player controls one of their selected fighters OR can choose to command the field directly.
    - When commanding the field the player character barks orders to the fighters. This is done by clicking on the fighters in the arena and selecting an action or commanding them to move to a specific location. (This will not be implemented in version 1.0 as we are feature freezing.)

**Scheduled fights**: 
    - Arena fights against other factions are scheduled and time gated by the ingame calendar system.
    - Players must manage their time well to achieve what they need before scheduled fights.

**Fighters can be injured/killed**: 
    Fighters can be injured during fights and will need to be healed by the town's healer. 
    Fighters can be killed in fights and will need to be replaced.

**Combat**: 
    Combat is a simple top down/isometric style combat system. 
    The player controls one of their selected fighters and fights against other fighters. The combat is relatively simple. 
    Fighters are assigned equipment by the player or randomly by the game. The player can choose to fight with a specific fighter or let the game choose for them.

**Control scheme**: 
    The Control scheme is a simple top down/isometric style. Reminiscent of a twin stick shooter but melee focused. 
    The player can move the fighter around the arena and use the mouse to aim and attack.
    They will be able to swap between multiple weapons during the fight.

**AI**: 
    - The AI will have complex decision making to make them more interesting and challenging to fight.
    - They will react to the player's actions and will try to counter them.
    - They will attack based on a confidence level that is determined by:
        - the number of allied and hostile fighters nearby.
        - The nearby allies and enemies remaining health.
        - Their equipment quality.
        - their training level.
        - Their current stamina and health.

**Item degradation**: 
    - Items degrade over the fight and will become less effective as the fight goes on.
    - Equipment will have to be repaired - repairs not always possible if an item is too damaged.

**Arena rewards**: 
    - Arena rewards are gained based on the outcome of the fight. The player can gain reputation with the faction they fought, equipment, and resources. The player can also lose reputation with the faction they fought.

**More Information:** in [Arena Combat](/Documentation/ArenaCombat.md).

## Town Management: 
    @collapsible @collapsed
==================================================
**Description**: 
    The player, as a non‑combat overseer. 
    They must maintain and grow the town's infrastructure and resources to:
        - Support fighters
        - Unlock Better Hires
        - Unlock Better Equipment
        - Unlock Better Events
        - Unlock More Expeditions
        - Unlock Better Trading (not implemented in version 1.0)
        - Unlock Better Crafting (not implemented in version 1.0)

**Town Structure**: 
    - The town is a 3D map similar to what you would find in top down city builder games. 
    - The town is made up of a series of buildings and "locations" that the player can interact with.
    - The town is laid out in districts that each serve a unified function.

**Moving "Locations"**: 
    - Moving "Locations" is a time-cost event. When a player clicks a location to go there we "fade" to that location and the games "time" jumps forwards based on the distance from the current location. 
    - During a location change events can be triggered based on the route taken and the town's resource level. 
    - Events are shown after the transition in a non invasive "events" panel that lives on the side of the UI.

**Hire retainers**: 
    - The player can hire retainers to help them manage the town and it's resources. This automates portions of the town management process.

**Buildings**: 
    - The town has a set amount of buildings and upgrades are purely function based - they do not change the look of the buildings.

**Resources**: 
    - The town has resource "levels" that are used to gate other town features and events. Player must breach the thresholds to unlock new features and events.

**Upgrading facilities**: 
    - The player will have to upgrade the towns facilities to increase access to fighters, consumables, equipment, and other town upgrades.

**Resource acquisition**: 
    - The towns resource levels will directly impact the players access to fighters, consumables, equipment, and other town upgrades.

**Events**: 
    - Towns have random events that can occur within them. Town resource level will directly affect the frequency and quality of these events.

**Hidden interactables**: 
    - Towns will have hidden interactables similar to point and click adventure games - these are optional and just add things to interact with in the town.

**User Interface**:
    - The town management UI is built into Map Mode. 
    - It is overlayed on top of the 3D map of the town.
    - Under the player's portrait the resource levels are displayed.
    - Buildings themselves when clicked or hovered become the status indicator for that building.
    - The player can click a building to view more information about it, what it provides and what it requires to upgrade.

**More Information:** in [Town Management](/Documentation/TownManagement.md).

## Fighter Management:
    @collapsible @collapsed
==================================================

**Description**: 
    - Fighters are the faction’s primary asset; the player recruits, trains, equips, and develops them to improve arena performance and secure long‑term faction success.

**Fighter Residency**:
    - Fighters live in the player's keep. 
    - The keep has dormitories and bunks for the fighters to sleep in.
    - The keep can support up to 20 fighters at one time. (including the player's team of 5 fighters)

**Fighters**: 
    - Fighters are the faction's primary asset. They are the player's fighters that they can send to the arena to fight.

**Fighter Recruitment**: 
    - The player can recruit fighters to the faction by hiring them from the town's fighter's guild.
    - The player can also gain some fighters for free by completing events and quests. - these are sparse and not a primary source of fighters.

**Fighters stats**: 
    - Fighters have a set of stats that determine their ability to compete in the arena.

**Equipment**: 
    - Players can freely customize their fighters equipment. The player will also have to source the equipment for their fighters from various places.

**Training**: 
    - There are two training routes for fighters:
    - The first is the "basic" training route which is done in the town at the keep or fighter's guild.
    - The second is the "Expedition" route which is paid and gains reputation, resources, and equipment. These could be anything from "Clear local bandits" to "Raid a nearby castle". They are bounties from other factions.

**More Information:** in [Fighter Management](/Documentation/FighterManagement.md).

## Equipment Management:
    @collapsible @collapsed
==================================================
**Description**: 
    - Equipment quality and upkeep directly influence fighter survival and performance, making acquisition, maintenance, and upgrades a strategic layer of the game.

**Inventory**: 
    - The player has an inventory that can store items. This is used to store items that are not currently equipped.

**Quality**: 
    - Equipment has a quality rating that directly impacts the degradation rate of the item during use.

**Upgrading**: 
    - Equipment can be upgraded by the player to improve its quality. This is done by the blacksmith and only affects the durability of the item.
    - For example: Sharpness or adding weight stones to a weapon.

**Acquisition**: 
    - Equipment can be won at the arena or purchased from the town's shop/blacksmith.

**Unlocks**: 
    - The player will unlock various rewards to either craft or buy from the town's shop/blacksmith.
    - Some equipment will only be available as rewards from events and quests.
    - Some equipment will be gated behind town upgrades or arena wins/progression.
    - Some equipment will also be gated behind reputation with the faction that owns the equipment.

**Degradation**: 
    - Equipment degrades as it either hits or is hit by an opponent in the arena.
    - The degradation rate is affected by the quality of the equipment.
    - Items will have to be repaired by the blacksmith to restore their quality.
    - The repair cost is proportional to the resources levels and quality of the item.
    - Items can be too damaged to repair and will need to be replaced outright.

**More Information:** in [Equipment Management](/Documentation/EquipmentManagement.md).

## Resource Management:
    @collapsible @collapsed
==================================================
**Description**: 
    - Town resources levels dictates the quality of the town and the events that can occur. It also gates the availability of certain features and events behind certain levels.

**Resource Levels**: 
    - The town has a set of resource levels that are used to gate other town features and events. Each resource level has a threshold that must be breached to unlock the next level.
    - Each resource level has a set of features and events that are available at that level.
    - The resources level types are:
        - Food
        - Wood
        - Metal
    - The resource levels are used to gate the availability of certain features and events behind certain levels.

**Upgrading facilities**: 
    - Upgrading the town's facilities will directly impact the town's resource levels.
    - Upgrading a building increases the experience of the resource related to it.

**Resource Level Changes**: 
    - Once resource levels reach certain thresholds the town will experience a change in the following: 
        - Entice more adventurers to sign up for the fighters guild.
        - Offer better rewards for arena wins.
        - Decrease the occurrence of negative town events.
        - Increase the quality of the town's events.
        - Make more weapons and armour available at the town's shop/blacksmith.
        - Make more consumables available at the town's apothecary.
        - Add more challenging arena fights and opponents.

**More Information:** in [Town Management](/Documentation/TownManagement.md).

## Events:
    @collapsible @collapsed
==================================================
**Description**: 
    Events are a way to add variety and depth to the game. They are triggered by traversal or interacting with interactables or characters in the town.
    Events are designed to be non-invasive and usually only show up in the Events Notification Panel.
    Some combat Events can trigger between travel locations and are the only time the player would be FORCED to interact with an event.

**Event Types**: 
    Event types are split into thre categories:
        - Combat Events: These events require the player to accept or decline a fight.
        - Dialogue Events: These events require the player to interact with a dialogue window.
        - Passive Events: These events require no interaction from the player.

**Event Changes**
    Events can be influenced by:
        - Town Upgrades
        - Faction Reputations 
        - Player's Fame level
        - Town Resource Levels
        - Previous Events
        - The path taken from one location to another.

**More Information:** in [Events](/Documentation/Events.md).

## Time Progression and Calendar System:
    @collapsible @collapsed
==================================================
**Description**: 
    Fights are scheduled and time gated by the ingame calendar system - missing them induces a negative event or penalty.
    Time progresses in real time unless the player travels to a new location or interacts with a time consuming event.
    Time is considered a currency so the player will have to manage it wisely.

**Calendar System**: 
    - The calendar system is a way to track the passage of time in the game. It is used to schedule events and fights.
    - The calendar system is a 12 month calendar with 30 days per month.
    - The date is displayed in the top bar of the UI.

**More Information:** in [Time and Calendar](/Documentation/TimeAndCallendar.md).

## Expeditions:
    @collapsible @collapsed
==================================================
**NOT IMPLEMENTED IN VERSION 1.0**
**Description**: 
    Expeditions are a way to train fighters and gain resources and equipment.
    They are triggered by the player from the Fighter Management Panel.
    They cost time to complete and your fighters can become injured.

**Expedition Types**: 
    - There are two types of expeditions:
        - Basic Expeditions: These are the default expeditions that are available to the player.
        - Special Expeditions: These are special expeditions that are available to the player. They are combat based and require the player to fight against opponents like thieves, bandits, or other factions.
    
    Basic Expeditions:
        Basic expeditions are automated, you hit a button to send your guys out on an expedition.
        They will return on their own after the stated time period or when they are injured.
        They will return with resources and equipment if they are successful.

    Special expeditions may include:
        - Clearing local bandits.
        - Raiding a nearby castle.
        - Clearing a nearby dungeon.
        - Encountering a roaming bandit party.

**More Information:** in [Expeditions](/Documentation/Expeditions.md).


## Trading:
    @collapsible @collapsed
==================================================
**NOT IMPLEMENTED IN VERSION 1.0**
**Description**: 
    - Periodic trade with non‑hostile factions provides rare resources and equipment, scaling with reputation and town development.

**Automated Trading**: 
    - Trading is an automated process that relies on reputation. The player can set a "trade frequency" and the game will automatically trade with other factions based on the trade frequency.

**Trade days**: 
    - Trade days are scheduled and time gated by the ingame clock. Event triggers before trade day can directly affect the trade quality, quantity or delay the trade.

**Trade partners**: 
    - The player can trade with other factions that are not hostile to them.

**Frequency**: 
    - As the town upgrades the frequency of trade days will increase and the quality of the trade will increase.

**More Information:** in [Trading](/Documentation/Trading.md).

## Crafting:
    @collapsible @collapsed
==================================================
**NOT IMPLEMENTED IN VERSION 1.0**
**Description**: 
    - Crafting converts rare materials into high‑value equipment and consumables, rewarding exploration, reputation, and event participation.

**Crafting Stations**: 
    - The town will have a list of crafting stations that the player can interact with to craft items such as the blacksmith and apothecary. (Hospital could likely be included - bandages and the likes)

**Resources**: 
    - The town will have a list of special resources specifically related to crafting. They are acquired through faction rewards, events or expeditions. They are consumed by the crafting process. 

**More Information:** in [Crafting](/Documentation/Crafting.md).

## Customization:
    @collapsible @collapsed
==================================================

**Player Appearance**: 
    - The player can choose their appearance when starting a new game.

**Fighter Equipment**: 
    - The player can customize their fighters equipment colours.

**Faction Name and Banner**: 
    - The player can choose the faction name and banner - which will be displayed throughout the game.

**Town Style**: 
    - The player can select a "style" for the town - this will affect the look of the town and the buildings within it. (this is only a texture change)

**Gameplay Options**: 
    - There will be various gameplay option settings to allow the player to opt in or out of certain features. These will increase/decrease the necessity of certain features. 
        - Example: Enable/Disable the "Events" completely. 
        - Example: Enable/Disable the "Expeditions" completely. 
        - Example: Enable/Disable the "Trading" completely.
        - Example: Enable/Disable the "Crafting" completely.
        - Example: Enable/Disable the "Hidden Interactables" completely.

**More Information:** in [Customization](/Documentation/Customization.md).

# Game Flow:
    @collapsible @collapsed
==================================================
A high level overview of the game flow is as follows:

**Main Menu**: 
    The player is presented with a main menu. 
    The player can: 
        - Start a new game
        - Load a save game
        - Open the settings menu
        - Explore the Extras menu
        - Exit the game

**New Game Menu**: 
    The player is presented with a new game menu. 
    This menu includes a character creator panel allows the player to:
        - Choose their faction
        - Choose their name
        - Choose their faction banner
        - Choose their player appearance

    When the player is happy with their choice they can click the "Start Game" button to start the game.
    A small cutscene will play - This can be skipped. (I do not know what will be in it yet.)

**New Game Arena Tutorial**: 
    The player is spawned in a tutorial arena scenario where they learn the arena controls and get used to the movement and combat system. 
    This will likely be framed as a training scenario put on by the faction they are a part of.
    Upon completing this the game will trigger a small cutscene explaining the story and setting of the game. (This can be skipped.)

**New Game Town Tutorial**: 
    The player is shown around the town and introduced to a couple of the main shops they will be interacting with in relation to combat. 
    The player is then shown their keep and the player is introduced to the town management system in a simplified manner.
    They are introduced to the time management system and the calendar system.

**Gameplay Loop**: 
    The player is now free to explore the town and the arena. They can train their fighters, manage their town, and compete in the scheduled arena fights. 
    They may explore the town and hover over buildings and objects to learn about their purpose and discover hidden interactables.
    They may also interact with characters in the town to learn about their story and background.

**Goals**:
    The player's goals are to:
        - Train their fighters to be the best they can be.
        - Manage their town to be the most successful they can be.
        - Compete in the arena to be the most successful they can be.
        - Achieve the highest reputation with the faction they are a part of.
        - Achieve the highest fame level they can achieve.
        - Gain as much gold as possible.
        - Unlock equipment and consumables to improve their fighters.
        - Unlock cosmetic upgrades for the town, fighters and player character.

**End State**:
The game has no "overarching" story or goal. The player is free to explore the game and the world at their own pace.
The player can achieve the goals above and the game will reward them for their efforts.
The player can also fail to achieve the goals and the game will punish them for their efforts.
The main idea is that this is replayable and that save files have a decent amount they can achieve before a new one is needed.

**More Information:** in [Game Flow](/Documentation/GameFlowDocumentation.md).
