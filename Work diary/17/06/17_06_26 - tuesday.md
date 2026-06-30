# Found implications: 

## Map Layout:
Current map layout is too large to show the buildingswith any real detail, the buildings aren't able to be differentiated easily. The buildings maybe hard to pick apart also, Was originally why I suggested using a scrollable, movable map for the game as it allowed me to show off things at higher detail. 
Trying to reconcile how to fix this. 
- I could scale the map down, pull the camera in closer BUT this leave less playable game area. The Funding partner wants a large scale city.
- I could use "Game Scale", having the builings at unrealistic ratios, but this would make the buildings look weird and distract from what is supposed to be a more realistic setting.
- I could use a different map style, but this would require a lot of work to implement and would likely not be as good as the current map style.
- I could reintroduce the idea of being able to zoom and pan the map around but as stated above the funding partner wants "everything on one screen".
- I could convert it to a top down "roof only" veiew - this is likely the best solution overall but again tanks what I percieve as the main selling point of the game.
- I could try stylize a 2D representation of the map But the issue here is I do not have the art skills to do this from scratch. Doing this would rewquire building out the map in 3D first anyway and then converting the render to a stylized 2D representation using composition tricks. 

I need to solve this issue before I can go anywhere else with the project as everything else hinges around how I do things. 

If I make the city an actual 3D city a lot of the "per scene" issues are already sorted because 3D representations (regardless of how simple) exist for the areas to behin with. I can just zoom in to s designated area and have a 3D representation of the area to work with for the up close shots. 
If I make it out of a 2D representation or roof only then the up close shots would actually need to span in their own scenes. this means I'd be dealing with generating 2D scenes on top of the 3D scenes for the up close shots. This would be a lot of work and would likely be a lot slower than the 3D approach.

The houses themselves are not an issue to make, in fact they are probably the simplest part of this entire part of the project. The hard part is how to keep things visual when the map is so large? 

## Performance concerns:
Showing 300-500 buildings in 3D is quite a large performance tax. Taking bilboards of the buildings/objects and rebuilding the scene in 2D would likely take months and would require me to finalize eveything as I go. Using proxies through the MultiMeshInstances would likely be the best solution but I'm unsure about the performance then anyway as I'm getting conflicting insider signals on where the vertex cieling is. 
Bottom line, I will be using mesh instancing in some regard but I need to figure out if I need to build out a library of proxy meshes or if I can use the existing meshes and just use the MultiMeshInstances to instance them throughout the map. 

## Future Expansion:
I need to figure out how to handle the future expansion of the game. The funding partner wants to add more buildings and more features to the game. I need to figure out how to handle this without breaking the current system. Im going to have to plan forward to account for changing design premises and such as has happened throughout the process. This would involve spending 30-50% longer per script component than initially planned and I would likely have to plan for possible technical debt reconciliation throughout. 