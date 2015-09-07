# Monopoly-js
Implementation of the Monopoly game in javascript, rendering done with D3

Far from complete, right now players alternate, roll the dice and buy properties. That's it. Not very exciting but at least the main game flow is operational.

# Screenshot

![In-game screenshot]
(http://francois-roseberry.github.io/monopoly-js/screenshots/in-game.png)

# Demo

http://francois-roseberry.github.io/monopoly-js/demo/

# Development setup

To setup the project after downloading the sources, install node.js, then run 'npm install' both in the project directory and in the client/ subdirectory. After, the 'grunt' command should be available to build from that directory.

Run 'grunt background'. While it runs, open another terminal and run 'grunt check' to run tests and deploy. Also, the server is running in the background, so it is accessible on http://localhost:3000. It is also possible to connect directly to the Karma server on http://localhost:9876

Note: grunt runs karma on windows using git bash, so it must be in the path. Logically, at this point Git Bash should be installed, since you just pulled the sources from GitHub. But be sure to put Git Bash in the path (installation option in 'Git for Windows' installer)

This setup is not tested on non-Windows systems and therefore I don't know if this works.

# Game Design Outline

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

![Alt text](http://g.gravizo.com/g?
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

Roll dice : move player on the board

Finish turn : switch to next player

Buy property : property where current player is is bought by current player and his money is reduced by its price

Note : there is no final state, since there is no way to possibly lose money yet. Hence, no winner or loser possible. Will be added later
