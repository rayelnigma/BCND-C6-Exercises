
var ExerciseC6D = artifacts.require("ExerciseC6D");

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x9d75623E0BF1a4be7974F3fdEA0bBFc0e1CE1B20",
        "0x98be22F631d55d46DdCFEf30c2aC3383E42d74c7",
        "0xaa317f5E5DA444686850F7eaa7498d3049cb4f3E",
        "0xd44Be70673AC7070705CACf32061D732a5756189",
        "0xFf341d2450a5482C325350971767Ce541D546f8E",
        "0x8550406327c947F32064d1C9B84A30C8E89633d7",
        "0x4079cd774fA68f2f4A5E26F9174237a946793d05",
        "0xC4C6614bac38AdF21C68DBEa82dA23f693d15F34",
        "0xAE8dc663a0F531d3b3E7184705517Ea4c153dF92",
        "0x742648027A52b05a4cb3B4B9d94326b5daAfb4A6"
    ];


    let owner = accounts[0];
    let exerciseC6D = await ExerciseC6D.new();
    
    return {
        owner: owner,
        testAddresses: testAddresses,
        exerciseC6D: exerciseC6D
    }
}

module.exports = {
    Config: Config
};