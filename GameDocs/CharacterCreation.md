# Index:
1. [Description](#description)
2. [Character Creation](#character-creation)
3. [Related Documentation](#related-documentation)

# Description:
==================================================
The character creation process happens at the beginning of a new game and allows the player to select a name, appearance for their character and select a faction.

# Character Creation:
==================================================
The character creation process is the process of creating the player character.
**Character Name**:
    - A name can be input for the character - there are no limitations on the name, profanity is allowed.
**Character Appearance**:
    - The player can select an appearance for their character.
    - The appearance is a 3D model of the character.
    - They can customize:
        - Hair
        - Beard
        - Face Type
        - Body Type
        - Body proportions
        - Skin tone
        - Eye color
        - Clothing (Can be changed in game by the player in the Character Panel)
**Faction**:
    - The player can select a faction to join.
    - Factions are cosmetic only - they do not affect the game in any way.
    - The faction choice dictates the cosmetic appearance of the town.


# Character creator UI:
==================================================
**Layout**:
    - The character creator UI is a 3D scene with a 2D UI overlay.
    - The screen is "split" into two sections.
    - The left section is the UI overlay for selecting the character appearance.
    - The right section is a view of the character in some sort of environment.

**Environment**:
    - The environment is a 3D scene with a camera view of the character.
    - I don't yet know what the content of the scene will be, but it will be a "neutral" environment that is not specific to any faction.
    - Indoors is likely the best thematic choice. - it reduces the need for "background" objects and allows the player to focus on the character.

**Appearance Selection**:
    - The selection UI will be broken down into categories like a standard character creator:
        - Hair (Beard and Hair)
        - Face Type (selectable from a list of preset face types) - there are 12 current faces.
        - Body proportions (How fat, how tall, how muscular, how long arms are, etc)
        - Skin tone
        - Eye color
        - Clothing (Can be changed in game by the player in the Character Panel)

**Faction Selection**:
    - The faction selection UI will be a list of factions that the player can select from.
    - The faction choice for the moment is completely cosmetic and does not affect features
    - Faction choice affects the banners and buidling styles of the town.