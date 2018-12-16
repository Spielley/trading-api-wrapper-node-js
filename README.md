# Coss-API-Node wrapper by cryptodeal - bots by spielley

If you want to see more free bots or upgrades to the existing one, please consider donating. ask spielley on telegram or discord when new stuff is incoming at how many donations.

ETH/ERC-20 Donation Address for bot builder: 0x57b328E48b1EeCFb81C21E3A7cC72655CB4722c4

ETH/ERC-20 Donation Address for wrapper builder: 0xD8a6A57133Aba6672f338a988b4D2fE1899A369e


#### About Coss-API-Node

A modular, open source/free use wrapper written in node.js for the coss.io API. All functionalities have been tested and work. API keys set as vars w/i index.js (for the time being). Bot.js serves as an example of how to call all of the wrapper's functions; every API call function returns the res.body response from the server as an object when the function is called (excluding getMarketSides() which returns a nested array formatted as such: [[firstBidPrice, firstBidQuantity][firstAskPrice, firstAskQuantity]].


#### Installation of wrapper

* Ensure you have Node.js installed:
https://nodejs.org/en/download/

* Clone repository
```
$ git clone https://github.com/Spielley/trading-api-wrapper-node-js.git

```
* Install dependencies

```
$ npm install
```

* Insert your API keys into the index.js file (temporary solution as we will be adding functionality to set Keys from your strategy file)
* Develop your strategy in yourFileName.js (utilizing the API wrapper & its functions as shown in bot.js example)

* Run your strategy file
```
$ node yourFileName.js
```


#### Current Issues (COSS side problems; i.e. not the wrapper, but wrapper will be updated as COSS dev teams makes fixes)

Please note that the wrapper (and bot.js example use of wrapper) do not provide a strategy for utilizing the API. The wrapper has been tested and known issues are associated with COSS side errors:

1. placeMarketOrder() does not currently work, but the error will be fixed by COSS developers (COSS side error). FOR NOW YOU ARE BEST OFF BY: getMarketSides(), and placeLimitOrder() at the price returned for bid/ask depending on which side of the order books you wish to execute a trade on)
2. getOpenOrders() has been returning some orders that were cancelled as still being open; this is a coss side error and dev team has said this issue should correct itself after exchange maintentance for API release.


#### Contact the Developer(wrapper dev)

For any inquiries about use, please contact the developer: telegram @cryptodeal20


#### TODO(wrapper dev):
1. Write up more thorough documentation beyond the examples in bot.js 
2. Add set Options function, so keys can be set from bot.js 
3. Publish as npm package

#### Installation of basic bot (spielley)
1. Run through wrapper instructions
2. optional customise trading settings in the bot file
3. Run basicbot.js by executing the command 'node basicbot.js'

Thank you for trading
welcome to the coss trading movement.
