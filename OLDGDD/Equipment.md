# Index:
1. [Description](#description)
2. [Inventory](#inventory)
3. [Weapon types](#weapon-types)
4. [Armor types](#armor-types)
5. [Quality](#quality)
6. [Degradation](#degradation)
7. [Repair](#repair)
8. [Upgrades](#upgrades)
9. [Item stats](#item-stats)
10. [Unlocks](#unlocks)
11. [Acquisition](#acquisition)
12. [User Interface](#user-interface)
13. [Related Documentation](#related-documentation)

# Description:
==================================================
Each fighter needs equipment to compete in the arena. Equipment affects the players reach, damage, speed, and defense capabilities.
The player has to acquire, maintain, and upgrade equipment to be able to compete in the arena.
The player must equip the fighters with equipment before they can send them to the arena - or not, your choice.

Inventory can be managed from:
    - The Fighter Management Panel
    - The Player Character Panel
    - Shop Interfaces

# Inventory:
    @collapsible @collapsed
==================================================
The player has an inventory that can store items.

The inventory is always visible in the fighter management panel and player character panel.
The inventory will be able to be filtered by type and quality. Items can be dragged and dropped into the fighter equipment slots.

**more information** can be found in the [User Interface Documentation](/Documentation/UserInterface.md)


# Equipment Slots:
    @collapsible @collapsed
==================================================
Each fighter has a number of equipment slots that can accept different types of equipment.
The equipment slots are always visible in the fighter management panel, surrounding the character viewport. (area of the UI shoing a 3D view of the fighter)
Equipment is split between weapons and armor.

There are 6 weapon slots and 5 armor slots in total:
    |--------------------------------|----------------------------------------------------------------------------------------------------------|
    | Slot Name                      | Can Hold                                                                                                 |
    |--------------------------------|----------------------------------------------------------------------------------------------------------|
    | Main Hand                      | Short swords, daggers, spears, etc.                                                                      |
    | Shield Hand                    | Shields.                                                                                                 |
    | Two Handed                     | Great axes, greatswords and polearms.                                                                    |
    | Bow                            | Bows, Crossbows, Throwing Spears. Two handed always.                                                     |
    | Thrown                         | Throwing knives, axes, darts, etc - can be thrown with any other weapon equipped. (always available)     |
    |--------------------------------|----------------------------------------------------------------------------------------------------------|
    | Helmet                         | Metal Helmets, Leather Helmets, Cloth Helmets.                                                           |
    | Chest                          | Metal Chestplates, Leather Chestplates, Cloth Chestplates.                                               |
    | Legs                           | Metal Leggings, Leather Leggings, Cloth Leggings.                                                        |
    | Feet                           | Metal Boots, Leather Boots, Cloth Boots.                                                                 |
    | Hands                          | Metal Gauntlets, Leather Gauntlets, Cloth Gauntlets.                                                     |
    |--------------------------------|----------------------------------------------------------------------------------------------------------|

Equipment in slots will not appear in the inventory.

**more information** on the UI for equipment slots can be found in the [User Interface Documentation](/Documentation/UserInterface.md)

# Weapon Types:
    @collapsible @collapsed
==================================================
**One hand Bladed Weapons:** 
    - Short Sword (Main hand slot)
    - Long Sword (Main hand slot)
    - Rapier (Main hand slot)
    - Scimitar (Main hand slot)
    - Axe (Main hand slot)
    - Spear (Main hand slot)

**Two hand Bladed Weapons:** 
    - Great Sword (Two hand slot)
    - Great Axe (Two hand slot)
    - Great Polearm (Two hand slot)

**Blunt one hand Weapons:**
    - Hammer (Main hand slot)
    - Mace (Main hand slot)
    - Club (Main hand slot)

**Blunt two hand Weapons:** 
    - Great Hammer (Two hand slot)
    - Great Mace (Two hand slot)
    
**Thrown Weapons:** 
    - Throwing Knife (Thrown slot)
    - Throwing Axe (Thrown slot)
    - Dart (Thrown slot)
    - Rock (Thrown slot)
    
**Ranged Weapons:**
    - Bow (Bow slot)
    - Crossbow (Bow slot)
    - Throwing Spear (Bow slot)

**Defensive Weapons:**
    - Buckler (Shield slot)
    - Kite Shield (Shield slot)
    - Square Shield (Shield slot)

# Armor Types:
==================================================
**Metal Armor:**
    - Plate Mail
    - Chainmail 
    - Scale Mail 

**Leather Armor:**
    - Leather Body 
    - Hardened Leather  
    - Leather Scale Mail 

**Cloth Armor:**
    - Cloth Robes
    - 

# Quality:
==================================================
Equipment has a quality rating that directly impacts the degradation rate of the item during use.
Higher quality equipment will degrade slower.
Higher quality equipment will be harder to aquire, upgrade and repair.

**Quality tiers:**
    |-------|--------------------------|
    | Tier  | Quality Name             |
    |-------|--------------------------|
    | 1     | Shoddy                   |
    | 2     | Fine                     |
    | 3     | Exceptional              |
    |-------|--------------------------|


**Implications:**
    - Better equipment will last longer and be more effective in a fight. Meaning scavenging will be a less frequent occurrence.
    - This means that the player will have to unlock better equipment to compete in the arena more effectively.
    - As services upgrade they will have an easier time acquiring better equipment.


# Degradation:
==================================================
Equipment degrades as it is used and must be repaired to restore its quality.
Each hit the weapon takes will degrade it by a certain amount based on the quality of the weapon and how hard the hit is.

**Degradation rate:**
    - The degradation rate is affected by the quality of the equipment.
    - Example: "Shoddy Short Sword" has a degradation rate of 2% per hit. but "Exceptional Short Sword" has a degradation rate of 0.5% per hit. making them last 4 times longer in a match.
    - During expeditions the degradation will be calculated differently. Expeditions are more dangerous and the equipment will degrade faster.

**Implications:**
    - If a players weapon degrades mid fight, they will have to go without that weapon or scavange the arena for a new one.
    - Better equipment will last longer and be more effective in a fight. Meaning scavenging will be a less frequent occurrence.
    - This means that the player will have to constantly repair and replace equipment to maintain their fighters in the arena.

# Repair:
==================================================
Equipment can be repaired by the blacksmith in the town.
The repair cost is proportional to the quality of the item and the amount of degradation it has as ell as the service upgrades the blacksmith/town has.

**Costs:**
    - Early game repairs will be quite expensive as the blacksmith is quite inefficient and low on supplies.
    - The repairs cost time and resources.
    - The repair cost is proportional to the resources levels and quality of the item.
    - The repair cost is also affected by the degradation of the item.

**Blacksmith building upgrades:**
    - Blacksmith upgrades will reduce the repair cost of the equipment and the repair time.

**Implications:**
    - Repairing costs time and resources, if the player does not have one or the other they might have to go into a fight with a worse weapon or without one all together.


# Upgrades: 
==================================================
Equipment can be upgraded by the blacksmith in the town.
The upgrades cost time and resources.
The upgrade cost is proportional to the resources levels and quality of the item.

**Types of weapon upgrades:**
    - "Sharpness": This will increase the damage of the weapon. - random chance of becoming blunt after a set number of hits.
    - "Burnished": This will increase the damage of the weapon. - random chance of becoming brittle after a set number of hits.
    - "Weight Stones": This will buff the weight of a weapon until the stones fall off. - random chance of falling off after a set number of hits.
    - "Hardening": Temporarily buff the durability of the item for a set number of hits. - random chance of wearing off after a set number of hits.

    Bladed weapons can have the following upgrades:
        - "Hardening" - the blade is tempered, increasing its durability.
        - "Sharpness" - the blade is sharpened, increasing its damage.
        - "Weight Stones" - the blade is weighted, increasing its weight.
        - "Grip Wrapping" - the blade is wrapped in a grip material, increasing its damage.

    Blunt weapons can have the following upgrades:
        - "Hardening" - the blunt weapon is fire hardened, increasing its durability.
        - "Burnished" - the blunt weapon is burnished making denser, increasing its damage.
        - "Weight Stones" - the blunt weapon is weighted, increasing its weight.
        - "Grip Wrapping" - the blunt weapon is wrapped in a grip material, increasing its damage.

**Types of armor upgrades:**
    - "Hardening": Temporarily buff the durability of the item for a set number of hits. - random chance of wearing off after a set number of hits.
    - "Padding": Add rugged lining to the armor to increase the defense of the armor. - this upgrade is permanent and does not wear off.


# Item stats:
==================================================
Equipment has a set of stats based on physical properties.

**Armor Stats:**
    |------------------|-------------------------------------------------------------------------------------------------|
    | Stat Name        | Description                                                                                     |
    |------------------|-------------------------------------------------------------------------------------------------|
    | Defense          | The defense of the armor. Represents "Coverage" of the armor.                                   |
    | Material         | The material of the armor. Represents how well the armor protects against types of damage.      |
    | Durability       | The durability of the armor. Represents how fast the armor will degrade as it is used.          |
    |------------------|-------------------------------------------------------------------------------------------------|

**Weapon Stats:**
    |------------------|-------------------------------------------------------------------------------------------------|
    | Stat Name        | Description                                                                                     |
    |------------------|-------------------------------------------------------------------------------------------------|
    | Damage           | The damage of the weapon. Represents the base damage of the weapon.                             |
    | Weight           | The weight of the weapon. Directly affects swing speed.                                         |
    | Material         | The material of the weapon. Represents how well the weapon protects against types of damage.    |
    | Durability       | The durability of the weapon. Represents how fast the weapon will degrade as it is used.        |
    |------------------|-------------------------------------------------------------------------------------------------|

**Implications:**
    - The weight of the weapon affects the speed and mass of the weapons, therefore affecting the damage of the weapon
    - The material of the weapon affects the damage of the weapon.
    - The durability of the weapon affects the damage of the weapon.
    


# Acquisition:
    @collapsible @collapsed
==================================================
**Basics:**
    - Equipment can be acquired from the town's shop/blacksmith, the arena, events and expeditions.

**Blacksmith:**
    - The blacksmith can craft equipment, this takes longer than buying.
    - The blacksmith shop will sell equipment but it has a limited stock and is not always available.

**Arena:**
    - The arena will reward equipment as a reward for winning a fight.

**Events and Expeditions:**
    - Some events and expeditions will reward equipment as a reward for completing the event or expedition.
    - These are sparing so they feel rare and special.

# User Interface:
    @collapsible @collapsed
==================================================

## Fighter Management Panel:
    @collapsible @collapsed
==================================================
    - The fighter management panel is the main panel for managing the fighters. It is the main UI for the equipment management system.
    - It is available in the top navigation bar.
    - This section is a stub:
    - **More information** can be found in the [User Interface Documentation](/Documentation/UserInterface.md)

## Shops:
    @collapsible @collapsed
==================================================
    - The shops are the places where the player can buy and sell equipment (Among other things).
    - They are found on the map as buildings for the most part.
    - Shops are displayed as 3D locations with the items for sale being real 3D models that the player can inspect and interact with.
    - This section is a stub:
    - **More information** can be found in the [User Interface Documentation](/Documentation/UserInterface.md)

## Inventory:
    @collapsible @collapsed
==================================================

**Description:**
    - The inventory is a list of items that the player can equip. All items the player owns will be displayed here.

**Access:**
    - it is visible in the fighter management panel.
    - it is visible in the player character panel.
    - Both of these can be accessed from the top navigation bar.

**Features:**
    - The inventory is displayed in a list layout.
    - The inventory is filterable by type and quality.
    - The inventory is searchable by name and description.
    - Items can be dragged and dropped into the equipment slots or the other way around. The equipment slots will be highlighted when an item is dragged over them.
    - Items can be dragged and dropped into the "destroy" Icon to destroy the item. The destroy icon will be highlighted when an item is dragged over it.

**More information** can be found in the [User Interface Documentation](/Documentation/UserInterface.md)

## Equipment Card:
    @collapsible @collapsed
==================================================

**Description:**
    - The equipment card shows when an item is hovered in inventory or equipment slots.
    - It shows the details of the item.

**Features:**
    - On a weapon card it displays:
        - Icon
        - Name
        - Description
        - Weapon Type
        - Quality
        - Material
        - Weight
        - Price
    - On an armor card it displays:
        - Icon
        - Name
        - Description
        - Armor Type
        - Quality
        - Material
        - Weight
        - Price
**More information** can be found in the [User Interface Documentation](/Documentation/UserInterface.md)
