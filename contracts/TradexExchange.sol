pragma solidity >=0.5 <0.6.0;

import "./SafeMath.sol";
import "./ECDSA.sol";
import "./IERC20.sol";

contract TradexExchange {

    using SafeMath for uint256;
    
    mapping(address => uint256) public balances;
    
    event LogTokenSwap(
        uint256 ethAmount, 
        uint256 tokenAmount, 
        uint256 expireBlock, 
        uint256 tokensIn, 
        address tokenOutAddress, 
        address tokenInAddress, 
        address liquidityProvider
    );
    
    event LogLiquidityAdd(address liquidityProvider, uint256 amount);
    
    event LogLiquidityGet(address liquidityProvider, uint256 amount);

    function addLiquidityIn() external payable {
        
        address liquidityProvider = msg.sender;
        
        uint256 amount = msg.value;
        
        require(amount > 0, "INVALID_LIQUIDITY_AMOUNT");
       
        balances[liquidityProvider] = balances[liquidityProvider].add(amount);
        
        emit LogLiquidityAdd(liquidityProvider, amount);
    }
    
    function getLiquidity() external {
        
        address payable liquidityProvider = msg.sender;
        
        uint256 eth = balances[liquidityProvider];
        
        require(eth > 0, "INVALID_LIQUIDITY_PROVIDER");
        
        balances[liquidityProvider] = 0;
        
        liquidityProvider.transfer(eth);
        
        emit LogLiquidityGet(liquidityProvider, eth);
    }

    function swapForEth(
        uint256 ethAmount, 
        uint256 tokenAmount, 
        uint256 expireBlock, 
        uint256 tokensIn, 
        address tokenOutAddress,  
        address tokenInAddress,  
        address liquidityProvider, 
        bytes memory signature
    ) 
        public
    {
        require(block.number > expireBlock, "ORDER_EXPIRED");

        address payable taker = msg.sender;

        bytes32 hash = keccak256(abi.encodePacked(ethAmount, tokenAmount, expireBlock, tokenOutAddress, tokenInAddress, liquidityProvider));

        address signer = ECDSA.prefixedRecover(hash, signature);

        require(signer == liquidityProvider, "INVALID_SIGNER");

        require(IERC20(tokenInAddress).transferFrom(taker, address(this), tokensIn), "TOKEN_TRANSFER_FAIL");

        uint256 ethOut = (ethAmount.mul(tokensIn)).div(tokenAmount);

        taker.transfer(ethOut);
        
        emit LogTokenSwap(ethAmount, tokenAmount, expireBlock, tokensIn, tokenOutAddress, tokenInAddress, liquidityProvider);
    }

    function swapForTokens(
        uint256 tokensOutAmount, 
        uint256 tokensInAmount, 
        uint256 expireBlock, 
        uint256 tokensIn, 
        address tokenOutAddress,  
        address tokenInAddress,  
        address liquidityProvider, 
        bytes memory signature
    ) 
        public
    {
        require(block.number > expireBlock, "ORDER_EXPIRED");

        address payable taker = msg.sender;

        bytes32 hash = keccak256(abi.encodePacked(tokensOutAmount, tokensInAmount, expireBlock, tokenOutAddress, tokenInAddress, liquidityProvider));

        address signer = ECDSA.prefixedRecover(hash, signature);

        require(signer == liquidityProvider, "INVALID_SIGNER");

        require(IERC20(tokenInAddress).transferFrom(taker, address(this), tokensIn), "TOKEN_TRANSFER_FAIL");

        uint256 tokensOut = (tokensOutAmount.mul(tokensIn)).div(tokensInAmount);

        require(IERC20(tokenOutAddress).transferFrom(liquidityProvider, taker, tokensOut), "TOKEN_TRANSFER_FAIL");
        
        emit LogTokenSwap(tokensOutAmount, tokensInAmount, expireBlock, tokensIn, tokenOutAddress, tokenInAddress, liquidityProvider);
    }
}