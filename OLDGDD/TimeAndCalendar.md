# Index:
1.  [Description](#description)
2.  [Calendar System](#calendar-system)
3.  [Schedule Manipulation](#schedule-manipulation)

# Description:
==================================================  
    The game has a time and calendar system that is used to track the passage of time in the game.
    Time is used as a currency because fights are scheduled using the calendar system.
    Time only passes when the player moves between locations and districts or interacts with an event.

**Time Passing:**
    The scheduled arena fights are an integral piece of the game - this means the player will have to manage their time carefully because time passes when they are actively doing something.

    Time only passes when:
    - The player moves between locations and districts.
    - The player interacts with an event.
    - The player participates in an arena fight.    

    Actions that "eat time" are clearly indicated before they are performed. This means the player can choose to perform the action or not.

    When time passes during traveling this will be indicated by the time moving forwards in the top bar of the UI.
    When time passes while participating in some events the player will be able to see the time passing by observing the environment as there is a full day night cycle applied to the town.


# Calendar System:
==================================================
**Description:**
    The calendar system is used to track the passage of time in the game.
    Fights are scheduled using the calendar system.

    The calendar system is a 12 month calendar with 30 days per month.
    The date is displayed in the top bar of the UI.
    The date is displayed in the format of "Day, Month, Year".

**Fight Schedule:**
    Fights are scheduled using the calendar system and are scheduled based on the player's reputation with the opposing faction and other factors I have not decided on yet.
    Players must be ready to fight on the day of the scheduled fight.
    If the player is not ready they can cancel or enter unprepared.

    Cancelling a fight will result in a penalty to the player's reputation with the opposing faction and they may lose fame if they cancel too often.
    Entering unprepared means the player has not finished repairing gear and their fighters are not fully healed. This naturally lowers the chances of winning the fight.

**User Interface:**
    The calendar is available in the top bar of the UI.
    It displays the calendar in an easy to recognize format.

**Day Names:**
    Standard Gregorian Calendar Days:
    - Monday
    - Tuesday
    - Wednesday
    - Thursday
    - Friday
    - Saturday
    - Sunday

**Month Names:**
    Standard Gregorian Calendar Months:
    - January
    - February
    - March
    - April
    - May
    - June
    - July
    - August
    - September
    - October
    - November
    - December

**Epoch:**
    This is used for flair and means nothing other than to designate the current "era" of the game.
    It is displayed in the format of "Epoch, Year".

    Full date example: "Monday, January 1, 1019 Epoch".

**Warnings and Notifications:**
    When a scheduled event or fight approaches the calendar will display a warning in the top bar of the UI.

**More Information:** on  the user interface for events can be found in [User Interface](/Documentation/UserInterface.md).


# Schedule Manipulation:
==================================================
**Description:**
    The player has the ability to manipulate the calendar to their advantage in order to offset the scheduled fights.
    The player can influence calendar events by:
        - Sabotage a shipment of goods from the opposing faction.
        - Assassinate a member of the opposing faction.
        - Spy on the opposing faction.
        - Gather information about the opposing faction.
        - Break into the opposing faction's stronghold.
        - Steal the opposing faction's goods.

    The player can either pay someone from the slums district to do these jobs OR they can send one or more of their own fighters to do the jobs.

**More Information:** on sabotage can be found in [Sabotage](/Documentation/Sabotage.md).
