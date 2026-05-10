# Index:
1. [Description](#description)
2. [Building Types](#building-types)
3. [Resource Buildings](#resource-buildings)
4. [Service Buildings](#service-buildings)
5. [Dual-Purpose Buildings](#dual-purpose-buildings)
6. [Resource System](#resource-system)
7. [Upgrades](#upgrades)
   - [Resource Building Upgrades](#resource-building-upgrades)
   - [Service Building Upgrades](#service-building-upgrades)
8. [Interaction](#interaction)
9. [Related Documentation](#related-documentation)


# Description:
==================================================
This document covers all upgradeable resource buildings in the town.
Resource buildings generate "supply" for their resource type. They can only be interacted with from Map Mode and cannot be entered.
They have levels that can be upgraded from Map Mode to increase their supply contribution.

# Resource Buildings:
==================================================
Resource buildings generate "supply" for their resource type. 
They can only be interacted with from Map Mode and cannot be entered.
Each resource generator has a different supply contribution and level thresholds.

# Resource System:
==================================================
The town has 4 resource level types: Food, Wood, Metal, and Special.
Resource levels gate town features and events. This extends progression and prevents instant max upgrades.
Resource levels are increased by upgrading resource buildings.

How Supply Works:
---------------------
    Supply functions like experience points - it accumulates permanently and never decreases and is never spent.
    - When a building is upgraded, it adds a fixed amount of supply to its resource type.
    - Total accumulated supply determines the resource level.
    - Each resource type (Food, Wood, Metal, Special) tracks its own supply total independently.

Resource Levels:
---------------------
    - Each resource type has 5 levels.
    - Level is determined by comparing total resource building supply against thresholds.
    - Each level provides specific bonuses and unlocks.

Resource Types:
---------------------
The effects are not explicit - many systems will draw from the resource levels to determine their behavior.
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Type         | Effects                                                                                                                                            |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Food         | Affects visitor count to the town                                                                                                                  |
| Wood         | Affects crafting speed, reduces wood cost for crafting                                                                                             |
| Metal        | Affects crafting speed, reduces metal cost, increases equipment quality                                                                            |
| Special      | Herbs, horses, brews (potions and tinctures)                                                                                                       |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------|

Resource Level Thresholds:
---------------------
When total supply reaches these values, the resource level increases:
|--------|-----------|-------------------------------------|
| Level  | Supply    | Example                             |
|--------|-----------|-------------------------------------|
| 1      | 0         | Starting level                      |
| 2      | 100       | ~2-3 building upgrades              |
| 3      | 200       | ~4-5 building upgrades              |
| 4      | 300       | ~6-7 building upgrades              |
| 5      | 500       | All related buildings fully upgraded|
|--------|-----------|-------------------------------------|

Level Benefits:
---------------------
    Higher resource levels:
    - Entice more fighters to the Fighter's Guild (higher chance for better stats and equipment on visitors)
    - Offer better arena rewards
    - Decrease negative event frequency
    - Increase event quality
    - Unlock more equipment at Blacksmith
    - Unlock more consumables at Apothecary
    - Add more challenging arena opponents

## Food Buildings:
|---------------|----------------------------------------------------------------------|
| Building      | Description                                                          |
|---------------|----------------------------------------------------------------------|
| Mill          | Processes grain into flour for the town                              |
| Bakery        | Produces baked goods for the town                                    |
| Farm          | Grows crops and raises livestock                                     |
|---------------|----------------------------------------------------------------------|

## Wood Buildings:
|---------------|----------------------------------------------------------------------|
| Building      | Description                                                          |
|---------------|----------------------------------------------------------------------|
| Lumber Mill   | Processes logs into usable lumber                                    |
| Woodshop      | Crafts wooden goods and furniture                                    |
|---------------|----------------------------------------------------------------------|

## Metal Buildings:
|---------------|----------------------------------------------------------------------|
| Building      | Description                                                          |
|---------------|----------------------------------------------------------------------|
| Mine          | Extracts ore from the earth                                          |
| Foundry       | Smelts ore into usable metal                                         |
|---------------|----------------------------------------------------------------------|

## Special Buildings:
|------------------|----------------------------------------------------------------------|
| Building         | Description                                                          |
|------------------|----------------------------------------------------------------------|
| Stable           | Houses horses, affects expedition speed and visitor count            |
| Brewery          | Produces beers and ales, some with special effects                   |
| Garden Nurseries | Grows rare plants and herbs for the Apothecary                       |
|------------------|----------------------------------------------------------------------|

## Multi-Resource Buildings:
|---------------|----------------------------------------------------------------------|
| Building      | Description                                                          |
|---------------|----------------------------------------------------------------------|
| Docks         | Transport hub - contributes to ALL resource types                    |
|---------------|----------------------------------------------------------------------|

# Upgrades:
==================================================
All upgrades are permanent and functional - they do not change building appearance.
Resource building upgrades permanently add supply to the town's resource levels.
Service building upgrades improve the services they provide.
All buildings are synergistic in that one building upgrade can affect a completely different building.

When designing the upgrades we need to ensure that the upgrades are balanced, the sums match the expected totals and the upgrades are synergistic.

Upgrade Process:
---------------------
    - Upgrades are performed from Map Mode by clicking on the building
    - The info panel shows current upgrade tier, supply contribution, and next upgrade requirements
    - Upgrades may require: resource level thresholds, gold, time

**Note:** Upgrade lists are still being finalized. Below are the current plans.


## Resource Building Upgrades:
==================================================
### Mine Upgrades (Metal):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Supply Increase |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Cart Repairs             | Mine cart repaired, faster mining                           | +10             |
| 2     | Expansion 1              | Mine expanded, more metal supply                            | +30             |
| 3     | Expansion 2              | Further expansion                                           | +40             |
| 4     | Cart Expansion           | More mine carts available                                   | +20             |
| 5     | Expansion 3              | Major expansion, also speeds Blacksmith                     | +50             |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Total |                          |                                                             | 150             |

Synergistic Effects:
---------------------
- T4 upgrade: Blacksmith base item quality is increased.
- T5 upgrade: Blacksmith repair and crafting speed is increased.

### Foundry Upgrades (Metal):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Supply Increase |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Cart Repairs             | Foundry cart repaired, faster forging                       | +20             |
| 2     | Pots Expansion           | More pots for forging                                       | +30             |
| 3     | Load Capacity            | Larger loads per pot                                        | +50             |
| 4     | Storage Expansion        | More storage, also speeds Blacksmith                        | +60             |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Total |                          |                                                             | 160             |

Synergistic Effects:
---------------------
- T4 upgrade: Blacksmith base item quality is increased.
- T5 upgrade: Blacksmith repair and crafting speed is increased.

### Lumber Mill Upgrades (Wood):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Supply Increase |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Repairs                  | Mill repaired, faster logging                               | +10             |
| 2     | Saw Quality Upgrade      | Better saws, more output                                    | +30             |
| 3     | Expansion 1              | Mill expanded                                               | +40             |
| 4     | Saw Quantity Increase    | More saws in operation                                      | +50             |
| 5     | Expansion 2              | Major expansion, also speeds Woodshop                       | +60             |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Total |                          |                                                             | 190             |

Synergistic Effects:
---------------------
- T5 upgrade: Town Upgrades are fater.

### Woodshop Upgrades (Wood):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Supply Increase |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Repairs                  | Woodshop repaired, faster crafting                          | +10             |
| 2     | Furniture Crafting       | Unlocks furniture, enables other building upgrades          | +30             |
| 3     | Expansion                | Woodshop expanded                                           | +40             |
| 4     | Cart Expansion           | More delivery capacity                                      | +50             |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Total |                          |                                                             | 130             |

Synergistic Effects:
---------------------
- T5 upgrade: Town Upgrades are cheaper and faster.

### Docks Upgrades (All Resources):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Supply Increase |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Repairs                  | Docks repaired, faster transport                            | +10 (all)       |
| 2     | Dredging                 | Waters cleared of obstructions                              | +20 (all)       |
| 3     | Expansion                | More dock capacity                                          | +30 (all)       |
| 4     | Store Rooms              | Storage facilities added                                    | +40 (all)       |
|-------|--------------------------|-------------------------------------------------------------|-----------------|

Synergistic Effects:
---------------------
- T1 upgrade: Town Upgrades are cheaper and faster.
- T2 upgrade: Town Visitor count is increased. (Increased event, fighter, and NPC count)
- T4 upgrade: Blacksmith sells a wider range of items.
- T5 upgrade: Blacksmith repair and crafting speed is increased. Blackmisth stock is increased.

### Stable Upgrades (Special):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Effect          |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Stall Repairs            | More horses, faster expeditions, more visitors              | Service         |
| 2     | Training Facilities      | Horse cycling, much faster expeditions                      | Service         |
| 3     | Nutrition Upgrade        | Better fed horses, less rest needed                         | Service         |
|-------|--------------------------|-------------------------------------------------------------|-----------------|

### Brewery Upgrades (Special):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Effect          |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Repairs                  | Brewery repaired, faster brewing                            | Service         |
| 2     | Basement Expansion 1     | More brew storage                                           | Service         |
| 3     | Barrel Expansion         | More barrels, faster brewing                                | Service         |
| 4     | Basement Expansion 2     | Even more storage                                           | Service         |
|-------|--------------------------|-------------------------------------------------------------|-----------------|

### Garden Nurseries Upgrades (Special):
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| Tier  | Upgrade Name             | Description                                                 | Effect          |
|-------|--------------------------|-------------------------------------------------------------|-----------------|
| 1     | Plot Expansion 1         | More herbs generated                                        | Service         |
| 2     | Plot Expansion 2         | More rare herbs generated                                   | Service         |
| 3     | Expert Gardener          | Better quality/yield, improves Apothecary potions           | Service         |
| 4     | Rare Plant Collection    | More variety, more potions at Apothecary                    | Service         |
|-------|--------------------------|-------------------------------------------------------------|-----------------|


## Location Upgrades:
==================================================

### Keep Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Dormitory Expansion      | House more fighters (up to 25)                              |
| 2     | Training Yard Upgrade    | Basic training is faster                                    |
| 3     | Armory Expansion         | More equipment storage                                      |
| 4     | War Room Repairs         | Repairs the war room, unlocks tactical planning features    |
| 5     | Grand Hall Repairs       | Repairs the grand hall, increases player fame gain          |
|-------|--------------------------|-------------------------------------------------------------|

### Hospital Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Bed Expansion            | Treat more fighters at once                                 |
| 2     | Medical Supplies         | Better supplies, faster healing                             |
| 3     | Expert Healer            | Reduced healing time, better recovery                       |
| 4     | Surgical Ward            | Treat more severe injuries                                  |
| 5     | Recovery Rooms           | Improved recovery time, fewer complications                 |
|-------|--------------------------|-------------------------------------------------------------|

### Blacksmith Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Crafting Efficiency 1    | Faster crafting                                             |
| 2     | Forge Expansion          | Faster crafting, more items available                       |
| 3     | Storage Expansion        | More items in stock                                         |
| 4     | Quality Improvement      | Higher quality equipment                                    |
| 5     | Crafting Efficiency 2    | Much faster crafting, also speeds Foundry                   |
|-------|--------------------------|-------------------------------------------------------------|

### Apothecary Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Cauldron Capacity 1      | Brew more potions at once                                   |
| 2     | Store Room Expansion     | More potions in stock                                       |
| 3     | Spice Rack Installation  | More potion types available                                 |
| 4     | Flask Enrichment         | Higher quality potions                                      |
| 5     | Cauldron Capacity 2      | Even more brewing capacity                                  |
|-------|--------------------------|-------------------------------------------------------------|

### Fighter's Guild Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Dormitory Expansion      | House more visiting fighters                                |
| 2     | Training Dummies         | Faster paid training                                        |
| 3     | Kitchen Staff Training   | More visitors, more fighters                                |
| 4     | Pub Delicacies           | Even more visitors and fighters                             |
| 5     | Dormitory Bed Upgrade    | Higher quality fighters stick around                        |
|-------|--------------------------|-------------------------------------------------------------|

### Tavern Upgrades:
|-------|--------------------------|-------------------------------------------------------------|
| Tier  | Upgrade Name             | Description                                                 |
|-------|--------------------------|-------------------------------------------------------------|
| 1     | Kitchen Expansion        | More visitors attracted                                     |
| 2     | Entertainment Stage      | Events and performances, more visitors                      |
| 3     | Private Rooms            | Special events and meetings                                 |
| 4     | Famous Chef              | Major visitor increase                                      |
|-------|--------------------------|-------------------------------------------------------------|


# Interaction:
==================================================
Map Mode Only:
    - Hover: Shows info card (name, resource type, level, supply)
    - Click: Opens info panel with upgrade options

Info Panel shows:
    - Building name and description
    - Resource type
    - Current upgrade tier
    - Current supply contribution
    - Next upgrade requirements
    - Upgrades list


# Related Documentation:
==================================================
- [Map Mode](/Documentation/GDD/MapMode.md) - Map Mode, districts, navigation 
- [Locations](/Documentation/GDD/Locations.md) - Location details and services 
- [Location Mode](/Documentation/GDD/LocationMode.md) - Location Mode experience 
- [User Interface](/Documentation/GDD/UserInterface.md) - Building interaction UI 
