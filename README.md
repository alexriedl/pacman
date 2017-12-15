# Overview
Reimplementation of the original Pacman game. This is intended to be as close to the original game as possible (while being implemented in javascript and being web-based). Extra features not in the original game are planned for this game as well.

# Known Issues
- Ghosts can get stuck if the ghost mode changes if they are a few pixels away from a wall they are moving away from just before the switch
- Ghosts can lose focus of player if they get really close at an intersection
- Ghosts face wrong direction at start of game
- Energizers are not rounded correctly
- Ghosts leaving the pen round the corner
- Ghosts tracking player through the tunnel can have unexpected results in certain cases
- Ghost animation in pen is too fast (or outside is too slow)

# Road Map
## Features required for 1.0
- [X] Render Game Board
- [X] Sprite Maps
- [X] Basic Player movement
- [X] Player Corner Rounding
- [X] Basic Ghost AI
- [X] Ghost Modes (Chase + Scatter)
- [X] Player Death
- [X] Continue level after death (Reset ghosts into the pen)
- [ ] Energizers + Frightened Mode
  - [X] Eating an energizer causes all ghosts to go into frightened mode
  - [X] After Frightened mode time expires, all ghosts return to normal
  - [ ] Pacman gets a speed boost during frightened mode
  - [ ] Collisions with a frightened ghosts causes that ghost to "die"
- [ ] Dead Ghosts Return to pen
  - [ ] Sprites
  - [ ] Speed
  - [ ] Respawn (back to normal ghost sprite)
  - [ ] Dance in pen if it should - otherwise leave pen
- [ ] Player lives
  - [ ] Game Over
  - [ ] New Game (having no menu means new game auto starts)
- [ ] Finish Level + new level
- [ ] Blinky's speed based on remain pellets
- [ ] Per Level Config
  - [ ] Ghost Speed
  - [ ] Player Speed
  - [ ] Blinky's remaining pellet bonus speed
  - [ ] Frightened mode duration
- [ ] Fruit
  - [ ] Display fruit after certain number of pellets have been eaten (twice per level)
  - [ ] Limit by timer
  - [ ] Allow player to eat fruit
  - [ ] Different sprite per level
- [ ] Flush out ghost leaving pen logic to match actual game
  - [ ] No pellet consumed force timer
  - [ ] Ghost's individual pellet counters
  - [ ] Global (after player death) counter
  - [ ] Ghosts leave pen to the right if a ghost mode switch happened while the ghost was in the pen
- [ ] Points
  - [ ] Fruit display value
  - [ ] Ghosts display value
  - [ ] Display total score
  - [ ] Extra life after enough points
  - [ ] Per level for fruit
- [ ] High Score
  - [ ] Store Scores between games
  - [ ] Allow setting player name
- [ ] Cut Scenes
  - [ ] Act I
  - [ ] Act II
  - [ ] Act III
- [ ] Main Menu (demo + overview)
  - [ ] Ghost Intro
  - [ ] Demo (more than 1? - Random?)
  - [ ] High Scores List
  - [ ] Start Game
  - [ ] Game over gets redirected to Main Menu

## Extra Features (Post 1.0)
- [ ] Kill Screen (Level 256)
- [ ] Support for Ms. Pacman Style map (difference in rendering + colors)
- [ ] Support for Ms. Pacman Ghost Behavior (Modes are different)
- [ ] Support for Ms. Pacman Fruit Behavior
- [ ] Level Editor + Creator
- [ ] Upload custom level + download level designed by others
- [ ] Multi-player (taking turns)
