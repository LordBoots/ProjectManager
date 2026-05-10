# Index:
1. [Description](#description)
2. [Entering Locations](#entering-locations)
3. [Exiting Locations](#exiting-locations)
4. [Interaction in Locations](#interaction-in-locations)
4. [Example Gameplay](#example-gameplay)
5. [Related Documentation](#related-documentation)

# Description:
==================================================
Location Mode is when a player clicks on a location and is transported to that area. It provides a zoomed-in view of the location with interactive elements where players access services, interact with NPCs, purchase items, and hire fighters.
It is a sub-mode of Map Mode.

For the catalog of all locations (what each location offers), see [Locations](/Documentation/GDD/Locations.md).

Visual Presentation:
    - Same 3D map as Map Mode but zoomed in and an EnterableLocation is instantiated and setup during a transition.
    - If it is an interior, some of the exterior will be visible.
    - View is from a slanted top-down perspective
    - Items and interactables are displayed as 3D models that can be inspected

UI Elements:
    - Top Bar: Same as Map Mode - Panel links and general information
    - Inventory Panel: Visible on the right side in shop locations
    - Events Notification Panel: Displays events that have occurred in the location

Example Locations:
    - The Blacksmith
    - The Fighter's Guild
    - The Tavern
    - The Library


# Entering Locations:
==================================================
From Map Mode:
    - Click on a location or use the Navigation Index
    - A popup appears showing:
        - Location name and description
        - Travel time to the location
        - Route information
    - Click "Travel" to go to the location
    - Right-click for "Travel Now" to bypass the popup

Transition:
    - The player is "teleported" to the location with a fade effect
    - Game time advances based on travel distance
    - Events can trigger during travel

Exiting:
    - Clicking a Door OR "Exit Location" button will return the player to the town overview.

Implementation Summary:
-------------------------
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

# Exiting Locations:
==================================================
    When the player clicks a Door OR "Exit Location" button.
    The transition works by:
    - Fading in the overlay to hide the location and block out the view.
    - The EnterableLocation is destroyed.
    - The MapBuilding is shown using it's internal show_building() function.
    - The player is returned to the town overview outside the location.
    - The overlay is removed and the player is able to see and interact with the town overview.

# Interaction in Locations:
==================================================
## Shop Buying Interaction:
Hovering over items brings up item cards showing:
    - Item name and description
    - Stats and properties
    - Pricing (if applicable)
    - Quality information

Clicking an item will:
    - The item appears on the shop counter
    - A confirmation dialog appears
    - Confirm to purchase, coins are deducted

Dragging an item onto the counter will:
    - Show the item on the counter for purchase
    - Open a confirmation dialog to purchase the item

## Shop Selling Interaction:
Dragging an item from inventory onto the counter will:
    - Show the item on the counter.
    - Show the current value of the counter items above the shop owners head.
    - Show a "Sell All" button.

## NPC Interaction:
NPCs that can be talked to have a chat symbol above their head.
NPCs can be interacted with by clicking:
    - DialogueTree windows appear for conversations with the NPC.
    - Interactions can trigger events.

Hireable characters (fighters in Guild/Tavern):
    - Have a symbol above their head
    - Clicking opens a DialogueTree window to hire the fighter

# Events in Locations:
==================================================
Events use the same event system as the main game including the same user interface.

Events can trigger when:
    - Interacting with characters or objects
    - Time passes while in the location
    - Entering or leaving the location

Events appear in the Events Notification Panel.


# Example Gameplay:
==================================================

## The Blacksmith:
    Buying Items:
    - You enter the blacksmith and see a 3D view from a slanted top-down perspective.
    - Your inventory is visible on the right side of the screen.
    - Items are displayed on stands and cases with symbols above them.
    - Hover over an item to see its item card with details and pricing.
    - Click an item to purchase - it appears on the counter with a confirmation dialog.
    - Confirm to add it to your inventory and deduct coins.
    Selling Items:
    - You drag an item from your inventory onto the counter.
    - You see the item appear on the counter, above the shop owners head is the current value of the counter.
    - You drag another item from your inventory onto the counter and watch the sum above the shop owners head increase.
    - Next to the shop oqner you see a button to "Sell All".
    - You click it and the items dissapear in a puff and the coins are added to your inventory.

## Fighter's Guild:
    Hiring Fighters:
    - You enter and see fighters hanging out in the guild hall, pub, sleeping areas, training areas.
    - You see some people walking around with a symbol above their head.
    - Hover over a person to see their Fighter Card with stats and pricing.
    - You click to hire - a confirmation dialog appears.
    - You accept and the fighter is added to your Keep and is available to be part of your arena team.
    Training Fighters:
    - You enter the training area and see a few fighters training with their trainers.
    - You see a trainer with a symbol above their head.
    - You click to train and a light wight version of the fighters panel appears.
    - You flick thoough your fighters to find the one you want to train.
    - On the bottom of the panel is options for traiing time and cost.
    - You click "Train", the window closes and the fighter starts it's training.
    Buying Alcohol:
    - Same as the tavern.

## Tavern:
    Hiring Fighters:
    - You enter and see a bar with a counter and a few people drinking and talking.
    - You notice one of them is wearing armor and has a sword on their belt. They have a chat symbol above their head.
    - You click to talk to them and a dialogue window appears.
    - You navigate a dialogue tree that culminates in the option to "Hire" the fighter.
    - You click "Hire" and the fighter is added to your Keep and is available to be part of your arena team.
    Buying Alcohol:
    - You approach the bar and click the bar owner.
    - A dialogue window appears.
    - You navigate a dialogue tree that culminates in the option to "Buy" alcohol.
    - A few bottles of alcohol are placed on the counter in front of you.
    - You hover over the bottles and a tooltip appears showing the effects and pricing.
    - You click to purchase the alcohol and it is added to your inventory.
    General Interactions:
    - You walk into the tavern and see a few people drinking and talking.
    - You approach one with a chat symbol above their head and a dialogue window appears.
    - You ask if anything interesting is happening in the town.
    - They say they heard about a new fighter that is looking to be hired.
    - You ask if they know where to find them.
    - They say they heard they have been seen wandering the market district.
    - You thank them and they go back to their drinks.
    Info Gathering:
    - You approach a shady man at the back of the tavern.
    - You click to talk to him and a dialogue window appears.
    - He greets you and says it's been a while.
    - You ask if he's heard any rumblings about the other teams plans for sabotage.
    - He says they have been talking about blocking a shipment of goods arriving in town.
    - You ask where this is supposed to take place.
    - He tells you it's going to happen at the docks.
    - You thank him, pay him some coins and he disappears into the shadows.

# Related Documentation:
==================================================
- [Locations](/Documentation/GDD/Locations.md) - Complete catalog of all locations and their services 
- [Map Mode](/Documentation/GDD/MapMode.md) - Town navigation and travel system 
- [Resource Buildings](/Documentation/GDD/ResourceBuildings.md) - Building upgrades and resource generation 
- [Events](/Documentation/GDD/Events.md) - Events that can occur in locations 
