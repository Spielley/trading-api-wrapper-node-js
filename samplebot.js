const Coss = require('./index')();
//var fs = require('fs');
//var stringify = require('csv-stringify');

base = {} //database object
const init = async () => {
try {
	
	const exchangeInfo = await Coss.getExchangeInfo();
      //console.log(exchangeInfo);
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
	  
	  
	
	//for now manual fix instead of dynamic
	// trading size <=> pair
	base['lotsize']['ETH_BTC'] = 0.005
	//setInterval(main, 60000) // uncomment to create loop
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
						//console.log(base[base['symbols'][i]]['trueaskvolume'])
						if(base[base['symbols'][i]]['trueaskvolume'] >= base['lotsize'][base['symbols'][i]] && base[base['symbols'][i]]['avolume'] == 0)
						{
							base[base['symbols'][i]]['ask'] = pairDepth['asks'][n][0]
							base[base['symbols'][i]]['avolume'] = base[base['symbols'][i]]['trueaskvolume']
						}
					}
				m = base['depth'][base['symbols'][i]]['bids'].length
				for(n=0;n<m;n++)
					{
						base[base['symbols'][i]]['truebidvolume'] = parseInt(base[base['symbols'][i]]['truebidvolume'])+ parseInt(pairDepth['bids'][n][1])
						//console.log(base[exchange[0]][rpair]['truebidvolume'])
						if(base[base['symbols'][i]]['truebidvolume'] >= base['lotsize'][base['symbols'][i]] && base[base['symbols'][i]]['bvolume'] == 0)
						{
							base[base['symbols'][i]]['bid'] = pairDepth['bids'][n][0]
							base[base['symbols'][i]]['bvolume'] = base[base['symbols'][i]]['truebidvolume']
						}			

					}
				console.log('bid set at: '+base[base['symbols'][i]]['bid'])
				console.log('ask set at; '+base[base['symbols'][i]]['ask'])
				// end of optional
				// init tradinglogic
				tradinglogic(base['symbols'][i])				
			}
		
		}
	
	 console.log('--- depth updated ---')
} catch (error) {
        console.error('Failed on wallet update', error);
	  }

}
const main = async () => {
	try {
	// do custom stuff	
		// insert technical analysis (TA)
		//change bull or bearsignal to true if ta signals
	// update depth for each pair
	depthUpdate();
	
	 }catch (error) {console.log(error)}
}
const tradinglogic = async (pair) => {
	try {
		// remove setting to false to actually trade
		bullsignal = false
		bearsignal = false
		// 
		if(bullsignal == true)
		{ //sample code-not tested
			const placedOrder = await Coss.placeLimitOrder({Symbol: pair, Side: 'Buy', Price: base[base['symbols'][i]]['ask'], Amount: base['lotsize'][pair]});
		}
		if(bearsignal == true)
		{ //sample code-not tested
			const placedOrder = await Coss.placeLimitOrder({Symbol: pair, Side: 'Sell', Price: base[base['symbols'][i]]['bid'], Amount: base['lotsize'][pair]});
		}
		
		
	}catch (error) {
       console.error('Failed somewhere within trading logic', error);
	}
console.log('--- end of: ' +pair+' trading logic ---')	 
}
init();
