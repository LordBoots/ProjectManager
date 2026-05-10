# Index:
1. [Description](#description)
2. [Camera](#camera)
3. [Team Size](#team-size)
4. [Arena Layout](#arena-layout)
5. [Arena Types](#arena-types)
6. [Arena Traps](#arena-traps)
7. [Downed State & Retrievers](#downed-state--retrievers)
8. [Weapon Slots](#weapon-slots)
9. [Player Controls](#player-controls)
10. [Arena UI](#arena-ui)

# Description:
==================================================
Arena combat is the main gameplay loop of the game. It is a top-down/isometric style combat system where the player controls one of their selected fighters against opposing teams.

**Core Combat:**
    - The player controls one fighter from their Arena Team - If the player controlled fighter goes down, they are placed in control of the next fighter in the team.
    - Combat is visceral but tactical - positioning, timing, and target selection matter
    - Fighters can be downed but not instantly killed - retrievers create rescue windows
    - Equipment, stats, and team composition all affect outcomes

**Player Character:**
    - The player character (Region Manager) never participates in combat directly
    - They watch from the grandstand during fights
    - The player fights AS one of the fighters on the team
    - This is thematically included for "command mode" that will be added as a feature later.

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
The ACTUAL ARENA LAYOUT WILL BE DESIGNED LATER.

# Arena Types:
==================================================
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|
|Arena Type            | Objectives                                                               | Rewards                                                 |
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|
|Standard              | Remove all opposing fighters from play (kill, bleed out, or retrieve).   | Equipment, Resources, Gold, Reputation, Unlocks         |
|Raid                  | One team must try to steal the loot from the other team.                 | Equipment, Resources, Gold, Reputation, Unlocks         |
|King of the Hill      | The team that can hold the hill for the longest time wins.               | Equipment, Resources, Gold, Reputation, Unlocks         |
|Scrap Battle          | Opponents have to find equipment in the arena to fight with.             | Equipment, Resources, Gold, Unlocks                     |
|Civilian Fight        | A large fight between many civilians.                                    | Equipment, Resources, Gold, Unlocks                     |
|Street Fight          | Triggered by events or interactions with the town's residents.           | Equipment, Resources, Gold                              |
|----------------------|--------------------------------------------------------------------------|---------------------------------------------------------|

**Victory Conditions:**
    - **Standard**: Win when all enemy fighters are **out of play** (killed, bled out, OR retrieved)
    - Retrieved fighters survive but are removed from the fight permanently
    - This is essentially team deathmatch with a spawn limit of 1 per fighter
    - A "merciful" victory (all enemies retrieved) is still a victory
    - **Raid**: Win when the opposing team has no equipment left or has been defeated.
    - **King of the Hill**: Win when the team that can hold the hill for the longest time wins.
    - **Scrap Battle**: Win when all enemy fighters are **out of play** (killed, bled out, OR retrieved)
    - **Civilian Fight**: Players fight against the town's civilians they are outnumbered. Win when all civillians are **out of play** (killed, bled out, OR retrieved)
    - **Street Fight**: Kill or Down your opponent in the street. Win when the opponent is **out of play** (killed, bled out. NO RETRIEVALS as it wasn't an "official" fight.)

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


# Downed State & Retrievers:
==================================================
When a fighter takes enough damage, they enter a **Downed State** rather than dying instantly. This creates a critical window where the fighter can be saved or finished off, adding tactical depth to arena combat.

## The Downed State:
**What triggers it:**
    - A fighter is "downed" when their health reaches zero
    - They collapse unconscious on the field, on the brink of death
    - They begin bleeding out and will die without medical intervention

**Bleed-out Timer:**
    - Downed fighters have a visible bleed-out timer
    - If the timer expires before retrieval, the fighter dies
    - The timer creates urgency for both teams

**Downed Fighter Behavior:**
    - Completely unconscious and defenseless
    - Cannot move, fight, or take any actions
    - Body remains on the field as an obstacle until retrieved or dead

## Retrievers:
Retrievers are non-combatant personnel who rush onto the field to save downed fighters. Each team has a retriever team stationed at their staging area.

**The Divine Law of Combat:**
Retrievers exist because of the Divine Law of Combat, which states: *"No fighter may make a killing blow upon one who cannot defend themselves."* A downed fighter - unconscious and unable to raise their weapon - is considered "beyond the fight" and protected by the Law.

**Church Service:**
Retrievers are members of the Church who serve as part of their religious duty. This service is considered a sacred calling:
    - All retrievers are clergy or lay members of the Church
    - Serving as a retriever is a form of priesthood service - a rite of passage for many
    - The Church assigns retrievers to arena teams; they are not hired or paid by the factions
    - Retrievers wear Church vestments (simple robes) rather than faction colors

**Retriever Team Composition:**
|-------------|----------------------------------------------------------------------|
| Role        | Description                                                          |
|-------------|----------------------------------------------------------------------|
| Dragger     | Grabs the downed fighter and drags them back to the staging area     |
| Defender    | Protects the dragger from attackers during retrieval                 |
|-------------|----------------------------------------------------------------------|

**Retriever Characteristics:**
    - **Church Members**: Retrievers are clergy, not faction employees
    - **Lightly Equipped**: Church vestments, defender has a simple weapon for protection
    - **Vulnerable**: Can be killed - the Divine Law protects *fighters* only, not retrievers
    - **Slow When Dragging**: The dragger moves slowly while carrying a body
    - **Automatic Deployment**: Retrievers automatically deploy when a teammate goes down

**Killing Retrievers:**
    - Completely legal under arena rules - the Divine Law does not protect them
    - No penalty for killing retrievers
    - Morally questionable (they're Church members performing sacred duty)
    - Crowd may react (cheers or boos depending on crowd mood and piety)
    - If both retrievers die, their downed fighter cannot be saved
    - The Church remembers those who habitually kill their servants...
    - The church cults may target you for killing their retrievers. (the church cults also participate in retrieval services)

## Strategic Implications:
The retriever system creates emergent tactical decisions throughout the fight:

|-------------------------------|---------------------------------------------------------------------------|
| Scenario                      | Decision                                                                  |
|-------------------------------|---------------------------------------------------------------------------|
| Enemy fighter goes down       | Chase retrievers? Or press advantage on remaining fighters?               |
| Your fighter goes down        | Protect your retrievers? Or trust them and keep fighting?                 |
| Enemy retrievers both dead    | Their downed fighters will now bleed out - huge advantage                 |
| Your retrievers under attack  | Disengage to help? Or hope the defender holds?                            |
| Blocking staging area         | Camp the exit to intercept retrievals? (valid but dishonorable)           |
|-------------------------------|---------------------------------------------------------------------------|

**Gameplay Example (5v5):**
    - You down an enemy fighter. Their retrievers sprint onto the field from the opposing staging area.
    - You're engaged with two enemies but manage to take one down before the retrievers reach the first body.
    - You break off to chase the retrievers dragging the first downed fighter.
    - The defender retriever strikes you in the back, slowing your pursuit.
    - You spend precious time trying to kill the retriever but they reach the staging area - fighter saved.
    - You turn back to find two of your teammates are now down, and enemy fighters are hunting YOUR retrievers.
    - The decision to chase cost you the momentum of the fight.

## Rigged Retrievers (Fame Bonus):
Players with high Fame can "influence" the arena to field superior retrievers. This represents the player's growing power and connections.

**Standard Retrievers:**
    - Basic civilian clothing
    - Defender has simple weapon (club, dagger)
    - Normal movement speed
    - Low health

**Rigged Retrievers (High Fame):**
    - Better equipped (light armor, better weapons)
    - Faster movement speed (even when dragging)
    - Higher health/durability
    - More aggressive defender behavior
    - Unlocked at Fame thresholds

**How to Rig:**
    - Unlocks automatically at certain Fame levels
    - May require gold payment per fight to "arrange" rigged retrievers
    - Opponent cannot tell your retrievers are rigged until they engage them

## Retrieved Fighters:
Fighters who are successfully retrieved survive but are not unscathed:

**Immediate Effects:**
    - Removed from the current fight (cannot return)
    - Count as "saved" not "killed" for fight resolution

**Post-Fight Consequences:**
    - Fighter is **Injured** - requires Hospital treatment
    - Recovery time based on how close they were to death (bleed-out timer remaining)
    - Equipment worn during the fight may be damaged
    - Fighter unavailable for arena or guard duty until healed

**If Retrieval Fails:**
    - Fighter **dies** if bleed-out timer expires
    - Fighter **dies** if both retrievers are killed before reaching staging area
    - Dead fighters are permanently lost
    - Their equipment is lost (looted by the arena or opposing faction)

**See Also:** [Locations - Hospital](/Documentation/GDD/Locations.md#hospital) for healing mechanics.


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
==================================================
The controls are similar to a twin stick shooter. The player uses the left stick/WASD to move the character and the right stick/mouse to look around. Attacks are "thrown" in the direction the player is looking.

There is a "crosshair" to aim the character at.

It is easier to reference controls as Playstation Controller mappings. - because the keys are only used on ONE controller type so it can't be confused with another positions on other controller types.
For instance many controllers have an A and B button - but only the playstation uses geometric shapes for the buttons.

## Default Controls:  
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

**More information** can be found in the [Player Controls Documentation](/Documentation/GDD/PlayerControls.md)


# Arena UI:
==================================================
The Arena UI is designed to give the player all critical combat information at a glance without cluttering the screen or obscuring the action.

## UI Layout Overview:
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Portrait 1] ■■■■■■■■                                               │
│ [Portrait 2] ■■■■░░░░                                               │
│ [Portrait 3] ■■░░░░░░  DOWNED                                       │
│ [Portrait 4] ■■■■■■░░                                               │
│                                                                     │
│                                                                     │
│                         (GAMEPLAY AREA)                             │
│                                                                     │
│                                                                     │
│                                                    ┌───────────────┐│
│                                                    │ HEALTH  ■■■■░ ││
│                                                    │ STAMINA ■■■░░ ││
│                                                    └───────────────┘│
│                        ┌─────────────────┐                          │
│                        │ [Kick] [Throw]  │   <- Action Bar          │
│  ┌─────────────────────┴─────────────────┴──────────────────────┐   │
│  │       [Main+Off] │ [Two-Hand] │ [Bow] │ [Thrown x5] │        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ^ Weapon Board                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Player Status (Bottom Right):
The controlled fighter's vital stats, prominently displayed.

**Health Bar:**
    - Shows current health of the controlled fighter
    - Color changes as health depletes (green → yellow → red)
    - Flashes when taking damage
    - Shows damage numbers on hit (optional toggle)

**Stamina Bar:**
    - Resource for blocking, dodging, and special attacks
    - Regenerates over time when not depleted
    - Depleted stamina bar flashes to indicate recovery lockout
    - Position: Below the health bar

## Team Panel (Left Side):
A vertical column of teammate portraits providing at-a-glance team status.

**Portrait Display:**
    - Small portrait image of each teammate (excluding controlled fighter)
    - Arranged vertically down the left edge of the screen
    - Portraits are compact to minimize screen obstruction

**Per-Portrait Information:**
    |---------------------|----------------------------------------------------------------|
    | Element             | Description                                                    |
    |---------------------|----------------------------------------------------------------|
    | Portrait Image      | Fighter's face/icon for quick identification                   |
    | Health Bar          | Compact health bar below or beside portrait                    |
    | State Indicator     | Icon/text showing current state (Fighting, Downed, Retrieved)  |
    | Bleed Timer         | Visible countdown when teammate is downed                      |
    |---------------------|----------------------------------------------------------------|

**State Indicators:**
    - **Active**: Normal portrait, no overlay
    - **Downed**: Portrait grayed/red tinted, bleed-out timer visible
    - **Retrieved**: Portrait faded/removed, "SAVED" indicator
    - **Dead**: Portrait crossed out or skull overlay

## Weapon Board (Bottom Center):
A horizontal bar showing all equipped weapons and their availability.

**Layout:**
    - Centered along the bottom of the screen
    - Shows weapon slots as distinct panels/icons
    - Currently active weapon is highlighted/enlarged

**Weapon Slot Display:**
    |---------------------|----------------------------------------------------------------|
    | Slot                | Display Info                                                   |
    |---------------------|----------------------------------------------------------------|
    | Main Hand + Off Hand| Combined panel showing both weapons, swap hotkey [1]           |
    | Two-Handed          | Single panel for 2H weapon, swap hotkey [2]                    |
    | Bow                 | Bow icon with arrow count, swap hotkey [Q]                     |
    | Thrown              | Throwable icon with ammo count (e.g., "x5"), hotkey [E]        |
    |---------------------|----------------------------------------------------------------|

**Visual States:**
    - **Active**: Bright, highlighted border
    - **Available**: Normal visibility, ready to swap
    - **Empty**: Grayed out or hidden if no weapon in slot
    - **Cooldown**: Darkened with cooldown indicator (if weapon swap has cooldown)

## Action Bar (Above Weapon Board):
A context-sensitive bar showing currently available special actions.

**Purpose:**
    - Shows actions available based on current equipment and state
    - Helps players understand what moves are possible
    - Displays associated hotkey for each action

**Context-Sensitive Actions:**
    |---------------------|---------------------|------------------------------------------------|
    | Current State       | Available Actions   | Displayed Icons                                |
    |---------------------|---------------------|------------------------------------------------|
    | Melee (no shield)   | Kick, Throw         | [F] Kick, [E] Throw (if throwables equipped)   |
    | Melee (with shield) | Shield Bash, Throw  | [F] Shield Bash, [E] Throw                     |
    | Blocking            | Shield Bash         | [F] Shield Bash (while holding block)          |
    | Bow Equipped        | Aim, Throw          | Aim indicator, [E] Throw                       |
    | No Throwables       | Kick/Bash only      | Throw icon hidden or grayed                    |
    |---------------------|---------------------|------------------------------------------------|

**Visual Feedback:**
    - Icons pulse or highlight when action is ready
    - Grayed out when action is unavailable (e.g., no stamina)
    - Brief cooldown indicator after use

## Additional UI Elements:

**Crosshair/Reticle:**
    - Center screen aiming indicator
    - Changes based on weapon type (melee vs ranged)
    - Shows attack direction

**Damage Numbers (Optional):**
    - Floating numbers showing damage dealt/received
    - Can be toggled in settings

**Kill Feed (Optional):**
    - Small text notifications for downs/kills/retrievals
    - Shows "[Fighter] downed [Enemy]" style messages
    - Positioned in corner, non-intrusive