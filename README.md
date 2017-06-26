# Monopoly-js [Halted]

Halted because tests were becoming flaky and I had other projects. I'm still listening though, feel free to contribute. 

Scroll down for demo

Implementation of the Monopoly game in javascript, rendering done with D3

Not quite yet a complete Monopoly game, right now players alternate, roll the dice, buy and trade properties and pay rents (and eventually go bankrupt). The main game flow is operational, from the beginning to the end.

Features missing to be a complete game of Monopoly :
* Building houses and hotels, mortgage
* When rent is too high, offer to unmortgage and/or unbuild instead of going straight to bankruptcy
* Double rolls roll again, and 3 in a row bring you to jail
* Players are forced out of jail after 3 turns
* Differentiating between bankruptcy because of the bank or because of an opponent (to transfer possessions)
* Chance and community cards
* Bidding

Those nice features I'd like to play with after the basics are complete :
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

![Game configuration screenshot](http://francois-roseberry.github.io/monopoly-js/screenshots/game-configuration.png)

![In-game screenshot](http://francois-roseberry.github.io/monopoly-js/screenshots/in-game.png)

## Development setup

To setup the project after downloading the sources, install node.js, then run 'npm install' both in the project directory and in the client/ subdirectory. After, the 'grunt' command should be available to build from that directory.

Run 'grunt background'. While it runs, open another terminal and run 'grunt check' to run tests and deploy. Also, the server is running in the background, so it is accessible on http://localhost:3000. It is also possible to connect directly to the Karma server on http://localhost:9876

Note: grunt runs karma on windows using git bash, so it must be in the path. Logically, at this point Git Bash should be installed, since you just pulled the sources from GitHub. But be sure to put Git Bash in the path (installation option in 'Git for Windows' installer)

This setup is not tested on non-Windows systems and therefore I don't know if this works.

## Game Design Outline

**Application states**

![Simple graph](https://g.gravizo.com/svg?digraph%20G%20%7Bstart%20%5Bshape%3Dbox%5D%3Bconfig%20%5Blabel%3D%22Configuring%20game%22%5D%3Bplay%5Blabel%3D%22Playing%20game%22%5Dstart%20-%3E%20config%3Bconfig%20-%3E%20play%20%5Blabel%3D%22Start%20game%22%5D%3Bplay%20-%3E%20config%20%5Blabel%3D%22New%20game%22%5D%3B%7D)

... and for when the application is in the "Playing game" state :

![Game flowchart](http://francois-roseberry.github.io/monopoly-js/doc/game-flowchart.png)

As you can see, it still misses a couple of features to make it a standard game of monopoly. They will be implemented later.
