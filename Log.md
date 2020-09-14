# What did I code last night??

## 9/13/20
* Trying to properly handle the updates being sent from the server to the client
* Player updates are being sent but the positions are 0, try to figure out why that is
* May need to change the way we handle sockets some day, like make multiple disconnects/connections in one session but eh
* Got player position data passed but realized I totally un-abstracted the player info. This is bad cause it's sending the whole Phaser player object, when we don't need that. Should figure out how to abstract that ~again~
* Wrote up some stuff about server-client communication architecture
    * Decided to go with some callback functionality so the Socket.io instances don't need a reference to the Phaser instances. Seems to work in proof of concept
    * Gotta figure out the best way to implement this during the main game loop
        * Call a function to get current players on each Phaser frame update? 
            * This probably makes the most sense since the game should only really update as fast as it can render
            * But then it has to wait for a callback function from the Client every frame
            * But ideally it's just getting a single stored object
            * Will that actually interfere with the Socket.io code's ability to update the object?
            * Essentially trying to make a shared object here
        * Give the Socket.io instance a single function to call whenever it needs to tell the Phaser instance something
            * This is kinda just giving Socket.io a reference to the game but much more streamlined and manageable

### Issues
* the Actors group on the client keeps getting members added on every update iteration with undefined id's. WHy??