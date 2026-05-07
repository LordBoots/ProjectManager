## Goal: 
Strip the application down to the bare essentials to get the electon app launching. 
Remove all remnants of the documentation viewer (ignore the documentation folder for now as this WILL be relevant to the application we're building later on)
We need to get it into a state where the electron framework is just a generic container for the web application.

the only thing we need to leave is the main.js file and the index.html file. BUT these can be cleaned up as well.

The current environment is setup with Electon and nodemon to watch the files and rebuild the application automatically.
The current electron setup is built with this in mind so the "core" for electron should not be touched.


## Important Files:
- index.html is only responsible for loading the main.js file and providing a basic containers for the application. (sidebar, content area, extras panel)
- main.js is the applications main entry point for the web/application side of things.
- main.js is responsible for:
    - Holding application state
    - Rendering the application
    - Handling the navigation
    - Handling the UI
    - Handling the data
    - Handling the events

# Framework folder:
   - This is where the application code is stored.
   - Has been cleaned of most of the old code and left with the bare essentials.
   - References have not been cleaned up.

## src folder:
   - This is explicitly for assets that are not part of the application code.
   - This includes images, fonts, sounds, etc.

## Summary: 
 - Get the application bac to a bare framework ready for a fresh start qithout having to reimplement the electon side of things.