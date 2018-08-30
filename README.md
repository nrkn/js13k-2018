# RANGER DOWN

A game for [js13kGames 2018 **Offline**](http://2018.js13kgames.com/)

![Screenshot](screenshot.png)

## Story

### Who is the player?

The player is some kind of ranger

### Where is here

An island

### Why are they here?

They were sent to investigate the disappearance of the previous ranger

The previous ranger was killed by monsters - a monster outbreak is happening on
the island

They need to find out what happened and return

Their boat gets sunk and the computer in the ranger hut is *offline*

They need to scavenge/craft the components needed to get the computer working
to find out what happened and send a message for help

### Gameplay

Player arrives on a boat - while en route they get their brief:

'We lost contact with RANGER - investigate'

When they arrive, monsters attack and sink boat - player can only just fend off
monsters and get to hut and safety

On way to hut they find RANGER - dead

There is a house for the ranger on the island

The house has a bed, shower, replicator and computer terminal

The player can bump the computer to interact with it

It serves to explain the story to the player and control the replicator

The computer is broken and most of its functions are *offline* - the player will
need to find several components to get it fully working

The player needs food to survive - with the computer not working properly the
replicator is running in emergency backup mode and can only provide enough
food for the player to travel a short distance from their home before they need
to go home and get food again

Their first task is to explore the area around their home and find a component
to fix the computer, so they can get the replicator running properly and
get enough food to explore further afield, and find more of the components the
computer needs

They gradually unlock messages etc on computer from RANGER explaining what
happened, ability to craft better items, ability to finally send a message for
help

There is time - one action = 1 minute

At 6am and 6pm it switches from day to night

Monsters only come out at night and flee in daytime

Player is safe in hut, can sleep to pass the night away

## Engine

### TODO
- ~~pixels scaled as big as possible centered in viewport~~
- ~~draw font to canvas~~
- ~~setup to minify~~
  - Size: 1439, Remaining: 11873
- ~~create art - some grass and tree tiles~~
  - Size: 1730, Remaining: 11582
- ~~create art - a player sprite, two(?) frames animation~~
  - Size: 2070, Remaining: 11242
- ~~generate a map with grass placed randomly, some trees~~
  - Size: 2160, Remaining: 11152
- ~~draw map~~
  - Size: 2268, Remaining: 11044
- ~~draw player~~
  - Size: 2287, Remaining: 11025
- ~~player animates~~
  - Size: 2325, Remaining: 10987
- ~~player can move around with arrows or tap, trees and edge of map block~~
  - Only implemented keyboard - mouse/touch controls is a luxury we can add
    later
  - Size: 2456, Remaining: 10856
- ~~implement messages~~
  - Size: 2566, Remaining: 10746
- ~~implement day/night cycle~~
  - Size: 2660, Remaining: 10652
- ~~create art - water tiles~~
  - Size: 2820, Remaining: 10492
- ~~proper tile collision code~~
  - Size: 2689, Remaining: 10623
- ~~generate better map~~
  - Size: 2853, Remaining: 10459
- ~~color modes - green and amber~~
  - Size: 2955, Remaining: 10357
- ~~splash screen~~
  - Size: 3672, Remaining: 9640
- ~~bump interactions~~
  - Size: 3688, Remaining: 9624
- ~~computer interface~~
  - Size: 4030, Remaining: 9282
- ~~create art - food icon~~
- ~~create art - health icon~~
- ~~create art - skeleton~~
- ~~food mechanic~~
- ~~health mechanic~~
  - Size: 4219, Remaining: 9093
- ~~touch controls~~
  - Size: 4425, Remaining: 8887
- ~~improve splash~~
  - Size: 4487, Remaining: 8825
- ~~create art - boat~~
  - Size: 4648, Remaining: 8664
- ~~create art - path~~
  - Size: 4743, Remaining: 8569
- ~refactor~
  - ~Size: 4746, Remaining: 8566~
  - ~Move all consts together and rename~
  - ~Move all lets together and rename~
  - ~Extract functions for map generation~
  - ~Better maps with waypoints~
  - ~Move to typescript with hacked in import inliner~
  - Size: 4642, Remaining: 8670
- ~multiple~
  - ~create art - hut~
  - ~create art - sand~
  - ~improve map generation~
  - Size: 5059, Remaining: 8253
- ~massive speed optimization~
  - Size 5251, Remaining: 8061
- ~create art - monsters~
  - ~reinstate touch controls~
  - Size 5513, Remaining: 7799
- ~create art - inside hut~
  - ~enter and exit huts~
  - Size: 5819, Remaining: 7493
- ~reinstate boat~
  - ~message if bump boat~
  - Size: 5903, Remaining: 7409
- ~monster mechanics~
  - ~monsters created and move randomly~
  - Size: 6147, Remaining: 7165
- ~blue color mode for night instead of invert~
  - Size: 6137, Remaining: 7175
- ~monsters~
  - ~monsters can harm player and vice versa~
  - ~monsters have chance to move towards player~
  - ~BUG: but maybe keep - monsters can move on both x and y axis each turn~
  - ~BUG: monsters can move onto player tile!~
  - Size: 6244, Remaining: 7068
- ~BUG: monsters and player can harm each other during day!~
  - Size: 6263, Remaining: 7049
- ~BUG: food can resurrect you after you die!~
  - ~BUG: monsters can kill you in the hut~
  - Size: 6284, Remaining: 7028
- ~get computers working again~
  - Size: 6516, Remaining: 6796
- ~bed in hut to sleep~
  - Size: 6675, Remaining: 6637
- inventory / use item
- scripted intro events
- quests etc - spend some time figuring out
- win screen
- restart on death
- fog of war and/or minimap
- create art - more tiles - rocks, flowers, more trees
- add biomes - use the water inside map we currently turn into forests - art
  - mountain
  - swamp?
  - lake
  - forest
  - ???
- BUG: map generation sometimes crashes
- ISSUE: map generation sometimes very slow
- loading screen during map gen?
- if room left, consider adding transitional tiles to make slightly less blocky
- consider adding padding to SCREENs, will look better (but more math)