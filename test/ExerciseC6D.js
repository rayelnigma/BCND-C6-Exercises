var Test = require('../config/testConfig.js');
var truffleAssert = require('truffle-assertions');
//var BigNumber = require('bignumber.js');

contract('ExerciseC6D', async (accounts) => {

  const TEST_ORACLES_COUNT = 10;
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    // Watch contract events
    const ON_TIME = 10;
    // console.log(config.exerciseC6D);
    // config.exerciseC6D.allEvents(null, (error, event) => {
    //   if (result.event === 'OracleRequest') {
    //     console.log(`\n\n!!!!!!!!!!!!!!!! Oracle Requested: index: ${result.args.index.toNumber()}, flight:  ${result.args.flight}, timestamp: ${result.args.timestamp.toNumber()}`);
    //   } else {
    //     console.log(`\n\n!!!!!!!!!!!!!!!! Flight Status Available: flight: ${result.args.flight}, timestamp: ${result.args.timestamp.toNumber()}, status: ${result.args.status.toNumber() == ON_TIME ? 'ON TIME' : 'DELAYED'}, verified: ${result.args.verified ? 'VERIFIED' : 'UNVERIFIED'}`);
    //   }
    // });
    // Past events
    //events.get((error, logs) => {  });

  });


  it('can register oracles', async () => {

    // ARRANGE
    let fee = await config.exerciseC6D.REGISTRATION_FEE.call();
    console.log('fee: ' + fee);

    // ACT
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      // for (let a = 1; a < 2; a++) {
      let result1 = await config.exerciseC6D.registerOracle({ from: accounts[a], value: fee });
      truffleAssert.eventEmitted(
        result1,
        'logMessage', (ev) => {
          // console.log('ev:', ev);
          // console.log('ev.message:', ev.message);
          // console.log('ev.Result.message:', ev.Result.message);
          return ev.message === 'registerOracle() begin';
        });
      let result = await config.exerciseC6D.getOracle(accounts[a]);
      console.log(`oracle registered[${a}]: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });

  it('can request flight status', async () => {

    // ARRANGE
    let flight = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    // Submit a request for oracles to get status information for a flight
    let result1 = await config.exerciseC6D.fetchFlightStatus(flight, timestamp);
    truffleAssert.eventEmitted(
      result1,
      'OracleRequest', (ev) => {
        console.log('index:', ev['0'].toNumber());
        // console.log('ev.message:', ev.message);
        // console.log('ev.Result.message:', ev.Result.message);
        return ev['1'] === flight;
      });

    // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {

      // Get oracle information
      // For a real contract, we would not want to have this capability
      // so oracles can remain secret (at least to the extent one doesn't look
      // in the blockchain data)
      let oracleIndexes = await config.exerciseC6D.getOracle(accounts[a]);
      for (let idx = 0; idx < 3; idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          let result = await config.exerciseC6D.submitOracleResponse(oracleIndexes[idx], flight, timestamp, 10, { from: accounts[a] });
          truffleAssert.eventEmitted(
            result,
            'FlightStatusInfo', (ev) => {
              console.log(`status: ${ev[2].toNumber()}, verified: ${ev[3]}`);
              // console.log('ev.message:', ev.message);
              // console.log('ev.Result.message:', ev.Result.message);
              return true;
            });
          console.log(`submitOracleResponse: ${oracleIndexes[idx]}, ${flight}, ${timestamp}, 10, from: ${accounts[a]}`);
          // Check to see if flight status is available
          // Only useful while debugging since flight status is not hydrated until a 
          // required threshold of oracles submit a response
          let flightStatus = await config.exerciseC6D.viewFlightStatus(flight, timestamp);
          console.log('flightStatus:', flightStatus);
          console.log(`POST : oracleIndexes[${a}][${idx}]:${oracleIndexes[idx].toNumber()}, flight:${flight}, timestamp:${timestamp}, flightStatus:${flightStatus.toNumber()}`);
        }
        catch (e) {
          // Enable this when debugging
          console.log(`ERROR: oracleIndexes[${a}][${idx}]: ${oracleIndexes[idx].toNumber()}, flight:${flight}, timestamp:${timestamp}, ERROR: ${e.reason}\n`, e);
          // console.log(e);
        }
      }
    }
  });
});
