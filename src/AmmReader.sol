// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { Amm } from "./Amm.sol";
import { Decimal } from "./utils/MixedDecimal.sol";

contract AmmReader {
    using Decimal for Decimal.decimal;
    struct AmmStates {
        uint256 quoteAssetReserve;
        uint256 baseAssetReserve;
        uint256 tradeLimitRatio;
        uint256 fundingPeriod;
        string quoteAssetSymbol;
        string baseAssetSymbol;
        bytes32 priceFeedKey;
        address priceFeed;
    }

    function getAmmStates(address _amm) external view returns (AmmStates memory) {
        Amm amm = Amm(_amm);
        (bool getSymbolSuccess, bytes memory quoteAssetSymbolData) = address(amm.quoteAsset()).staticcall(
            abi.encodeWithSignature("symbol()")
        );
        (Decimal.decimal memory quoteAssetReserve, Decimal.decimal memory baseAssetReserve) = amm.getReserve();

        bytes32 key = amm.priceFeedKey();
        bytes memory bytesArray = new bytes(32);
        uint256 end;
        for (uint256 i; i < 32; i++) {
            if (key[i] == 0) {
                break;
            }

            bytesArray[i] = key[i];
            end++;
        }
        bytes memory symbol = new bytes(end + 1);
        for (uint256 i; i < end; i++) {
            symbol[i] = bytesArray[i];
        }

        return
            AmmStates({
                quoteAssetReserve: quoteAssetReserve.toUint(),
                baseAssetReserve: baseAssetReserve.toUint(),
                tradeLimitRatio: amm.tradeLimitRatio(),
                fundingPeriod: amm.fundingPeriod(),
                priceFeed: address(amm.priceFeed()),
                priceFeedKey: amm.priceFeedKey(),
                quoteAssetSymbol: getSymbolSuccess ? abi.decode(quoteAssetSymbolData, (string)) : "",
                baseAssetSymbol: ""
            });
    }
}
