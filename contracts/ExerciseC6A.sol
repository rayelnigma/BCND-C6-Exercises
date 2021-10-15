pragma solidity 0.5.16;

contract ExerciseC6A {

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/


    struct UserProfile {
        bool isRegistered;
        bool isAdmin;
    }

    address private contractOwner;                  // Account used to deploy contract
    mapping(address => UserProfile) userProfiles;   // Mapping for storing user profiles
    bool public isOperational;
    address[] private multiSigAddresses;
    uint constant public requiredSigCount = 3;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    // No events

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        isOperational = true;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAdmin(){
        require(userProfiles[msg.sender].isRegistered, 'caller must be a registered user');
        require(userProfiles[msg.sender].isAdmin, 'caller must be an admin');
        _;
    }

    modifier requireIsOperational(){
        require(isOperational, "contract must be operational to continue");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

   /**
    * @dev Check if a user is registered
    *
    * @return A bool that indicates if the user is registered
    */   
    function isUserRegistered
                            (
                                address account
                            )
                            external
                            view
                            requireIsOperational
                            returns(bool)
    {
        require(account != address(0), "'account' must be a valid address.");
        return userProfiles[account].isRegistered;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function registerUser
                                (
                                    address account,
                                    bool isAdmin
                                ) 
                                external
                                requireIsOperational
                                requireContractOwner
    {
        require(!userProfiles[account].isRegistered, "User is already registered.");

        userProfiles[account] = UserProfile({
                                                isRegistered: true,
                                                isAdmin: isAdmin
                                            });
    }

    function setIsOperational(bool isOperationalStatus) external requireAdmin {
        require(isOperational != isOperationalStatus, "can't request mode change if mode is already in this state");
        for (uint index = 0; index < multiSigAddresses.length; index++){
            if(msg.sender == multiSigAddresses[index]){
                revert('this admin already voted');
            }
        }
        multiSigAddresses.push(msg.sender);
        if(multiSigAddresses.length >= requiredSigCount){
            isOperational = isOperationalStatus;
            delete multiSigAddresses;
        }
    }
}

