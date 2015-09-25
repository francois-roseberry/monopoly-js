# Monopoly-js
Implementation of the Monopoly game in javascript, rendering done with D3

Far from complete, right now players alternate, roll the dice, buy properties and pay rents (and eventually go bankrupt). That's it. Not very exciting but at least the main game flow is operational, from the beginning to the end.

Features missing to be a complete game of Monopoly :
* Calculating rents based on dice for public utities (companies) instead of a flat 25$
* Building houses and hotels
* When rent is too high, offer to mortgage and/or unbuild instead of going straight to bankruptcy
* Double rolls roll again, and 3 in a row bring you to jail
* Adding square effects for "Luxury Tax", "Revenue Tax" and "Go to jail"
* Differentiating between bankruptcy because of the bank or because of an opponent (to transfer possessions)
* Chance and community cards
* Trade
* Bidding

Those nice features I'd like to do after the basics are complete :
* Ability to use different Monopoly boards (for ex. : french classic, zelda and star wars)
* Migrate the game processing on a server, probably Node, and find free Node hosting like Heroku, in order to :
* Save the game
* Experiment with WebSockets with Node to add networking
* Collect lots of game stats, like rentability, frequency, etc. in order to :
* Experiment with different types of AI players - basic minimax, machine learning based on statistics, etc.

## Demo

[Click here and enjoy !](http://francois-roseberry.github.io/monopoly-js/demo/)
UI is available in english and french, depending on your browser language. Other languages will default to english. Monopoly board is the one we have in US/Canada.

## Screenshots (with the french UI)

![Game configuration screenshot]
(http://francois-roseberry.github.io/monopoly-js/screenshots/game-configuration.png)

![In-game screenshot]
(http://francois-roseberry.github.io/monopoly-js/screenshots/in-game.png)

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

... and for when the application is in the "Playing game" state :

![Game flowchart]
(http://francois-roseberry.github.io/monopoly-js/doc/game-flowchart.png)

As you can see, it still misses many features to make it a standard game of monopoly. They will be implemented later.
