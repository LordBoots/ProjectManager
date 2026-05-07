## Premise:
    A project application manager that allows a lead developer to manage the project while allowing their Financial Manager to view the project and make suggestions.
    The application will need to support peer to peer data transfer for updating of suggestions and puching the new applications state/updates to the Financial Manager. This can be done simply with PeerJS. We don't need encryption or any other features for this application. (PeerJS is already installed in package.json but it is not being used in the application yet.)

    Mind map: Allow lead developer to design a "GDD" for the project. This will be used to guide the development and help the financial manager see the vision of the project.
    Kanban Board: Allow lead developer to track the progress of the project. This will be used to help the financial manager see the progress of the project.
    Wiki: Allow lead developer to document the project. This will be used to help the financial manager see the documentation of the project.
    Suggestions: Allow financial manager to make suggestions to the lead developer. This will be used to help the lead developer see the suggestions and make decisions.
    Developer Settings: Allow user to change the settings of the application. This will be used to help the user customize the application to their needs - not applicable to the Financial Manager.

    The application will work in two modes: 
    - Developer Mode
    - Viewer Mode

    Developer Mode is controlled by a single "developer" flag in the index.html file before building the application.
    If the flag is not set the application is in Viewer Mode.

## Content Delivery:
The dev can make the repo public and just submit and push as they deveop as usual.
When the dev edits the application they can submit and push as usual.
The financial manager client then just manually downloads the entire "data" folder and overrides the existing one using the url of the repo. e.g https://github.com/yourusername/yourrepo.git/data

This is a simple and direct way to sync the mind map, kanban, wiki and suggestions between the two. It is likely the best option as it is simple and direct.
To make it even more streamlined a file could be added to the repo that lists the latest version of the data. The client can then skip the download if this single file's version is the same as the local version.
The client should have a manual "sync" button that the user can click to manually sync the data from the repo.

## Theme: 
Modern Dark Theme
Mounded corners on all elements
Minimalistic design
Modern font

## Landing Page:
    This is the first page the user sees when they open the application.
    It has Four main sections: 
    - Top Bar:
        - Title: "Project Manager" 
        - Tabs: "Home", "Mind Map", "Kanban", "Suggestions", "Settings" (settings is only visible to the lead developer)
    Top Content Area:
    This will host the cards the user can click to navigate to the Kanban Board and Mind Map. These cards are large compared to all other cards in the application and will have an image background with centered text only.
    Bottom Content Area:
        This area will be used to host cards for all of the wiki pages.
        The user can click on a card to view the wiki page.
        Each card has a name, short description, and an icon. (possibly a background image if we can get around to it)

## Suggestions Sidebar:
    This is a sidebar that appears on the right side of the application - it is always visible.
    Suggestions are availabe for both the developer and the financial manager but only the lead developer can remove them.


    This will hold Suggestion Cards that the user can click to view the suggestion (expands the card to show more than just the title).
    These cards are always visible and clicking them takes the user to the part of the wiki, mind map or kanban board that the suggestion is related to while opening the suggestion in the sidebar.
    When a user hovers over nodes in the mind map, images, kanban cards, mind map cards, etc. relevant suggestions will automatically highlight in the sidebar.
    If the suggetion related to the thing the user is hovering is further down list and out of view, the bottom of the scroll area will highlight and show and exclaimation mark signifying that there are more suggestions down below.

    Right clicking an object in the mind map, image, kanban card, etc. should open a context menu with the option to add a suggestion.
    This will open the suggestion form with the relevant information pre-filled.
    The user can then edit the suggestion as needed and submit it, they can also edit the suggestion after submission.
    Suggestions will always require the user to fill out a form to submit the suggestion.
    This form contains:
    - Title (set at time of submission)
    - Suggestion (set at time of submission, editable) (whatever length the user wants to write)
    - Category (no default - forces the user to select one - reduces laziness makingit a nightmare for the developer)
    - Priority (set at time of submission - editable)
    - Status (only developer can set this to "Approved" or "Rejected")
    - Rejection Reason (only developer can set this) (Rejected suggestions are moved to an archived list that is nolonger visible to the user - remains incase the developer changes their mind and wants to approve it later)
    - Submit Button (submits the suggestion)
    - Cancel Button (closes the suggestion form without submitting)

## Mind Map:
    Mind map should allow for an "infinite board" layout.
    The mind map allows the lead developer to design a "GDD" for the project. This will be used to guide the development and help the financial manager see the vision of the project.
    IT hould allow for links to be formed between any two nodes in the mind map. They should be allowed to go from any point on a border of a node to any point on the border of another node.
    Nodes will be locked in place when not in developer mode.

    All nodes should be resizable and draggable.

    Nodes should be allowed to have four types:
    - Text
    - Notes (small text nodes that cannot be linked to other nodes)
    - Images
    - Wiki Links (links to wiki pages) (Later addition - currently not planned for implementation yet.)

    Features:
    - A White board background with a grid of dots to help with placement of nodes.
    - Snapping (Alt + S to enable/disable)
    - Zoom in and out (mouse wheel or up and down arrow keys)
    - Pan (Shift + click and drag)
    - Focus on a node/nodes (F with node or group selected)
    - Multiple selection (Shift + click to select multiple nodes OR Drag a selection box to select multiple nodes)
    - add new nodes (Ctrl + N - developer mode only) (opens a smal dialoge showing the three node types and the user can select one to add)
    - delete nodes (Ctrl + Backspace OR delete key - developer mode only)
    - edit nodes (Ctrl + E with node selected - developer mode only) (sets edit mode active and hows the edit mode UI)
    - duplicate nodes (Ctrl + D with node selected - developer mode only) (adds new node slightly offset from the original node)
    - paste nodes (Ctrl + V - developer mode only)
    - undo/redo (Ctrl + Z and Ctrl + Shift + Z - developer mode only)
    - save mind map (Ctrl + S - developer mode only)

    Node Style Choices:
    Nodes while in edit mode should allow for their style and settings to be changed. 
    This should be done in a "stlyes bar" that appears when editing a node under the main menu bar.
    this bar shows the different options side by side with clickable dropdowns for each option.

    Base style choices should be (all node types should have these options):
    - Background Color (creates a background color to fill the entire node)
    - Whole Node Border Color (creates a border around the entire node excluding the top border if set)
    - Top Border Color (creates a band of color at the top of the node)
    - Drop Shadow (creates a drop shadow effect on the node)
    - Border Radius (creates a border radius on the node)

    Text Node Style Choices:
    - Font
    - Font Color
    - Font Size (default 16px)
    - Font Weight (default 400)
    - Font Style (default normal)
    - Text Alignment (default left)
    - Text Decoration (default none)

    Image Node Style Choices:
    - Has Title (default false) (adds a title element to the image)
    - Title Position (default top) (position of the title element) (top or bottom)
    - Title Alignment (default center) (Text alignmnet within the title element)

## Kanban Board:
    The kanban board allows the lead developer to track the progress of the project. This will be used to help the financial manager see the progress of the project.
    It should allow for the creation of cards that can be moved between columns.
    Cards should be draggable and droppable between columns.
    Cards shouls allow for an Icon, description, and a progress bar that tracks subtasks which can be ticked off as they are completed.
    Cards sub tasks and description should be collapsible and expandable but the main info should be visible by default.
    The developer should be allowed to add new cards to the board or delete existing cards.
    This board is not modifiable by the financial manager.
