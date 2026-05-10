# Index:
1.  [Description](#description)


# EXPANSION FEATURE:
==================================================
**!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!:**
    - This feature is NOT included in Version 1.0.
    - Sabotage is planned for **Expansion Stage 1** after the feature freeze.
    - This document exists as design notes for future implementation.


# Description:
==================================================
    The player can sabotage the opposing faction to gain an advantage in the arena.
    Sabotage either delays the scheduled fight or disadvantages the opposing team by injuring or killing a member of the opposing team or depriving them of equipment.
    Sabotage types available per scheduled match are gated by information gathering and the player's reputation with the Rogues Den.

# How to sabotage:
    @collapsible @collapsed
==================================================
**Hiring an agent:**
    The player can hire an agent from the slums district to do the job.
    This is done by going to thee People's Retreat or the Rogues Den and talking to one of the peple there who have job icons above their heads.
    The player can then talk to that agent and see what services they offer.
    If the player wanted more info on the agents chances they can talk to the agent more and try to deduce their chances of success based on what they say
    in the conversation. - This is optional and not required.
    The player will be prompted to confirm the job and the cost.

    Different agents quote different completion times and costs.

    You cannot see the progress of a hired agent because they are not part of your information network.
    The event just completes when the agent returns.
    Agents have more advanced sabotage types available to them without needing to gather information as information gathering is included in the base cost of the job.

**Sending fighters to do the job:**
    From the calendar menu the player can select the scheduled fight and click on the "Sabotage" button.
    This will open a menu with the available sabotage types.
    The player can then:
    - Select the fighters(s) they want to send.
    - Select the sabotage type they want to use.
    - Select the amount of time they want to try to delay the fight by. (if applicable)
    - Click the "Send" button.
    The fighters will then be sent to do the job.
    The player can then wait for the job to complete or they can check the progress of the job in the calendar menu.

    The Event Notification Panel will show the result of the sabotage once it has completed or failed.
    To open up more advanced sabotage types the player must use the "Gathering Information" sabotage type to gain information about the opposing team.


# Sabotage Types:
    @collapsible @collapsed
==================================================
    |----------------------|---------------------------------------------------------------------------------------------------------------------------|
    |Sabotage Type         | Description                                                                                                               |
    |----------------------|---------------------------------------------------------------------------------------------------------------------------|
    |Shipment Sabotage     | Sabotage a shipment of goods from the opposing team causing them to be late or without equipment.                         |
    |Assassination         | Assassinate a member of the opposing team.                                                                                |
    |Gathering Information | Gather information about the opposing team allowing them to cause more damage in further sabotage.                        |
    |Stealing Goods        | Steal the opposing team's goods leaving them without equipment or resources.                                              |
    |Rumor Mill            | Spread rumors about the opposing team. Can cause a falling out amongst the opposing team.                                 |
    |Kitchen Sabotage      | Sabotage the opposing team's kitchen. Gives the player a chance to sabotage the opposing team's food.                     |
    |Bandit Raid           | Try to contact local bandits and hire them to raid the opposing team's town causing them to be late or without equipment. |
    |----------------------|---------------------------------------------------------------------------------------------------------------------------|

# Sabotage outcomes:
    @collapsible @collapsed
==================================================
**Outcomes Influencers:**
    The fighter's stats and training.
    The quiality of information gathered.
    The agents costs and stats.

**Type Outcomes:**
    |----------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
    | Type                 | Failure                                                              | Success                                                                                    |
    |----------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
    |Shipment Sabotage     | Reputation loss. Coins deducted. New negative events.                | Opponents missing gear. Resources Gained. Gold Gained. Oppnents Delayed.                   |
    |Assassination         | Death penalty. Hostage Taken. New negative events.                   | Opponents missing a fighter or a fighter being injured. Opponents Cancel.                  |
    |Gathering Information | Reputation loss. New negative events.                                | Information gained. Allows for more advanced sabotage types to be chosen.                  |
    |Stealing Goods        | Reputation loss. Coins deducted. Hostage Taken. New negative events. | Equipment Gained. Resources Gained. Gold Gained. Opponents missing gear.Opponents Delayed. |
    |Rumor Mill            | Reputation loss. New negative events.                                | Opponent missing. Opponents cancel.                                                        |
    |Kitchen Sabotage      | Reputation loss. Hostage Taken. New negative events.                 | Opponents missing a fighter or a fighter being injured. Opponents Cancel.                  |
    |Bandit Raid           | Reputation loss. New negative events. Fighter injured.               | Opponents missing a fighter or a fighter being injured. Opponents Cancel.                  |
    |----------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|


# Information Gathering:
    @collapsible @collapsed
==================================================
    Information gathering is a sabotage type that allows the player to gather information about the opposing team.
    It is used to open up more advanced sabotage types.
