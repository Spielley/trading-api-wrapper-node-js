switch (process.env.BOT_STRATEGY.toUpperCase()) {
  case 'BASIC':
    require('./basicbotv02.js');
    break;
  case 'AVERAGE_DOWN':
    require('./averagedownheroku.js');
    break;
  default:
    console.log('Wrong BOT_STRATEGY selected!!!');
}
