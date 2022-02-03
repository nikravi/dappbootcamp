// SPDX-License-Identifier: MIT
// import "openzeppelin/contracts/math/SafeMath.sol";

pragma solidity ^0.8.11;

contract Token {
    // no need after 0.8
    // using SafeMath for uint256;

    string public name = 'BMD Token';
    string public symbol = 'BMD';
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor () {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        
        return true;
    }

    function _transfer(address _from, address _to, uint _value) internal {
        require(_to != address(0));
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(_from, _to, _value);
    }

    // Aprove tokens
    function approve (address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transfer from
    function transferFrom (address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);

        _transfer(_from, _to, _value);
        allowance[_from][msg.sender] -= _value;
        return true;
    }
}
