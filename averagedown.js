const Coss = require('./index')();

base = {} //database object

tradingsize = 100 // change this to change lotsize per trade
interval =  60 // interval in seconds , 1 loop for each interval. don't change unless it's over 60.
profitLevel = 0.5 // profit level in % - sells acquired lots when this % above averagedprice 
tradingpair = 'COSS_ETH' // this is your trading pair
coinToCheckWallet = 'ETH' // if you run out of this the bot won't buy COSS 
dontTradeUnder = 0.2 // if your hodlings of coinToCheckWallet fall under this value the bot doesn't trade
averagedownlevel = 95 // when price drops below this % of averagedprice a buy order is sent
averagedlots = 0 // change this to run from previous session params
averagedprice = 0 // change this to run from previous session params


const init = async () => {
try {
	
	const exchangeInfo = await Coss.getExchangeInfo();
	// build base start with base coins
	l = exchangeInfo['base_currencies'].length
		//console.log(l)
		base['bases'] = {}//base symbols
		base['baseminimum'] = {}//minimum total order size
		for(i=0;i<l;i++)
		{
			base['bases'][i] = exchangeInfo['base_currencies'][i]['currency_code'];
			base['baseminimum'][exchangeInfo['base_currencies'][i]['currency_code']] = exchangeInfo['base_currencies'][i]['minimum_total_order'];
			//console.log(base['bases'][i])
		}
		//console.log(base['baseminimum']['BTC'])
	// build coindata
	l = exchangeInfo['coins'].length	
		base['coins'] = {}//all symbols
		base['coinminimum'] = {}//minimum order amount
		for(i=0;i<l;i++)
		{
			base['coins'][i] = exchangeInfo['coins'][i]['currency_code'];
			base['coinminimum'][exchangeInfo['coins'][i]['currency_code']] = exchangeInfo['coins'][i]['minimum_order_amount'];
			//console.log(base['coins'][i])
		}
		//console.log(base['coinminimum']['BTC'])
		//console.log(l)
	// build pairs
	l = exchangeInfo['symbols'].length	
		base['symbols'] = []//all pairs
		base['amountlimit'] = {}//decimal thing
		base['pricelimit'] = {}//decimal thing
		base['tradeallowed'] = {}//is trade allowed
		for(i=0;i<l;i++)
		{
			base['symbols'].push( exchangeInfo['symbols'][i]['symbol']);
			base['amountlimit'][exchangeInfo['symbols'][i]['symbol']] = exchangeInfo['symbols'][i]['amount_limit_decimal'];
			base['pricelimit'][exchangeInfo['symbols'][i]['symbol']] = exchangeInfo['symbols'][i]['price_limit_decimal'];
			base['tradeallowed'][exchangeInfo['symbols'][i]['symbol']] = exchangeInfo['symbols'][i]['allow_trading'];
			//console.log(base['symbols'][i]+': '+base['pricelimit'][exchangeInfo['symbols'][i]['symbol']])
			
		}
		//console.log(base['tradeallowed']['CFT_ETH'])
		//console.log('amount: '+base['symbols'].length)
	// build wallet first use
	base['wallet'] = {} //amount available
    await walletUpdate();// call this to update available crypto values from wallet
	
	//set blank depth
	base['depth'] = {}
	
	l = base['symbols'].length
	// blank lotsizes
	base['lotsize'] = {}
	for(i=0;i<l;i++)
		{
			base['lotsize'][base['symbols'][i]] = 0
			base[base['symbols'][i]] = {}
		}
	  } catch (error) {
        console.error('Failed on init', error);
	  }
	
	base['lotsize'][tradingpair] = tradingsize
	timeframe = interval*1000
	 
	
	setInterval(main, timeframe) // creates loop
	  main();
}
const walletUpdate = async () => {
try {
		
	const getBalance = await Coss.getAccountBalances()
        //console.log(getBalance);
		l = getBalance.length	
		//console.log(l)
		
		for(i=0;i<l;i++)
		{
			
			base['wallet'][getBalance[i]['currency_code']] = getBalance[i]['available'];
			//console.log(getBalance[i]['currency_code']+': '+base['wallet'][getBalance[i]['currency_code']])
		}
     console.log('--- wallet updated ---')
} catch (error) {
        console.error('Failed on wallet update', error);
	  }

}
const depthUpdate = async () => {
try {
	
	 l = base['symbols'].length
	 //console.log(l)
	for(i=0;i<l;i++)
		{

			//console.log(base['symbols'][i]+': '+base['lotsize'][base['symbols'][i]])
			if(base['lotsize'][base['symbols'][i]] > 0)// only fetch pairDepth we actually use
			{
				const pairDepth = await Coss.getPairDepth({Symbol: base['symbols'][i]});
				//console.log(base['symbols'][i]+': '+pairDepth);
				base['depth'][base['symbols'][i]]= pairDepth;
				
				// get relevant market depth optional
				m = base['depth'][base['symbols'][i]]['asks'].length
				//console.log(m)
				
				base[base['symbols'][i]]['trueaskvolume'] = 0
				base[base['symbols'][i]]['truebidvolume'] = 0
				base[base['symbols'][i]]['avolume'] = 0
				base[base['symbols'][i]]['bvolume'] = 0
				
				for(n=0;n<m;n++)
					{
						//console.log(pairDepth['asks'][n][1])
						base[base['symbols'][i]]['trueaskvolume'] = parseInt(base[base['symbols'][i]]['trueaskvolume'])+parseInt(pairDepth['asks'][n][1])
						//console.log(pairDepth['asks'][n][0])
						if(base[base['symbols'][i]]['trueaskvolume'] > base['lotsize'][base['symbols'][i]] && base[base['symbols'][i]]['avolume'] == 0)
						{
							//console.log('new set', n);
							base[base['symbols'][i]]['ask'] = pairDepth['asks'][n][0]
							base[base['symbols'][i]]['avolume'] = base[base['symbols'][i]]['trueaskvolume']
						}
					}
				m = base['depth'][base['symbols'][i]]['bids'].length
				for(n=0;n<m;n++)
					{
						base[base['symbols'][i]]['truebidvolume'] = parseFloat(base[base['symbols'][i]]['truebidvolume'])+ parseInt(pairDepth['bids'][n][1])
						//console.log(pairDepth['bids'][n][0])
						if(base[base['symbols'][i]]['truebidvolume'] > base['lotsize'][base['symbols'][i]] && base[base['symbols'][i]]['bvolume'] == 0)
						{
							//console.log('new set', n);
							base[base['symbols'][i]]['bid'] = pairDepth['bids'][n][0]
							base[base['symbols'][i]]['bvolume'] = base[base['symbols'][i]]['truebidvolume']
						}			

					}
	
				console.log('bid set at: '+base[base['symbols'][i]]['bid'])
				console.log('ask set at; '+base[base['symbols'][i]]['ask'])
				// end of optional
				console.log('--- depth updated ---')
				// init tradinglogic
				tradinglogic(base['symbols'][i])				
			}
		
		}
	
	 
} catch (error) {
        console.error('Failed on wallet update', error);
	  }

}
const main = async () => {
	try {

	await walletUpdate();
	depthUpdate();
	
	 }catch (error) {console.log(error)}
}
const tradinglogic = async (pair) => {
	try {
		if(base[pair]['ask'] > base[pair]['bid'])
		{
			console.log('averagedlots: '+averagedlots)
			console.log('averagedprice: '+averagedprice)
		if(dontTradeUnder < base['wallet'][coinToCheckWallet])// 
		{
			// if init => buy
			if(averagedlots <= 0)
			{
				// buy
				try{// send buy limit
					price = Math.round((base[pair]['ask'] * (10** base['pricelimit'][pair]) )) / (10** base['pricelimit'][pair])
					console.log(price);
					const placedOrder = await Coss.placeLimitOrder({Symbol: pair, Side: 'Buy', Price: price, Amount: base['lotsize'][pair]});
					console.log(placedOrder)
			averagedlots = base['lotsize'][pair]
				averagedprice  = price
				console.log('averagedlots: '+averagedlots)
			console.log('averagedprice: '+averagedprice)
			}catch (error) {
       console.error('Failed to send buy limit order', error);
				// edit archive
				
			}
			}
			// if price < buylevel
			if(base[pair]['ask'] * (10** base['pricelimit'][pair]) < averagedprice * (10** base['pricelimit'][pair]) /100 * averagedownlevel)
			{
				// buy
				try{// send buy limit
					price = Math.round((base[pair]['ask'] * (10** base['pricelimit'][pair]) )) / (10** base['pricelimit'][pair])
					console.log(price);
					const placedOrder = await Coss.placeLimitOrder({Symbol: pair, Side: 'Buy', Price: price, Amount: base['lotsize'][pair]});
					console.log(placedOrder)
			averagedlots += base['lotsize'][pair];
				averagedprice  = ((price * base['lotsize'][pair])+(averagedprice*averagedlots))/(base['lotsize'][pair]+averagedlots);
			}catch (error) {
       console.error('Failed to send buy limit order', error);
			}
			console.log('averagedlots: '+averagedlots)
			console.log('averagedprice: '+averagedprice)
			}
			// if price > selllevel
			if(base[pair]['bid'] * (10** base['pricelimit'][pair]) > averagedprice * (10** base['pricelimit'][pair]) /100 * (100+profitLevel))
			{
				// buy
				try{// send buy limit
					price = Math.round((base[pair]['bid'] * (10** base['pricelimit'][pair]) )) / (10** base['pricelimit'][pair])
					console.log(price);
					const placedOrder = await Coss.placeLimitOrder({Symbol: pair, Side: 'Sell', Price: price, Amount: base['lotsize'][pair]});
					console.log(placedOrder)
			averagedlots -= base['lotsize'][pair];
			}catch (error) {
       console.error('Failed to send sell limit order', error);
			}
			console.log('averagedlots: '+averagedlots)
			console.log('averagedprice: '+averagedprice)
			}			
		}
		console.log('averagedlots: '+averagedlots)
			console.log('averagedprice: '+averagedprice)
		}
		
	}catch (error) {
       console.error('Failed somewhere within trading logic', error);
	}
console.log('--- end of: ' +pair+' trading logic ---')	 
}
init();
