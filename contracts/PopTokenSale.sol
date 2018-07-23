pragma solidity ^0.4.24;

import "./PopToken.sol";

contract PopTokenSale {
    address admin;
    PopToken public tokenContract;
    uint256 public tokenPrice;

    uint256 public tokensSold;
    event Sell(address _buyer, uint256 _amount);

    constructor (PopToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
    // from DSMath
    require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);

        // xfer token sale contract remaining tokens (inventory) to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        // xfer token sale contract remaining wei (cash) to admin
        admin.transfer(address(this).balance); 
    }

}
