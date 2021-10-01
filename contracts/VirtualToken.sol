// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.7.6;

import { IVirtualToken } from "./interface/IVirtualToken.sol";
import { VirtualTokenStorageV1, ERC20Upgradeable } from "./storage/VirtualTokenStorage.sol";

contract VirtualToken is IVirtualToken, VirtualTokenStorageV1 {
    event WhitelistAdded(address account);
    event WhitelistRemoved(address account);

    function __VirtualToken_init(string memory nameArg, string memory symbolArg) internal initializer {
        __SafeOwnable_init();
        __ERC20_init(nameArg, symbolArg);
        // transfer to 0 = burn
        _whitelistMap[address(0)] = true;
    }

    function mintMaximumTo(address recipient) external onlyOwner {
        _mint(recipient, type(uint256).max);
    }

    function addWhitelist(address account) external onlyOwner {
        _whitelistMap[account] = true;
        emit WhitelistAdded(account);
    }

    function removeWhitelist(address account) external onlyOwner {
        _whitelistMap[account] = false;
        emit WhitelistRemoved(account);
    }

    /// @inheritdoc IVirtualToken
    function isInWhitelist(address account) external view override returns (bool) {
        return _whitelistMap[account];
    }

    /// @inheritdoc ERC20Upgradeable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        // not whitelisted
        require(_whitelistMap[from], "VT_NW");
    }
}
