const request = require('request');
const Promise = require('bluebird');

const API_KEY_DEV = 'cRbHFJTlL6aSfZ0K2q7nj6MgV5Ih4hbA2fUG0ueO';

// TODO: fixed api(?)

module.exports = (api) => {
  api.coinswitchStatusLookup = [
    'complete',
    'failed',
    'refunded',
    'timeout',
  ];

  api.coinswitchGetStatus = (res, req, orderId) => {
    let options;
    
    if (api.appConfig.exchanges.coinswitch) {
      options = {
        method: 'GET',
        url: `https://api.coinswitch.co/v2/order/${orderId}`,
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': req.query.dev ? API_KEY_DEV : api.appConfig.exchanges.coinswitch,
        },
      };
    } else {
      options = {
        method: 'GET',
        url: `https://www.atomicexplorer.com/api/exchanges/coinswitch?method=getOrder&&orderId=${orderId}`,
      };
    }

    console.log(options);
  
    api.exchangeHttpReq(options)
    .then((result) => {
      api.log(result, 'exchanges.coinswitch.order');

      if (result &&
          result.result &&
          result.result.indexOf('\"') > -1) {
        result.result = JSON.parse(result.result);
      }

      if (result.msg === 'success' &&
          result.result.success &&
          !result.result.data) {
        const retObj = {
          msg: 'error',
          result: 'no data',
        };
        res.end(JSON.stringify(retObj));
        api.log(`coinswitch request order ${orderId} state update failed`, 'exchanges.coinswitch');
      } else {
        if (result.result.data &&
            result.result.data.orderId) {
          api.exchangesCache.coinswitch[result.result.data.orderId] = result.result.data;
          api.saveLocalExchangesCache();
          api.log(`coinswitch request order ${orderId} state update success, new state is ${result.result.data.status}`, 'exchanges.coinswitch');
        } else {
          api.log(`coinswitch request order ${orderId} state update failed`, 'exchanges.coinswitch');
        }
        res.end(JSON.stringify(result));
      }
    });
  };

  api.get('/exchange/coinswitch/coins', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let options;

      if (api.appConfig.exchanges.coinswitch) {
        options = {
          method: 'GET',
          url: 'https://api.coinswitch.co/v2/coins',
          headers: {
            'x-user-ip': '127.0.0.1',
            'x-api-key': req.query.dev ? API_KEY_DEV : api.appConfig.exchanges.coinswitch,
          },
        };
      } else {
        options = {
          method: 'GET',
          url: 'https://www.atomicexplorer.com/api/exchanges/coinswitch?method=getCoins',
        };
      }
    
      api.exchangeHttpReq(options)
      .then((result) => {
        if (result &&
            result.result &&
            result.result.indexOf('\"') > -1) {
          result.result = JSON.parse(result.result);
        }
        res.end(JSON.stringify(result));
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/rate', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let options;
      
      if (api.appConfig.exchanges.coinswitch) {
        options = {
          method: 'POST',
          url: 'https://api.coinswitch.co/v2/rate',
          headers: {
            'x-user-ip': '127.0.0.1',
            'x-api-key': req.query.dev ? API_KEY_DEV : api.appConfig.exchanges.coinswitch,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            depositCoin: req.query.src,
            destinationCoin: req.query.dest,
          }),
        };
      } else {
        options = {
          method: 'GET',
          url: `https://www.atomicexplorer.com/api/exchanges/coinswitch?method=getRate&src=${req.query.src}&dest=${req.query.dest}`,
        };
      }
    
      api.exchangeHttpReq(options)
      .then((result) => {
        api.log(result, 'exchanges.coinswitch.rate');

        if (result.msg === 'success' &&
            result.result.success &&
            !result.result.data) {
          const retObj = {
            msg: 'error',
            result: 'unavailable',
          };
          res.end(JSON.stringify(retObj));
        } else {
          if (result &&
              result.result &&
              result.result.indexOf('\"') > -1) {
            result.result = JSON.parse(result.result);
          }
          res.end(JSON.stringify(result));
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/order/place', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let options;
      
      if (api.appConfig.exchanges.coinswitch) {
        options = {
          method: 'POST',
          url: 'https://api.coinswitch.co/v2/order',
          headers: {
            'x-user-ip': '127.0.0.1',
            'x-api-key': req.query.dev ? API_KEY_DEV : api.appConfig.exchanges.coinswitch,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            depositCoin: req.query.src,
            destinationCoin: req.query.dest,
            depositCoinAmount: req.query.srcAmount,
            destinationCoinAmount: req.query.destAmount,
            destinationAddress: {
              address: req.query.destPub,
            },
            refundAddress: {
              address: req.query.refundPub,
            },
          }),
        };
      } else {
        options = {
          method: 'GET',
          url: `https://www.atomicexplorer.com/api/exchanges/coinswitch?method=getRate&src=${req.query.src}&dest=${req.query.dest}&srcAmount=${req.query.srcAmount}&destAmount=${req.query.destAmount}&destPub=${req.query.destPub}&refundPub=${req.query.refundPub}`,
        };
      }
    
      api.exchangeHttpReq(options)
      .then((result) => {
        api.log(result, 'exchanges.coinswitch.order.place');

        if (result &&
            result.result &&
            result.result.indexOf('\"') > -1) {
          result.result = JSON.parse(result.result);
        }

        if (result.msg === 'success' &&
            result.result.success &&
            !result.result.data) {
          const retObj = {
            msg: 'error',
            result: 'no data',
          };
          res.end(JSON.stringify(retObj));
        } else {
          if (result.result.data &&
              result.result.data.orderId) {
            api.coinswitchGetStatus(res, req, result.result.data.orderId);
          } else {
            res.end(JSON.stringify(result));
          }
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: GET
   *
   */
  api.get('/exchange/coinswitch/order', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const _orderId = req.query.orderId;

      api.log(api.exchangesCache.coinswitch, 'exchages.coinswitch.cache');

      if (api.exchangesCache.coinswitch[_orderId]) {
        api.log(`coinswitch order ${_orderId} state is ${api.exchangesCache.coinswitch[_orderId].status}`, 'exchanges.coinswitch');

        if (api.coinswitchStatusLookup.indexOf(api.exchangesCache.coinswitch[_orderId].status) === -1) {
          api.log(`coinswitch request order ${_orderId} state update`, 'exchanges.coinswitch');
          api.coinswitchGetStatus(res, req, _orderId);
        } else {
          const retObj = {
            msg: 'success',
            result: api.exchangesCache.coinswitch[_orderId],
          };
          res.end(JSON.stringify(retObj));
        }
      } else {
        api.coinswitchGetStatus(res, req, _orderId);
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   *
   */
  api.post('/exchanges/cache/coinswitch/order/delete', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      delete api.exchangesCache.coinswitch[req.query.orderId];
      // TODO: delete deposit(s) by orderId
      api.saveLocalExchangesCache();

      const retObj = {
        msg: 'success',
        result: api.exchangesCache.coinswitch,
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};