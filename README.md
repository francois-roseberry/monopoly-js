# Monopoly-js

Scroll down for demo

Implementation of the Monopoly game in frontend-only javascript, rendering done with D3. Being a frontend only app, it allows me to deploy it to github pages to have a demo ready for you.

Not quite yet a complete Monopoly game, right now players alternate, roll the dice, buy and trade properties and pay rents (and eventually go bankrupt). The main game flow is operational, from the beginning to the end.

Features missing to be a complete game of Monopoly :
* Building houses and hotels, mortgage
* When rent is too high, offer to unmortgage and/or unbuild instead of going straight to bankruptcy
* Double rolls roll again, and 3 in a row bring you to jail
* Players are forced out of jail after 3 turns
* Differentiating between bankruptcy because of the bank or because of an opponent (to transfer possessions)
* Chance and community cards
* Bidding
  
## Computer player

Right now, the computer player is dumb and just picks the first available choice when presented with many.

## Demo

[Click here and enjoy !](http://francois-roseberry.github.io/monopoly-js/demo/)
UI is available in english and french, depending on your browser language. Other languages will default to english. Monopoly board is the one we have in US/Canada.

## Screenshots (with the french UI)

![Game configuration screenshot](http://francois-roseberry.github.io/monopoly-js/screenshots/game-configuration.png)

![In-game screenshot](http://francois-roseberry.github.io/monopoly-js/screenshots/in-game.png)

## Development setup

To setup the project after checkout, install node.js and yarn, then run `yarn` both in the project directory and in the client/ subdirectory. 

To run e2e tests, go to the project root and run `yarn e2e`

To run the client tests, go to the client directory and run `yarn test`

To build the client for the browser, go to the client directory and run `yarn build`

To lint the client sources and CSS, go to the client directory and run `yarn lint`

This project hasn't been touched in almost 10 years, a few of its tools were deprecated or a few majors behind. It followed best practices at the time, but it is far from the state of the art right now. So it qualifies as "legacy" code. However, the code is rather clean. So, as an exercisee, I'm picking it up and trying to modernize it. Any help welcome.

## Game Design Outline

The game is modelized as a sort of giant state machines, transitions between states being player choices.

**Application states**

![Simple graph](https://g.gravizo.com/svg?digraph%20G%20%7Bstart%20%5Bshape%3Dbox%5D%3Bconfig%20%5Blabel%3D%22Configuring%20game%22%5D%3Bplay%5Blabel%3D%22Playing%20game%22%5Dstart%20-%3E%20config%3Bconfig%20-%3E%20play%20%5Blabel%3D%22Start%20game%22%5D%3Bplay%20-%3E%20config%20%5Blabel%3D%22New%20game%22%5D%3B%7D)

... and for when the application is in the "Playing game" state :

![Game flowchart](http://francois-roseberry.github.io/monopoly-js/doc/game-flowchart.png)

As you can see, it still misses a couple of features to make it a standard game of monopoly. They will be implemented later.
