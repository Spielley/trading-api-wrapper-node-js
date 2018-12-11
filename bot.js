const Coss = require('./index')();

(async function () {
    try {
//Each function returns an object that is the server's response to the API call: i.e. res.body 
//Returning as an Object makes it easier to use/parse the data from bot.js or any strategy file than as a string or any other form.

// COSS 1.2 notice use new pair format: ETH_BTC instead of eth-btc , old format will not be supported soon

//private functionalities: 

    //placeLimitOrder: Returns Object res.body
	//not tested
        const myOrder = await Coss.placeLimitOrder({Symbol: 'coss-eth', Side: 'Buy', Price: 0.00028689, Amount: 500});
        console.log(myOrder);

    //placeMarketOrder: Returns Object res.body
    //DELAYED (COSS SIDE ISSUE, FOR NOW YOU ARE BEST OFF BY: getMarketSides, and placeLimitOrder at the price returned for bid/ask)
        //const marketOrder = await Coss.placeMarketOrder({Symbol: 'coss-eth', Side: 'Buy', Amount: 50});
        //console.log(marketOrder);

    //cancelOrder: Returns Object res.body
	//not tested
        const cancelOrder = await Coss.cancelOrder({ID: '5c9bdabc-017d-4161-b0ae-dc3ecb57466c', Symbol: 'coss-eth'});
        console.log(cancelOrder)

    //getOrderDetails: Returns Object res.body
	//not tested
        const OrderDetails = await Coss.getOrderDetails({ID: '58cead73-474e-4ac7-8f39-ae3875b41ff6'});
        console.log(OrderDetails)

    //getOpenOrders: Returns Object res.body
    //EXCHANGE RETURNS SOME ORDERS THAT WERE MANUALLY CANCELLED AS OPEN; SHOULD BE FIXED UPON EXCHANGE REBOOT/API RELEASE
	//TESTED
	
        const openOrders = await Coss.getOpenOrders({Limit: 10, Symbol: "ETH_BTC"});
        console.log(openOrders)
	
    //getCompletedOrders: Returns Object res.body
	//tested
        const completedOrders = await Coss.getCompletedOrders({Limit: 10, Symbol: "coss-eth"});
        console.log(completedOrders);
	
    //getAccountDetails: Returns Object res.body
	//tested
        const accountDetails = await Coss.getAccountDetails()
        console.log(accountDetails)
    //getAllOrders: Returns Object res.body (Limit cannot be >50)
	//tested => fetch account id first through accountdetails
        const allOrders = await Coss.getAllOrders({Symbol: "COSS_ETH", ID: "accountDetails.account_id", Limit: 10});
        console.log(allOrders);
	
    //getAccountBalances: Returns Object res.body
	//TESTED
        const getBalance = await Coss.getAccountBalances()
        console.log(getBalance)
	
    
    
    

//public functionalities:

    //getMarketPrice: Returns Object res.body
	//not working
        const marketPrice = await Coss.getMarketPrice({Symbol: "ETH_BTC"});
        console.log(marketPrice);

    //getPairDepth: Returns Object res.body
	//TESTED
        const pairDepth = await Coss.getPairDepth({Symbol: "BTC_USDT"});
        console.log(pairDepth)

    //getMarketSides: Returns a Nested array of data in this order: [[firstBidPrice, firstBidQuantity][firstAskPrice, firstAskQuantity]]
	//not working
        const marketSides = await Coss.getMarketSides({Symbol: "BTC_USDT"});
        console.log(marketSides)

    //getExchangeInfo: Returns Object res.body
	//TESTED
        const exchangeInfo = await Coss.getExchangeInfo();
      console.log(exchangeInfo);
  
    //getMarketSummary: Returns Object res.body
	// not working
        const marketSummary = await Coss.getMarketSummary({Symbol: "ETH_BTC"})
        console.log(marketSummary)


    } catch (err) {
        console.error(err);
    }
})();
