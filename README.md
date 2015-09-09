# Monopoly-js
Implementation of the Monopoly game in javascript, rendering done with D3

Far from complete, right now players alternate, roll the dice and buy properties. That's it. Not very exciting but at least the main game flow is operational.

## Screenshot (with the french UI)

![In-game screenshot]
(http://francois-roseberry.github.io/monopoly-js/screenshots/in-game.png)

## Demo

[Click here and enjoy !](http://francois-roseberry.github.io/monopoly-js/demo/)
UI is available in english and french, depending on your browser language. Other languages will default to english. Monopoly board is the one we have in US/Canada.

## Development setup

To setup the project after downloading the sources, install node.js, then run 'npm install' both in the project directory and in the client/ subdirectory. After, the 'grunt' command should be available to build from that directory.

Run 'grunt background'. While it runs, open another terminal and run 'grunt check' to run tests and deploy. Also, the server is running in the background, so it is accessible on http://localhost:3000. It is also possible to connect directly to the Karma server on http://localhost:9876

Note: grunt runs karma on windows using git bash, so it must be in the path. Logically, at this point Git Bash should be installed, since you just pulled the sources from GitHub. But be sure to put Git Bash in the path (installation option in 'Git for Windows' installer)

This setup is not tested on non-Windows systems and therefore I don't know if this works.

## Game Design Outline

**Application states**

![Alt text](http://g.gravizo.com/g?
digraph G {
start [shape=box];
config [label="Configuring game"];
play [label="Playing game"]
start -> config;
config -> play [label="Start game"];
play -> config [label="New game"];
}
)

**Game states**

(when the application is in the "Playing game" state)

Arrow represents choices

![Game states](http://g.gravizo.com/g?
digraph G {
start [shape=box];
turnStart [label="Turn start"];
turnEnd [label="Turn end"]
start -> turnStart;
turnStart-> turnEnd[label="Roll dice"];
turnEnd-> turnStart[label="Finish turn"];
turnEnd -> turnEnd[label="Buy property"];
}
)

**Conditional choices**

On the turn-end-state, the choice of buying a property is offered only if current player is on a property, property is not owned, and player has enough money.

**Choices effects on the game state**

* Roll dice
  * move player on the board
* Finish turn
  * switch to next player
* Buy property
  * property is added to the player's owned properties list
  * player's money is reduced by property price

*Note : there is no final state, since there is no way to possibly lose money yet. Hence, no winner or loser possible. Will be added later*

![Game flowchart](http://g.gravizo.com/g?
@startuml

scale 1.2
title Game flowchart

(*) -->[set first player as current] "<b>Move</b>
					advance current player dy dice" as move

--> if "On property?" then
	-->[yes] if "Owned?" then
		-right->[no] if "Enough money?" then
			-up->[no] "<b>Finish turn</b>
					set next player as current" as finish_turn
		else
			-right->[yes] if "Want to buy?" then
				-right->[yes] "<b>Buy property</b>
						substract property price from current player's money
						add property to current players's properties"
				-up-> finish_turn
			else
				-up->[no] finish_turn
			endif
		endif
	else
		partition TODO {
			-down->[yes] if "By Player ?" then
				-right->[yes] "It's all good, you're <b>home</b>
					Have a beer" as home
			else
				-down->[no] "Calculate rent"
				-down-> if "Enough money?" then
					-right->[yes] "<b>Cha-ching</b>
							make player pay the rent\nto owner"
					-up-> finish_turn
				else
					-down->[no] "<b>Bankruptcy</b>
						remove current player from game"
					-right-> if "At least 2 players left?" then
						-right->[no] (*)
					else
						-up->[yes] finish_turn
					endif
				endif
			endif
		}
		home -up-> finish_turn
	endif
else
	-right->[no] finish_turn
	-up-> move
endif

@enduml
)
