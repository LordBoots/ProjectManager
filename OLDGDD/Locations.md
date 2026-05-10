# Index:
1. [Description](#description)
2. [Location Details](#location-details)
3. [Location Upgrades](#location-upgrades)
4. [Related Documentation](#related-documentation)


# Description:
==================================================
This document catalogs all enterable locations in the town - their features, services, and gameplay purpose.
Locations are buildings or areas that the player can enter and interact with in Location Mode.

**For Location Mode experience** (how to enter, interact, and navigate locations), see [Location Mode](/Documentation/GDD/LocationMode.md).

All locations are listed below with their description.

## Service Locations:
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Location Name     | Description                                                                                                                                             |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Keep              | Player's hub of operations, fighter housing, basic training, equipment storage                                                                          |
| Fighter's Guild   | Fighter recruitment, paid training.                                                                                                                     |
| Blacksmith        | Equipment purchase, sale, upgrade, and repair                                                                                                           |
| Apothecary        | Potion and brew creation                                                                                                                                |
| Hospital          | Fighter healing services                                                                                                                                |
| Rogues Den        | Hire rogues for espionage and theft tasks, gather information about the other factions                                                                  |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|

## Social Locations:
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Location Name     | Description                                                                                                                                             |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tavern            | Gathering place for residents and fighters. Can hire fighters                                                                                           |
| Town Square       | Popular gathering place for town residents                                                                                                              |
| People's Retreat  | Rebel bar. Source of civil uprising events. Can hire Rogues for espionage and theft tasks                                                               |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|

## Combat Locations:
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Location Name     | Description                                                                                                                                             |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Arena             | Main combat location for scheduled fights                                                                                                               |
| Street Arenas     | Smaller combat locations for random fights triggered by events or interactions with the town's residents                                                |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|


# Location Details:
==================================================
Below is detailed information for each location in the town.

## Keep:
==================================================
Location: 
    - North-west of the town center.

Description: 
    The Keep is the largest building in the town and is the player's hub of operations
    It is the largest building in the town and is the player's hub of operations.
    It is surrounded by a wall and has a mote and drawbridge.

Features:
    - Fighter quarters with dormitories and bunks
    - Can support up to 20 fighters at one time (at full upgrades)
    - Training courtyard for basic fighter training
    - Infirmary for injured fighters with personal healers.

Services:
    - Fighter Housing
    - Basic training for fighters (free, takes time)
    - Healing for injured fighters (costs resources - less with upgrades)

Synergy:
    - Acess to better healers as hospital is upgraded.
    - Training is faster as the keep is upgraded.
    - Healing is cheaper as the keep is upgraded.
    - Faster healing as Garden Nurseries are upgraded.
    - Faster healing as the Brewery is upgraded.
    - Higher food quality as Garden Nurseries are upgraded.


## Fighter's Guild:
==================================================
Location: 
    - Northeast of the town center.

Description: 
    The Fighter's Guild is a place to hire fighters to fight in the arena.
    It is a large building with a grand hall and a training area.

Features:
    - Hall for fighter recruitment and hiring.
    - Training area for fighter training.
    - Bar for social interactions with fighters.
    - Dormitories for guild aligned fighters to sleep in.

Services:
    - Fighter recruitment and hiring
    - Fighter's Guild training (costs resources, faster than basic training, chance of passive buffs)
    - Expeditions (costs resources, dangerous but give the best rewards)

Synergy:
    - Acess to better quality fighters as resource levels increase.
    - Acess to better fighters as fame increases.
    - Fighters have better chance of better starting gear based on blacksmith upgrades.

## Blacksmith:
==================================================
Location: 
    Center of the town.

Description: 
    The Blacksmith is a place to buy, sell, upgrade and repair equipment and armour.
    It is a small building with a shop interior and a forge.

Features:
    - 3D shop interior with items on display
    - Items visible on stands and display cases
    - Counter for transactions

Services:
    - Purchase equipment and weapons
    - Sell equipment
    - Upgrade equipment (improves quality/durability)
    - Repair equipment (restores durability)
    - Craft equipment (takes longer than buying, costs materials, cheaper, chance of better quality)

Synergy:
    Various factors of the blacksmiths production speed and capacity are affected by the blacksmiths building upgrades, resource levels, and the games progression.
    - Smithing speed.
    - Smithing capacity.
    - Repair time.
    - Batch repair capacity.
    - Base item quality.

## Apothecary:
==================================================
Location: 
    Center of the town.

Description: 
    The Apothecary is a place to create potions and brews.
    It is a small building with a shop interior and a crafting area.

Features:
    - Crafting stations for potion creation
    - Access to special ingredients

Services:
    - Create potions and brews
    - Access to consumables for fighters
    - Potions can provide buffs to fighters

Synergy:
    - Brew and potion quality.
    - Brew and potion stock capacity.
    - Brew and potion crafting speed.
    - Brew and potion cost.
    - Brew and potion rarity.

## Hospital:
==================================================
Location: 
    Northeast of the town center.

Description: 
    The Hospital is a place to heal fighters after fights.
    It is a mid sized building with rooms for injured fighters to rest in and
    offices for the healers.

Features:
    - Healing facilities for injured fighters
    - Medical services
    - Offices for healers

Services:
    - Heal injured fighters
    - Restore fighter health after arena battles
    - Treat fighter injuries

Synergy:
    Various factors of the hospital's healing speed and capacity are affected by the hospital's building upgrades, resource levels, and the games progression.
    - Healing speed.
    - Healing quality.
    - Healer availability.

## Tavern:
==================================================
Location: 
    Center of the town.

Description: 
    The Tavern is a popular gathering place for the town's residents and fighters.
    It is a large building with a bar and a seating area.

Features:
    - Social gathering space
    - Bar and seating areas
    - Characters and NPCs to interact with

Services:
    - Social interactions
    - Chance to hire fighters through events and interactions
    - Information gathering
    - Event triggers
    - Buy Alcoholic beverages from the bar.

Synergy:
    - More fighters as the Tavern is upgraded.
    - More events as the Tavern is upgraded.
    - More visitors as the Garden Nurseries are upgraded.
    - More visitors as the Brewery is upgraded.

## Arena:
==================================================
Location: 
    Just to the east of the Keep.

Description: 
    The Arena is a main combat location for scheduled or free fights.
    it consists of a central ring with walls and objects for cover and obstacles.
    Surrounding the arena are stands for the spectators to watch the fight.

Features:
    - 3D combat space (50 metre radius square)
    - Walls and objects for cover and obstacles
    - Traps scattered throughout
    - Spectator stands surrounding the arena
    - Grand Stand for judges and spectators
    - Player character visible in grandstand during fights
    - Opposing entrances for teams

Services:
    - Scheduled arena fights against other factions
    - Various arena types (Standard, Raid, King of the Hill, Scrap Battle)
    - Rewards: Equipment, Resources, Gold, Reputation, Unlocks

Gameplay: 
    See [Arena Mode](/Documentation/GDD/ArenaMode.md) for detailed combat information

## Rogues Den:
==================================================
Location: 
    Southeastern part of the Slums District.

Description: 
    The Rogues Den is a place to hire Rogues to help the player with tasks such as espionage and theft.
    It is a small mallitia hideout with a reception area and a back room for the Rogues to work in.
    The front room is exactly as described "a front" to hide the true nature of the business.

Features:
    - Located in the slums, home to the town's poorest residents
    - Source of organized town crime

Services:
    - Hire rogues for espionage
    - Hire rogues for theft tasks
    - Access to sabotage and manipulation services
    - Calendar manipulation services (sabotage shipments, assassinations, spying, etc.)

Synergy:
    - More visitors(info sources) as the Tavern is upgraded.
    - More events as the Rogues Den is upgraded.
    - Better rogues as the Rogues Den is upgraded.
    - Better sabotage and manipulation services as the Rogues Den is upgraded.
    - Better information gathering as the Rogues Den is upgraded.

## People's Retreat:
==================================================
Location: 
    Southeastern part of the Slums District.

Description: 
    The People's Retreat is a rebel bar located in the slums and is the source of "civil uprising" events.
    It is a small building with a bar and a seating area. It is a popular gathering place for the town's rebels.
    People here are often members of rebel aliances from abroad or from other towns or are otherwise rookies in the rebel cause.

Features:
    - Located in the slums district
    - Rebel gathering place

Services:
    - Social interactions with rebels
    - Source of civil uprising events
    - Information about town politics and factions
    - Buy Alcoholic beverages from the bar.

Synergy:
    - More visitors(info sources) as the Tavern is upgraded.
    - More events as the People's Retreat is upgraded.

## Town Square:
==================================================
Location: 
    Center of the town, in the Market District

Description: 
    A large open area in the center of the town and is a popular gathering place for the town's residents.
    It is a large square with a fountain in the center with many stalls and vendors selling cheap goods.
    It is a popular gathering place for the town's residents and is the source of many events.

Features:
    - Open public space with benches and tables.
    - Gathering place for NPCs.
    - Vendors selling cheaps goods through dialogue interactions.
 
Services:
    - Social interactions with town residents.
    - Information gathering from vendors and town residents.
    - Buy cheap goods from vendors.


# Location Upgrades:
==================================================

## Keep Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Dormitory Expansion      | House more fighters (up to 25)                              |
| 2     | Training Yard Upgrade    | Basic training is faster                                    |
| 3     | Armory Expansion         | More equipment storage                                      |
| 4     | War Room Repairs         | Repairs the war room, unlocks tactical planning features    |
| 5     | Grand Hall Repairs       | Repairs the grand hall, increases player fame gain          |
|-------|--------------------------|-------------------------------------------------------------|

## Hospital Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Bed Expansion            | Treat more fighters at once                                 |
| 2     | Medical Supplies         | Better supplies, faster healing                             |
| 3     | Expert Healer            | Reduced healing time, better recovery                       |
| 4     | Surgical Ward            | Treat more severe injuries                                  |
| 5     | Recovery Rooms           | Improved recovery time, fewer complications                 |
|-------|--------------------------|-------------------------------------------------------------|

## Blacksmith Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Crafting Efficiency 1    | Faster crafting                                             |
| 2     | Forge Expansion          | Faster crafting, more items available                       |
| 3     | Storage Expansion        | More items in stock                                         |
| 4     | Quality Improvement      | Higher quality equipment                                    |
| 5     | Crafting Efficiency 2    | Much faster crafting                                        |
|-------|--------------------------|-------------------------------------------------------------|

## Apothecary Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Cauldron Capacity 1      | Brew more potions at once                                   |
| 2     | Store Room Expansion     | More potions in stock                                       |
| 3     | Spice Rack Installation  | More potion types available                                 |
| 4     | Flask Enrichment         | Higher quality potions                                      |
| 5     | Cauldron Capacity 2      | Even more brewing capacity                                  |
|-------|--------------------------|-------------------------------------------------------------|

## Fighter's Guild Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Dormitory Expansion      | House more visiting fighters                                |
| 2     | Training Dummies         | Faster paid training                                        |
| 3     | Kitchen Staff Training   | More visitors, more fighters                                |
| 4     | Pub Delicacies           | Even more visitors and fighters                             |
| 5     | Dormitory Bed Upgrade    | Higher quality fighters stick around                        |
|-------|--------------------------|-------------------------------------------------------------|

## Tavern Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Kitchen Expansion        | More visitors attracted                                     |
| 2     | Entertainment Stage      | Events and performances, more visitors                      |
| 3     | Private Rooms            | Special events and meetings                                 |
| 4     | Famous Chef              | Major visitor increase                                      |
|-------|--------------------------|-------------------------------------------------------------|


# Related Documentation:
==================================================
- [Location Mode](/Documentation/GDD/LocationMode.md) - How to enter, interact with, and navigate locations 
- [Map Mode](/Documentation/GDD/MapMode.md) - Town navigation and travel system
- [Resource Buildings](/Documentation/GDD/ResourceBuildings.md) - Building upgrades and resource generation 
- [Events](/Documentation/GDD/Events.md) - Events that can occur in locations 
