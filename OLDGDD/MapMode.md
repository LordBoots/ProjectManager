# Index:
1.  [Description](#description)
2.  [Town Structure](#town-structure)
3.  [Travel System](#travel-system)
4.  [Buildings](#buildings)
5.  [Resources](#resources)
6.  [Events](#events)
7.  [Customization](#customization)
8.  [Related Documentation](#related-documentation)


# Description:
==================================================
Map Mode is the top-down 3D town overview where the player navigates the town, manages building upgrades, and manages fighters. 
The player views the town from above - they are not inside any building or location.
The town gives the player something to do while waiting for scheduled arena fights. It functions like a point-and-click adventure game with a scrollable/zoomable 3D map and UI overlay.
A full day/night cycle is applied to the town. Time ticks constantly and is accelerated by traveling and performing actions.

In this mode the player can:
    - Navigate the town
    - Manage building upgrades
    - Manage fighters
    - Encounter events

Visual Layout:
---------------
    - The 3D view takes up the entire screen
    - UI elements overlayed: Top bar, player portrait, events notification panel, time/date, navigation index
    - The Navigation index allows teleporting to locations or framing areas for a better view. (allows for finding hidden locations and items)

Controls:
---------------
    - Scroll/Pan: Arrow keys, WASD, or mouse drag, controller sticks (default controls can be changed in settings)
    - Zoom: Mouse wheel, controller d-pad up/down (default controls can be changed in settings)

Time Passing:
---------------
    - Time passes in real-time unless the player travels, interacts with an event, or participates in the arena
    - When time jumps forward, the player sees the time advancing in the top bar
    - Time does not pass if paused
    - Events can trigger during time passing

Exploration:
---------------
    - The player can pan around freely
    - Hovering over interactable objects highlights them with a symbol
    - Some interactables are well hidden - rewards for attentive players, never critical content

# Town Structure:
==================================================
The town is a medium-sized Medieval town with a keep, fighter's guild, blacksmith, apothecary, hospital, and marketplace amongst decorative buildings. 
The town is small with a population of 500.

There are three main areas of the town:
    - The Keep District: The player's hub of operations.
    - The Market District: The central hub for common services - minimizes travel time for frequent activities.
    - The Slums District: Home to the town's poorest residents. Source of crime and civil unrest.

The outer edges of the town are:
    - The Docks District: Transport hub for goods and people.
    - The Lumber District: Wood production area.
    - The Farms District: Food production area.
    - The Mine District: Metal production area.


# Travel System:
==================================================
Location Guide Popup:
    When clicking a location, a "Location Guide" window shows:
    - Location name and description
    - Travel time
    - Option to travel or cancel

Travel Execution:
    - The player is transported to the location with a fade transition
    - Game time advances based on route distance from current to destination location.
    - Events can trigger during travel based on: route taken, resource levels, faction reputations.
    - Events are less likely to trigger on shorter routes. This means the player can "leap-frog" over events by taking shorter routes in the early game at cost of transition time.

Quick Travel:
    Right-click a location or index entry to bypass the popup with "Travel Now".
    This will travel to the location instantly while still advancing game time based on the route distance from current to destination location.

Implementation Summary:
    When the player clicks a location, the "Location Guide" window is opened.
    Once the travel transaction is complete, the guide is closed and the player is transported to the location.
    The transition works by:
    - Fading in an overlay over the map to block out the view.
    - Placing an occusion culling cube over the location to block all outer objects from the view. (performance optimization)
    - Place a Black voilumetric fog around the location to make the missing objects less visible and give anice transition from "void" to "location".
    - The MapBuilding is hidden using it's internal hide_building() function.
    - The EnterableLocation is instantiated and setup.
    - The player is transported to the location at the "entrance node" of the location.
    - The overlay is removed and the player is able to see and interact with the location.
This leaves just the building and a small part ofthe exterior world visible.


# Buildings:
==================================================
The town has enterable locations and non-enterable resource buildings. 
All buildings are upgradeable.

**Building Types:**
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Building Type        | Description                                                                                                                                    |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Enterable Location   | Enterable buildings that provide services. Clicking travels to them and enters Location Mode.                                                  |
| Resource Building    | Resource generators. Only interactable from Map Mode for upgrades. Cannot be entered.                                                          |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------|

# Upgrade System:
==================================================
The town has upgradeable buildings of the following types:
    - Resource Building (Non-Enterable Resource Generators)
    - Service Buildings (Enterable Locations that offer services or events)

The town has 4 resource levels (Food, Wood, Metal, Special).
Each Resource has 5 internal levels that are determined by the supply of the resource.
Resource levels gate town features and events. Upgrading buildings increases supply, which determines resource levels.
Building upgrades at certain teirs also offer other benefits.

Example UI Display:
Wood: Level 1/5 (110/500)
Metal: Level 2/5 (230/500)
Food: Level 2/5 (210/500)
Special: Level 4/5 (420/500)

See [Resource Buildings](/Documentation/GDD/ResourceBuildings.md) for full details on supply, thresholds, and level benefits.

# Interaction System:
==================================================
The player can interact with buildings in Map Mode.

Buildings:
    Clicking a building will open the Building Guide popup.
    The Building Guide popup shows:
    - Building name and description
    - Current upgrade tier
    - Current supply contribution (experience points)
    - Upgrades list showing completed and available upgrades
    - Hovering an item in the upgrade list shows a tooltip with the upgrade name, description, and requirements
    - Travel button to the location when applicable

NPCs:
    Clicking an NPC will open a dialogue tree with the NPC.
    The player will then be able to navigate it and it's various dialogue branches.

Items:
    Clicking an item will trigger an events in the notification panel.
    Clicking the notification will give details about the item scenario and options to interact with it.
    This allows for risky item interactions that can be dangerous or rewarding.

Objects:
    Objects are interactive props that can be interacted with.
    Hovering over them will highlight them with a yellow glow.
    They are othewrwise ambiguous and can be used to create interesting interactions or secrets.
    Clicking an object will trigger an events in the notification panel OR play it's own sequence.

# Events:
==================================================
Events add variety and depth. They are triggered by travel, interaction, or time passing.
Events are displayed in the Events Notification Panel and are non-invasive.
Players can click events in the notification panel to open the Event Details Dialog.
This is a larger panel that shows any details about the event, it's status, and options to interact with it.

Event Triggers:
    - Moving between locations
    - Interacting with characters or objects
    - Time passing

**More Information:** in [Events](/Documentation/GDD/Events.md).


# Day/Night Cycle:
==================================================
The day/night cycle is applied to the town. it is kept in sync with the time system.
The time of day is displayed in the top bar.
"Epoch" is this universe's "year" marker.

# Customization:
==================================================
Not planned until later. May even be skipped entirely.

Future Features (Post 1.0):
    - Choose looks for specific buildings
    - Upgrade furniture in upgradeable locations
    - The player chooses a town style at the beginning of a new game (texture change only - possibly some minor prop placement changes).
    - Flags and banners display the player's chosen faction banner.
    - Guards and Town officials are dressed in the player's chosen faction colors and often adorn symbols of the faction.


# Related Documentation:
==================================================
| Document | Description |
|----------|-------------|
| [Buildings](/Documentation/GDD/Buildings.md) | Building types, upgrades, resource system |
| [Location Mode](/Documentation/GDD/LocationMode.md) | Location Mode experience and interaction |
| [Locations](/Documentation/GDD/Locations.md) | All enterable locations and their services |
| [User Interface](/Documentation/GDD/UserInterface.md) | All UI panels and elements |
| [Events](/Documentation/GDD/Events.md) | Event types, triggers, consequences |
| [Time and Calendar](/Documentation/GDD/TimeAndCalendar.md) | Time system, scheduled fights |
| [Map Mode Progress](/Documentation/Tracking/MapModeDevelopmentProgress.md) | Development status |
