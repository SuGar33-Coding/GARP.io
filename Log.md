# What did I code last night??

## 9/13/20
* Trying to properly handle the updates being sent from the server to the client
* Player updates are being sent but the positions are 0, try to figure out why that is
* May need to change the way we handle sockets some day, like make multiple disconnects/connections in one session but eh
* Got player position data passed but realized I totally un-abstracted the player info. This is bad cause it's sending the whole Phaser player object, when we don't need that. Should figure out how to abstract that ~again~

### Issues
* the Actors group on the client keeps getting members added on every update iteration with undefined id's. WHy??