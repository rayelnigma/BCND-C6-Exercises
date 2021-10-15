
var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

contract('ExerciseC6A', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });

  it('contract owner can register new user', async () => {
    // ARRANGE
    let caller = accounts[0]; // This should be config.owner or accounts[0] for registering a new user
    let newUser = config.testAddresses[0];

    // ACT
    await config.exerciseC6A.registerUser(newUser, true, { from: caller });
    let result = await config.exerciseC6A.isUserRegistered.call(newUser);

    // ASSERT
    assert.equal(result, true, "Contract owner cannot register new user");
  });

  it('contract cannot be paused with only one admin', async () => {
    // ARRANGE
    let caller = accounts[0]; // This should be config.owner or accounts[0] for registering a new user

    // ACT
    await config.exerciseC6A.setIsOperational(false, { from: caller });
    await config.exerciseC6A.registerUser(config.testAddresses[1], true, { from: caller });
    let result = await config.exerciseC6A.isUserRegistered.call(config.testAddresses[1]);

    // ASSERT
    assert.equal(result, true, "Contract owner cannot register new user");
  });

  it('setIsOperational can only be called by an admin', async () => {
    let caller = accounts[0]; // This should be config.owner or accounts[0] for registering a new user
    await config.exerciseC6A.registerUser(config.testAddresses[9], false, { from: caller });
    await truffleAssert.reverts(config.exerciseC6A.setIsOperational(false, { from: config.testAddresses[9] }), 'caller must be an admin');
  });

  it('contract can be paused with three admins', async () => {
    let caller = accounts[0]; // This should be config.owner or accounts[0] for registering a new user

    await config.exerciseC6A.registerUser(config.testAddresses[2], true, { from: caller });
    console.log(1);
    await config.exerciseC6A.registerUser(config.testAddresses[3], true, { from: caller });
    console.log(2);
    await config.exerciseC6A.registerUser(config.testAddresses[4], true, { from: caller });
    console.log(3);
    await config.exerciseC6A.setIsOperational(false, { from: config.testAddresses[2] });
    console.log(4);
    await config.exerciseC6A.setIsOperational(false, { from: config.testAddresses[3] });
    console.log(5);
    // await config.exerciseC6A.setIsOperational(false, { from: config.testAddresses[4] });
    // console.log(6);
    await truffleAssert.reverts(config.exerciseC6A.registerUser(config.testAddresses[5], false, { from: caller }),
      'contract must be operational to continue');
    console.log(7);
  });

});
