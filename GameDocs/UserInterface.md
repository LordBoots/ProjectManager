# Index:
1. [Description](#description)
2. [Main Menu](#main-menu)
3. [Pause Menu](#pause-menu)
4. [Top Bar](#top-navigation-bar)
5. [Player Character Panel](#player-character-panel)
6. [Fighter Management Panel](#fighter-management-panel)
7. [Shops](#shops)
8. [Inventory](#inventory)
9. [Equipment Card](#equipment-card)
10. [Arena HUD](#arena-hud)
11. [Events Notification Panel](#events-notification-panel)
12. [Location Index](#location-index)
13. [Player Portrait](#player-portrait)
14. [Settings Menu](#settings-menu)
15. [Related Documentation](#related-documentation)

# Description:
==================================================
The user interface is the main way the player interacts with the game. It is the main way the player navigates the game and manages the game.
The interface is plit into three main types:
- Map Mode UI, Location Mode UI - 3D Locations with 2D UI overlays
- Pure 2D UI - Fighter Management Panel, Player Character Panel, Inventory
- Arena UI - HUD for the arena combat. only shows combat relevant information.

The UI behaves differently between each of these modes.

# Main Menu:
    @collapsible @collapsed
==================================================
**Description:**
    This is the title screen of the game.
    It features a stylized 3D view of the Arena, soaked with blood, discarded items and a foggy background.
    The Scene will have 3D torches burning in the background and a 3D fire pit in the center of the arena.
    It will be a night time scene with a full moon and stars visible.

    The player may navigated from here to any of the provided buttons to start a new game, load a saved game, open the settings menu or exit the game entirely.

**Features:**
    - The main menu contains the following elements:
        - Title - "Dynasty: Arena"
        - Background Scene - A stylized 3D view of the Arena, soaked with blood, discarded items and a foggy background.
        - New Game Button - Starts a new game.
        - Load Game Button - Loads a saved game.
        - Settings Button - Opens the settings menu.
        - Extras Button - Opens the extras menu. (contains credits and other information about the game and the developers.)
        - Exit Button - Exits the game.

**Availability:**
    - The main menu is available at all times. It is the first thing the player sees when the game starts.
    - They can return to it at any time from the pause menu.


# Pause Menu:
    @collapsible @collapsed
==================================================
**Description:**
    This is the pause menu which gives acess to important options for the player and allows them to put the game down for a moment.

**Features:**
    - The pause menu contains the following elements:
        - Resume Button - Resumes the game.
        - Settings Button - Opens the settings menu.
        - Main Menu Button - Returns to the main menu.
        - Exit Button - Exits the game.

**Availability:**
    - The pause menu is available at all times..
    - They can return to it at any time from the game by pressing the escape key.
    - The only time it is not avalable is when the game is in the main menu.


# Top Bar:
    @collapsible @collapsed
==================================================
**Description:**
    - The top bar is the main navigation bar for the game. It is the main way the player navigates the UI and manages the game.

**Features:**
    - The top bar contains the following elements:
        - The player's name and title
        - The current time and date in game
        - The current location
        Buttons for:
            - Character Panel
            - Town Management Panel
            - Fighter Management Panel
            - Pause Menu
            - Settings Menu

**Availability:**
    - The top bar is available in Map Mode and Location Mode.
    - in Arena Mode the top bar is replaced by the Arena HUD.

**Access:**
    - The top bar is accessed from Location Mode and Map Mode.
    - t is always at the top of the screen.


# Player Character Panel:
    @collapsible @collapsed
==================================================
**Description:**
    - The player character panel is the main panel for the player character. It is the main way the player manages the player character.

**Features:**
    - The player character panel contains the following elements:
        - The player's name and title
        - The current time and date in game
        - The current location
    - Allows the player to:
        - View their character's stats
        - View their Inventory (equipment, weapons, armor, etc.)
        - Change the Characters clothing
        - See the Player Character model

**Availability:**
    - The player character panel is available in Map Mode and Location Mode.

**Access:**
    - The player character panel is accessed from the top navigation bar or via Hotkey (default: I)


# Fighter Management Panel:
    @collapsible @collapsed 
==================================================
**Description:**
    - The fighter management panel is the main panel for managing the fighters. It is the main way the player manages the fighters.

**Features:**
    - The fighter management panel contains the following elements:
        - The fighter's name and title
        - The current time and date in game
        - The current location

**Layout:**
    The fighter management panel is split into five main sections:
    - The top section is where the navigation bar we would usually see goes as well as the fighter's name and title.
    - The left hand side of the panel is the fighter's stats and buffs.
    - The right hand side of the panel is the players inventory.
    - The center section is the viewport to see the 3D fighter.
    - The bottom section is for more details and for acessing training options.

**Top Navigation Bar:**
    The top navigation bar we would usually see throughout the game is here as well.
    It allows the player to navigate to the player character panel, the town management panel, the settings menu, the pause menu and the main menu.

**Fighter's Stats and Buffs:**
    The fighter's stats are displayed as a list of stats with their current values and training progress if any.
    Buffs are displayed as icons that give more information when hovered over.

**Fighter Viewport:**
    The center section of the panel is the viewport to see the 3D fighter.
    It is a 3D view of the fighter and is displayed as a viewport that the player can rotate.
    The fighter is displayed as a 3D model that the player can inspect and interact with.
    The fighter is displayed in a room depicting the Training Courtyard of the Keep.

    Framing this viewport are the equipment slots for the fighter.
    Each equipment slot if a square icon that the player can drag and drop items into.

**Availability:**
    - The fighter management panel is available in Map Mode and Location Mode.
    - It is also avaliable at the beginning of a fight/arena.

**Access:**
    - The fighter management panel is accessed from the top navigation bar or by hotkey (default: F)

# Inventory:
    @collapsible @collapsed
==================================================
**Description:**
    - The inventory is the main way the player manages their equipment, weapons, armor, etc.
    - It is a list syle interface- meaining all items are shown one after another, vertically.
    - It is not a standalone menu, it is shown along-side:
        - The fighter management panel
        - The player character panel
        - The shops

**Features:**
    The inventory contains the following elements:
        - Tab style categories for seperating items into different categories:
            - Weapons: all weapons the player owns
            - Armor: all armor the player owns
            - Consumables: all consumables the player owns
        - A list of all items the player owns
        - A search bar to search for items
        - A filter to filter items by variaous properties like quality, type, name, etc.

**Access:**
    The inventory is accessed from the fighter management panel or the player character panel.
    It is also visible in the shops.

**Usage:**
    In Fighter Management Panel:
        - Items can be dragged and dropped into the equipment slots or the other way around.
        - Items can be dragged and dropped into the "destroy" Icon to destroy the item.
    In Player Character Panel:
        - Items can be dragged and dropped into the equipment slots or the other way around.
        - Items can be dragged and dropped into the "destroy" Icon to destroy the item.
    In Shops:
        - Items in shops are displayed around the room as 3D models that the player can inspect and interact with.
        - Items can be dragged into the inventory from the shop to bypass the confirmation dialog.
        - Items can be dragged from the inventory onto the shops counter to sell them.

**More information** can be found in the [Equipment Management Documentation](/Documentation/EquipmentManagement.md)

# Events Notification Panel:
    @collapsible @collapsed
==================================================
**Description:**
    - The Events Notification Panel is a non-invasive notification system that displays events that have occurred in the game.
    - It is designed to inform the player of events without interrupting their gameplay flow.
    - Events are displayed as banner-style cards with a name and icon.

**Location:**
    - The Events Notification Panel is located at the bottom right corner of the screen.
    - It overlays on top of the 3D view in Map Mode and Location Mode.

**Features:**
    - The Events Notification Panel contains the following elements:
        - Event Cards: Banner-style cards displaying event name and icon
        - Notification Stream: Events appear in a vertical list, newest at the top
        - Click to Expand: Clicking the panel or any event card opens the Events Log Panel
    - It only shows the last 5 events to save screen space.
    - Events automatically appear when triggered by:
        - Traveling between locations and districts
        - Interacting with characters or interactables in the town
        - Time passing while in locations (other than the keep)
        - Random occurrences based on town state

**Event Card Display:**
    - Each event card shows:
        - Event name
        - Event icon/visual indicator
        - Brief visual indicator of event type (passive, dialogue, combat)
    - Cards are color-coded or styled to indicate event type and importance.

**Availability:**
    - The Events Notification Panel is available in Map Mode and Location Mode.
    - It is not available in Arena Mode (events don't occur during combat).
    - The panel can be toggled on/off in settings if the player wants to disable event notifications.

**Access:**
    - The Events Notification Panel is always visible when events occur.
    - Clicking on the panel or any event card opens the Events Log Panel for more details.
    - The panel can be minimized or dismissed, but events will still be accessible through the Events Log Panel.

**Time Limits:**
    - Events in the notification panel have a time limit to be collected and closed.
    - Passive events will auto-collect and delete themselves if ignored.
    - Interaction events (dialogue, combat) will remain until the player interacts with them or they time out (which may result in penalties).

**More Information:** in [Events Documentation](/Documentation/Events.md).

# Events Log Panel:
    @collapsible @collapsed
==================================================
**Description:**
    - The Events Log Panel is a comprehensive view of all current events in the game.
    - It provides a larger, scrollable interface for managing and reviewing events.
    - This panel solves the space limitation of the Events Notification Panel by showing all events and their details.

**Layout:**
    - The Events Log Panel is a larger overlay window that appears when opened.
    - It contains a scrolling list of all current events.
    - Events are displayed in chronological order (newest first) or can be sorted by type.

**Features:**
    - The Events Log Panel contains the following elements:
        - Event List: A scrollable list of all current events
        - Event Cards: Each event displayed as a card with name, icon, and brief description
        - Filter Options: Filter events by type (Passive, Dialogue, Combat) or status
        - Search Bar: Search for specific events by name
        - Sort Options: Sort events by time, type, or importance

**Event Information:**
    - Each event in the list shows:
        - Event name
        - Event icon
        - Event type indicator
        - Brief description or summary
        - Time/date when the event occurred
        - Status (unread, read, completed, expired)

**Interaction:**
    - Clicking on an event in the list opens the Events Details Dialog.
    - Events can be marked as read or dismissed from this panel.
    - The panel can be closed and reopened without losing event information.

**Availability:**
    - The Events Log Panel is available in Map Mode and Location Mode.
    - It is accessible at any time through the Top Navigation Bar.
    - It can also be opened by clicking on the Events Notification Panel.

**Access:**
    - The Events Log Panel is accessed by:
        - Clicking on the Events Notification Panel
        - Clicking on any event card in the Events Notification Panel
        - Using the "Events" button in the Top Navigation Bar
        - Hotkey (if assigned in settings)

**More Information:** in [Events Documentation](/Documentation/Events.md).

# Events Details Dialog:
    @collapsible @collapsed
==================================================
**Description:**
    - The Events Details Dialog is a window that displays the complete information about a specific event.
    - It is opened when the player clicks on an event from either the Events Notification Panel or the Events Log Panel.
    - The dialog provides all relevant details, rewards, consequences, and interaction options for the event.

**Layout:**
    - The Events Details Dialog is a modal window that appears centered on the screen.
    - It overlays the game view and pauses interaction with the game world until closed or an action is taken.
    - The dialog size and layout adapt based on the event type and content.

**Features:**
    - The Events Details Dialog contains the following elements:
        - Event Title: The name of the event
        - Event Description: Full narrative description of what happened
        - Event Visual: Icon or image representing the event
        - Rewards Section: Lists all rewards gained from the event (if any)
        - Consequences Section: Lists any consequences or effects (if any)
        - Action Buttons: Buttons to interact with the event based on its type

**Event Type Specific Content:**
    Passive Events:
        - Shows event description and any rewards or consequences
        - Contains an "OK" or "Close" button to dismiss
        - Rewards are automatically collected when the dialog is closed
        - No player interaction required beyond acknowledging the event
        - If the event is not acknowledged in time, it will auto-resolve and the consequences will be applied.

    Dialogue Events:
        - Shows event description and dialogue text
        - Contains dialogue options for the player to choose from
        - May have multiple dialogue branches or conversation trees
        - Contains "Continue" or "Next" buttons to progress through dialogue
        - Some dialogue events can be dismissed, but may incur penalties
        - Choices made in dialogue affect event outcomes

    Combat Events:
        - Shows event description and combat scenario information
        - Displays opponent information (if available)
        - Contains "Accept Fight" and "Decline Fight" buttons
        - If accepted, the player is transported to a custom combat area
        - If declined, may show consequences or penalties
        - Some combat events may have time limits to respond

**Rewards Display:**
    - Rewards are displayed in a clear list format
    - Shows icons and quantities for:
        - Equipment (weapons, armor)
        - Resources (food, wood, metal, special)
        - Gold
        - Reputation changes
        - Fame changes
        - Event holds or plenties
    - Rewards are collected when the dialog is closed or the "Collect" button is clicked

**Consequences Display:**
    - Consequences are displayed similarly to rewards
    - Shows negative effects such as:
        - Resource losses
        - Gold losses
        - Reputation penalties
        - Item losses
        - Temporary debuffs or effects

**Availability:**
    - The Events Details Dialog is available whenever an event is clicked.
    - It appears in Map Mode and Location Mode.
    - It can interrupt gameplay for important events (combat events, critical dialogue).

**Access:**
    - The Events Details Dialog is accessed by:
        - Clicking on an event card in the Events Notification Panel
        - Clicking on an event in the Events Log Panel
    - The dialog must be interacted with before it can be closed (for dialogue and combat events).

**More Information:** in [Events Documentation](/Documentation/Events.md).