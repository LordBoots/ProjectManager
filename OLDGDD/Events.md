# Index:
1.  [Description](#description)
2.  [Feature Toggles](#feature-toggles)
3.  [Pools](#pools)
3.  [Types and Triggers](#types-and-triggers)
4.  [Travel Triggers](#travel-triggers)
5.  [Interaction Triggers](#interaction-triggers)
6.  [Time Passed Triggers](#time-passed-triggers)
7.  [Rewards](#rewards)
8.  [User Interface](#user-interface)
9.  [Event List](#event-list)

# Description:
    @color-#3bc4d
==================================================
**Description:**
    Events are a way to add variety and depth to the game. They are triggered by traversal or interacting with interactables or characters in the town.
    Events can have positive or negative implications on the town and the player which can be permanent or temporary.
    Travel Events always have a random chance of occurring, they are not deterministically triggered.
    Various elements of the game will effect the events pool and the frequency as well as outcomes of the events.

    Events in the notification panel have a time limit to be collected and closed.
    For passive events nothing happens if you ignore them, they will just auto collect and delete themselves.
    For interaction events you will be prompted to interact with the event and choose an option. Ignoring it will skip the event and it will delete itself.
    For combat events you will be prompted to accept or decline the fight. Ignoring it will usually result in a penalty and the event will delete itself.

    Negative events are toggleable under "Events" in settings. 

# Feature Toggles:
==================================================
    - All Events: Disable/Enable the entire event system.
    - Negative Events: Disable/Enable events that have negative implications on the town and the player.
    - Travel Events: Disable/Enable travel events.
    - Interaction Events: Disable/Enable the hovering and clicking of characters and interactables.
    - Time Passed Events: Disable/Enable time passed events.

# Pools:
==================================================
**Description:**
    Event pools are the pools of events that can be triggered.
    Each location and district has a different event pool designed to fit the theme and atmosphere of the location.

**Diminishing Returns:**
    Event pools use diminishing returns.  
    This means an event that has already occurred will have a lower chance of occurring again.
    The more times an event has occurred the lower the chance of it occurring again.


**Pool Influencers:**
    Pools change based on the following factors:
    - Town Resource Levels: Food, wood, metal, special.
    - Town Upgrades: Upgrades to the town will effect the event pools and the frequency.
    - Reputation: Reputation with the faction that owns the town will effect the event pools and the frequency as well as outcomes of the events.
    - Player's Fame: Player's fame level will effect the event pools and the frequency.    
    - Previous Events: Previous events will effect the event pools and the frequency.
    - The path taken from one location to another will effect the event pools and the frequency.

# Types and Triggers:
==================================================
**Event Types:**
    Event types are split into multiple categories.
    Events can be single or multi-part events.

**Single Events:**
    A single event is an event that occurs once and is not part of a larger event chain.

**Multi-part Events:**
    A multi-part event is an event that occurs over multiple steps and is part of a larger event chain.
    They are triggered by a single event and then follow up with multiple events.
    These usually involve a follow up event that has a random chance of occurring.
    Some force secondary events to always occur.
    Some events change how other events play out or the rewards for them.

**Events Trigger Types:**
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Event Type         | Description                                                                                                                                         |
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Travel Event       | Events that occur when traveling between locations.                                                                                                 |
    | Location Event     | Events that occur when interacting with Location level interactables and Characters.                                                                |
    | Interaction Event  | Events that occur when interacting with Map level interactables and Characters.                                                                     |
    | Time Passed Event  | Events that occur when time passes.                                                                                                                 |
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
**Event Types:**
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Event Type         | Description                                                                                                                                         |
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Passive Event      | Events that require no interaction from the player.                                                                                                 |
    | Dialogue Event     | Events that require the player to interact with a dialogue window.                                                                                  |
    | Combat Event       | Events that require the player to accept or decline a fight. **Requires Guards** - see below.                                                       |
    |--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|

**Combat Events and Guards:**
    The player character is a non-combatant. Combat events (robberies, ambushes, etc.) are fought by the player's assigned Guards.
    - If the player has Guards assigned, they can choose to fight or decline.
    - If the player has NO Guards assigned, the combat option is unavailable - the event auto-resolves against the player (e.g., you are robbed).
    - Guards can be injured and their equipment degrades during combat events.
    - See [Fighter Management - Guards](/Documentation/GDD/FighterManagement.md#guards) for guard assignment details.|


# Travel Triggers:
    @collapsible @collapsed @color-#3bc4d9
==================================================
**Description:**
    Travel can trigger events when traveling between locations.

**Travel Paths:**
    Travel paths are the routes taken from one location to another.
    The town has "roads" and "paths" that actors can take to travel between locations.
    The paths are not always direct and may take the actor through different locations and districts.
    This means events can be triggered based on the path taken.
    The Location Guide Panel will show you what path will be taken and allow you to change it if you want.

**Event Pool:**
    Event pools are decided based on the travel path taken.
    The event pool is the pool of events that can be triggered.
    Each location and district has a different event pool designed to fit the theme and atmosphere of the location.
    The event pools can change based on the players progress through the game.

**Example 1 - Combat Travel Event:**
    You are inside the Fighter's Guild and you want to visit the Tavern.
    - You click on the Map icon in the Top Navigation Bar to go to Map Mode.
    - You find the "Tavern" location in the travel index on the right hand side of the screen.
    - You click on the "Tavern" location to open the Location Guide Panel.

    It tells you the path is: [current location] -> [Market District] -> [Tavern].
    - You decide the risk is low and you decide to move there by clicking the "Travel" button.
    - As the road fades to black to move there a dialogue box appears.
    - It tells you that during your pass through the market district you may encounter a thug.
    - It asks you if you're willing to try and fight them off or if you should just handover what they are asking.
    - You click to fight and are brought to a combat area representing the road they are on with your opponent standing there waiting for you.
    - You fight him and he ends up dead. You have won the fight.

    The scenario fades out and you are transported to the Tavern.
    - You receive a Notification with the title "Thugs don't learn do they?"
    - You click on the notification and a dialogue box appears with the details of the event.
    - It tells you that you have some loot you picked up off his corpse.
    - You click "collect & close" to collect the items and close the event details dialog.

**Example 2 - Passive Travel Event:**
    You are at the Tavern and you are looking around for things to interact with.
    - You click on the Map icon in the Top Navigation Bar to go to Map Mode.
    - You find the "Keep" location in the travel index on the right hand side of the screen.
    - You click on the "Keep" location to open the Location Guide Panel.
    
    A "Location Guide" panel opens giving you basic info on the location with a small picture of the location.
    - It tells you how long it will take to travel to the location and that the path is: [Tavern] -> [Market District] -> [Keep].
    - You click the "Travel" button and the screen fades to black and you are transported to the keep.
    
    Now you're at the Keep, a new Notification appears named "Risky Fighter Rumors" in the Notifications Panel.
    - You click on the notification and a dialogue box appears with the details of the event.
    - It tells you there are rumors of a new fighter hanging around the tavern that refuses to affiliate with the fighters guild but they are known to be a good fighter.
    - You click "OK" to close the dialogue box.

    You return to the Tavern to check it out.
    - You see a fighter sitting at the bar and notice he's interactable.
    - You click him and a dialogue window appears asking if you want to hire him.
    - You notice other dialogue options like "Why are you non-affiliated?" and "What are you doing here?" but ignore them.
    - You click the "Heard you're looking to be hired?" option.
    - He says yes and you click "Hire" to hire him.
    - He is added to your fighter's quarters and is available to be part of your arena team.


# Interaction Triggers:
    @collapsible @collapsed @color-#3bc4d9
==================================================
**Description:**
    Interacting with a character or interactable can trigger events.

**Event Pool:**
    Each location and district has a different event pool designed to fit the theme and atmosphere of the location.
    The event pools can change based on the players progress through the game.

**Example 1 - Dialogue Event:**
    You enter the Tavern.
    - You see a group of adventurers drinking and talking.
    - You hover over the group and see an icon appear dictating you can join the conversation.
    - You click and your player model fades out, then back in, sitting next to the group.

    A dialogue window appears with choices for conversation.
    - You choose a few options and the conversation continues.
    - One of the options that appears is "Hire me as a fighter".
    - You click yes and the fighter disappears after a small dialog box appears confirming the hire.

    Later, you return to your keep, you notice this fighter has been added to your fighter's quarters and is available to be part of your arena team.
    - You look at his stats and see he is a good fighter.
    - You check his gear and see he comes with some nice stuff.

**Example 2 - Interaction Event:**
    You are in Map Mode and you are looking around the map.
    - You see there is a cart nearby that looks unoccupied.
    - You hover your mouse over it and it highlights in a yellow glow indicating it is an interactable.
    - You click the cart and a small dialog box appears asking if you want to rob the cart because it looks unoccupied.
    - You click Yes and your character fades out from your current location signifying you are on your way to the cart.
    
    As your character fades in (signifying arriving at the cart), the cart's owner also fades in next to the cart.
    - You receive a notification in the notifications panel, it says "The owner beat you to the cart".
    - You click on the notification and a dialogue appears explaining to you that this has happened, it gives you the option to wait and see if they leave again or to abandon the attempt.
    - Because you spent time getting there, you now have to weigh the pros and cons of waiting or abandoning the attempt.
    - Abandoning would mean walking back to where you were or the next location with no reward but time spent. Staying would cost time but the "sunk cost" might make it worth it.
    - You click to abandon the attempt.

**Example 3 - Interaction Chain Event:**
    You enter the Blacksmith.
    - You're browsing the goods by hovering over the items with icons above them and looking at their item cards.
    - You notice a customer enters and approaches the counter to talk to the blacksmith.
    - You take little notice and continue browsing the items. 
    
    When the customer leaves you hear the sound of a coin purse hitting the floor as the door shuts behind them.
    - You rotate your camera to look around to see if you can see a purse, there it is - on the floor by the door.
    - You hover over the purse and it is outlined in a yellow glow indicating it is an interactable.
    - You click the purse out of curiosity.
    
    An Event Notification appears in the Events Notification Panel titled "Lost and found - Coin Purse".
    - You click on the event and it opens the Event Details Dialog for that event.
    - It tells you a brief summary of the customer dropping their coin purse and that you snatched it up.
    - It gives you a list of items that were acquired - this time it's just a few gold coins.
    - You click "collect & close" to collect the items and close the event details dialog. 

    Later, you return to the Blacksmith and a customer walks in and approaches you.
    - They ask if you've seen a coin purse they lost earlier as they recognize you were there when it dropped.
    - You're prompted to make a choice - return the purse or keep it.
    - You chose to lie and say you haven't seen it.
    - Because of your high Charisma you are able to convince them that you haven't seen it and they leave.
    
    An Event Notification appears in the Events Notification Panel titled "Crisis averted - Coin Purse Theft".
    - You click the notification and it opens the Event Details Dialog for that event.
    - it tells you the outcome and has dialogue depicting the character wondering if this was a mistake.
    - You click "Close" to close the event details dialog. 

# Time Passed Triggers:
    @collapsible @collapsed @color-#3bc4d9
==================================================
**Description:**
    Time is always moving in game and events can be triggered based on the passage of time.
    Some happen regardless, some happen when you stand in a location for a set amount of time.

**Event Pool:**
    Each location and district has a different event pool designed to fit the theme and atmosphere of the location.
    The event pools can change based on the player's progress through the game and previous events.

**Example 1 - Time Passed Chain Event:**
    You are at the Tavern looking around for things to interact with.
    - While you do so a new notification appears in the Events Notification Panel titled "A Call from Across The Room".
    - You click the notification and it opens the Event Details Dialog titled "A Call from Across The Room".
    - It tells you that you hear a voice calling out to you from across the bar.
    - It asks if you should turn to talk to them or if you should ignore them.
    
    You click to talk to them and the camera pans around to show a man sitting alone in the corner.
    - He asks you if you are the factions overseer and you confirm you are.
    - He asks you if you are looking for a new fighter.
    - You tell him you are and he says he has just the man for you.
    - He says he will send you the details of the fighter and you can decide if you want to hire them.
    - You close the dialogue window and carry on with your day.

    Next time you visit the keep a notification appears in the Events Notification Panel titled "New Fighter Available".
    - You click the notification and it opens the Event Details Dialog for that event.
    - It tells you that you have a new fighter available to hire.
    - It gives you a list of the fighter's stats and equipment. You notice they are decent but not the best but you realize you can always train them up later.
    - You click "Hire" to hire the fighter and they are told they are added to your fighter's quarters.
    - You click "Okay" to close the event details dialog.

**Example 2 - Time Passed Event:**
    You are at the Keep.
    - You notice a notification in the Events Notification Panel titled "Missing gear".
    - You click the notification and it opens the Event Details Dialog for that event.
    - It tells you that your retainer has lost some gear and is looking for it and that it could take some time to find.
    - they apologize profusely. 
    - The panel tells you that one of your items has been removed from your inventory.
    - You click "Okay" to close the event details dialog.
    
    Later, you return from town to the Keep.
    - You notice a notification in the Events Notification Panel titled "Gear Found".
    - You click the notification and it opens the Event Details Dialog for that event.
    - It tells you that your retainer has found your gear and that it has been returned to your inventory.
    - You click "Okay" to close the event details dialog.


# Rewards:
    @collapsible @collapsed @color-#3bc4d9
==================================================
**Event Reward Types:**
    |--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Reward Type        | Description                                                                                                                                        |
    |--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
    | Equipment          | Weapons and armour.                                                                                                                                |
    | Resources          | Food, wood, metal, special.                                                                                                                        |
    | Gold               | Gold is the currency of the game and can be used to purchase equipment, resources, and other items.                                                |
    | Reputation         | Reputation with the faction that owns the town will effect the event pools and the frequency as well as outcomes of the events.                    |
    | Fame               | Player's fame level will effect the event pools and the frequency.                                                                                 |
    | Event Holds        | Reduces the chance of certain events occuring again for a set amount of time.                                                                      |
    | Event Plenties     | Increases the chance of certain events occuring again for a set amount of time.                                                                    |
    |--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|

**Reward Pool:**
    The reward pool is a grouping of rewards that can be awarded to the player.
    Some Events share reward pools, others have their own unique reward pools designed for that event.
    Rewards can be influenced by a number of game metrics.

# User Interface:
    @collapsible @collapsed @color-#3bc4d9
==================================================
**Description:**
These panels are used to display events to the player.
There are two Levels of Events Panels:
    - The Events Notification Panel
    - The Events Details Panel

The Event Details Dialog is the result of clicking an event.

**Events Notification Panel:**
    The Events Notification Panel is located at the bottom right corner of the screen.
    It is designed to be non invasive and only show events that have occurred recently only.
    It is a notification stream setup and can be clicked to open a larger Events Log Panel.
    Events happen when traveling, randomly when standing in locations other than the keep and when interacting with characters or interactables in the town.   
    It only shows the last 5 events to save space.
    They appear as "Event Cards" - Banner style cards with a name and icon.

**Events Log Panel:**
    The Events Notification Panel only shows a set amount of events to save space - this panel solves for this by showing all current events and their details.
    
    This panel is opened by clicking on the Events Notification Panel or an event within it.
    It is also accessible through the Top Navigation Bar.
    It is a scrolling list of events that can be clicked on to perform the same actions the Events Notification Panel does.
    It is just a larger version of the Events Notification Panel.

**Events Details Dialog:**
    The Events Details Dialog is a small window that shows the details of an event.
    It is opened by clicking on an event in the Events Log Panel or an event in the Events Notification Panel.
    It shows the details of the event including the event name, description, rewards, and any consequences.
    If it is a Combat Event it will show the combat scenario and buttons to accept or decline the fight.

**Event Notification Types:**
(Same as Event Types)
    |-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
    | Notification Type       | Description                                                                                                                             |
    |-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
    | Passive Notification    | This requires the player to do nothing. This just shows the details and any implications of the event.                                  |
    | Dialogue Notification   | This will open a small window that the player will have to interact with a conversation or decision dialogue.                           |
    | Combat Notification     | This will open a small window that the player will have to accept or decline a fight.                                                   |
    |-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|

**Interaction with Events UI:**
    Clicking an event will bring up a small dialogue that shows the event details and any actions required.
    The interaction with the dialogue is as follows:
    - Passive Notification the player can click "OK" to close the dialogue and accept any rewards or consequences. Rewards or consequences as well as a description of the event will be shown.
    - Dialogue Notification the player will have to interact with the dialogue window to continue. The dialogue window will have a conversation or decision dialogue. Most of these can be dismissed but some penalties may occur.
    - Combat Notification the player will have to accept or decline the fight. If they accept the fight they will be brought to a "custom" combat area designed for the event.
    designed for the event.


# Event List:
    @collapsible @collapsed @color-#3bc4d9
==================================================
This will eventually contain a table of events by type and location.
These would be the actual events not general overviews of the events.
This will eventually be an external file and all that will remain here is a link to it.

For example:
**Event Table:**
|-------------------------------------------------------------|-------------------------|----------------------------|-------------------------------------------|
| Event Name                                                  | Event Type              | Location/District          | Link to Event Documentation               |
|-------------------------------------------------------------|-------------------------|----------------------------|-------------------------------------------|
| A Bandit cuts you off                                       | Combat Event            | Slums                      | [A Bandit Cuts You Off](/Documentation/EventDefinitions/#a-bandit-cuts-you-off) |
| You found a coin purse on the floor                          | Interaction Event       | Tavern                     | [You Found a Coin Purse on the Floor](/Documentation/EventDefinitions/#you-found-a-coin-purse-on-the-floor) |
|-------------------------------------------------------------|-------------------------|----------------------------|-------------------------------------------|