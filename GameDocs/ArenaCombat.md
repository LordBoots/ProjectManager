# Index:
1. [Description](#description)
2. [Camera](#camera)
3. [Team Size](#team-size)
4. [Arena Layout](#arena-layout)
5. [Arena Objectives](#arena-objectives)
6. [Weapon Slots](#weapon-slots)
7. [Player Controls](#player-controls)

# Description:
==================================================
Arena combat is the main gameplay loop of the game. It is a simple top down/isometric style combat system. The player controls one of their selected fighters and fights against other fighters. The combat is relatively simple. Fighters are assigned equipment by the player or randomly by the game. The player can choose to fight with a specific fighter or let the game choose for them.
The player character itself never participates in the combat. The player fights as one of the fighters on the team.


# Camera: 
==================================================
The Camera angle is top-down-tilted. The camera follows the player from above, allows for zooming in and out and rotates with the player.


# Team Size: 
==================================================
1-5 fighters per team. This may be expanded in the future to allow for larger teams.


# Arena Layout:
==================================================
The arena is a 3D space that the fighters can move around in. The arena is a square with a radius of 50 metres. There are walls and objects throughout the arena to provide cover and obstacles. The arena is designed to be a "balanced" arena - the fighter should not have an advantage or disadvantage based on the arena size. It should provide cover from ranged attacks and provide obstacles for melee fighters. 
Traps of various kinds are scattered throughout the arena to provide additional challenges and opportunities for the fighters.
The Arena is surrounded by stands for the spectators to watch the fight. Spectators are vulnerable to stray attacks but no penalties are applied to the player for killing spectators. In fact, the crowd will cheer for the player if they kill a spectator.
There are opposing entrances to the arena for the teams. Battles will almost always start with the enemies entering the arena from the opposing entrance.
There is a Grand Stand at the outer edge of the arena for the judges and spectators to watch the fight. 
The player character can be seen in the grandstand during fights.


# Arena Types:
==================================================
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|
|Arena Type            | Objectives                                                               | Rewards                                                 |
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|
|Standard              | Kill or knock out the opposing team.                                     | Equipment, Resources, Gold, Reputation, Unlocks         |
|Raid                  | One team must try to steal the loot from the other team.                 | Equipment, Resources, Gold, Reputation, Unlocks         |
|King of the Hill      | The team that can hold the hill for the longest time wins.               | Equipment, Resources, Gold, Reputation, Unlocks         |
|Scrap Battle          | Opponents have to find equipment in the arena to fight with.             | Equipment, Resources, Gold, Unlocks                     |
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|

Arena types will have more information in the future.


# Arena Traps:
==================================================
**Description:**
    - Traps are scattered throughout the arena to provide additional challenges and opportunities for the fighters.
    - Traps can be triggered by the fighters or by the game.
    - Traps can be used to provide additional challenges and opportunities for the fighters.

**Trap Types:**
    |----------------------|---------------------------------------------------------------------------------------------------|
    |Trap Type            | Description                                                                                        |
    |----------------------|---------------------------------------------------------------------------------------------------|
    |Fire Trap            | A trap that sets the area on fire.                                                                 |
    |Smoke Trap           | A trap that releases smoke to blind the fighters.                                                  |
    |Poison Trap          | A trap that poisons the area.                                                                      |
    |Spiked Trap          | Walls, floors and angled baricades with spikes.                                                    |
    |Animal Trap          | A trap that releases an animal to attack the fighters.                                             |
    |Kinetic Trap         | A trap that releases a weighted object to swing or launch at the fighters. (pendulum, cannon, etc) |
    |Sticky Trap          | A trap that releases a sticky substance to bind the fighters.                                      |
    |---------------------|----------------------------------------------------------------------------------------------------|

**Trigger Types:**
    |---------------------|---------------------------------------------------------------------------------------------------|
    |Trigger Type         | Description                                                                                       |
    |---------------------|---------------------------------------------------------------------------------------------------|
    |Pressure Plate       | A plate that triggers when stepped on.                                                            |
    |Lever                | A lever that triggers when pulled.                                                                |
    |Button               | A button that triggers when pressed.                                                              |
    |Switch               | A switch that triggers when flipped.                                                              |
    |Hit Trigger          | A trigger that is hit by a weapon or a thrown object. (rope cut, etc)                             |
    |---------------------|---------------------------------------------------------------------------------------------------|


# Weapon Slots:
==================================================
Fighters have 6 weapon slots that each take a specific weapon type.

**Main Hand**: Short swords, daggers, spears, etc.
**Off Hand**: daggers, short swords, etc.
**Shield Hand**: Shields.
**Two Handed**: Great axes, greatswords and polearms.
**Bow**: Bows. Two handed always. 
**Thrown**: Throwing knives, axes, darts, etc - can be thrown with any other weapon equipped. (always available)

# Player Controls:
    @collapsible @collapsed
==================================================
The controls are similar to a twin stick shooter. The player uses the left stick/WASD to move the character and the right stick/mouse to look around. Attacks are "thrown" in the direction the player is looking.

There is a "crosshair" to aim the character at.

It is easier to reference controls as Playstation Controller mappings. - because the keys are only used on ONE controller type so it can't be confused with another positions on other controller types.
For instance many controllers have an A and B button - but only the playstation uses geometric shapes for the buttons.

## Default Controls:  
    @collapsible
(Can be changed in settings)
--------------------------------

|----------------------------------------------------------------------------------------------------------------
|Action      | Keyboard & Mouse            | Controller          | Description 
|------------|-----------------------------|---------------------|-----------------------------------------------
|Move        | WASD                        | Left Stick          | Movement direction - standard twin stick shooter control scheme.
|Look        | Mouse                       | Right Stick         | Look direction - standard twin stick shooter control scheme. Rotates the camera and the player character.
|Attack      | Left Mouse Button           | R1                  | Primary attack - can be held down to charge the attack. Release to execute.
|Block       | Right Mouse Button          | L1                  | Active block - blocks while held down - can be changed to toggle in settings
|Dodge       | Double tap direction        | Cross Button        | on controller: dodges in the direction currently held or defaults to backwards
|Throw       | E                           | R2                  | Throws a thrown weapon if equipped and ammo is available
|Bow         | Q                           | L2                  | Swap to or from the bow - if not equipped, the bow will be equipped automatically.
|Swap Weapon | 1-2                         | D-pad right/down    | Swap melee weapon  - 1/right swaps to mainhand + offhand(if equipped) - 2/down swaps to two handed(if equipped)
|Kick        | F                           | Square Button       | Player performs a kick attack - If blocking a shield bash will be performed instead.
|Zoom        | Scroll Wheel                | D-pad up/down       | Zooms in and out - Used to get a better view of the action.
|Throw Weapon| G                           | D-pad left          | Throws the primary weapon.

**More information** can be found in the [Player Controls Documentation](/Documentation/PlayerControls.md)