// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { Decimal } from "../utils/Decimal.sol";
import { IERC20 } from "./IERC20.sol";
import { IAmm } from "./IAmm.sol";

interface IInsuranceFund {
    function withdraw(IERC20 _quoteToken, Decimal.decimal calldata _amount) external;

    function isExistedAmm(IAmm _amm) external view returns (bool);

    function getAllAmms() external view returns (IAmm[] memory);
}
