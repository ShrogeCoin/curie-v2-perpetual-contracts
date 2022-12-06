import { MockContract, smockit } from "@eth-optimism/smock"
import { ethers } from "hardhat"
import { BaseToken } from "../../typechain"
import { ChainlinkPriceFeedV3, PriceFeedDispatcher } from "../../typechain/perp-oracle"
import { CACHED_TWAP_INTERVAL } from "../shared/fixtures"

interface BaseTokenFixture {
    baseToken: BaseToken
    chainlinkPriceFeedV3: ChainlinkPriceFeedV3
    priceFeedDispatcher: PriceFeedDispatcher
    mockedAggregator: MockContract
}

export async function baseTokenFixture(): Promise<BaseTokenFixture> {
    const aggregatorFactory = await ethers.getContractFactory("TestAggregatorV3")
    const aggregator = await aggregatorFactory.deploy()
    const mockedAggregator = await smockit(aggregator)

    mockedAggregator.smocked.decimals.will.return.with(async () => {
        return 6
    })

    const chainlinkPriceFeedV3Factory = await ethers.getContractFactory("ChainlinkPriceFeedV3")
    const chainlinkPriceFeedV3 = (await chainlinkPriceFeedV3Factory.deploy(
        mockedAggregator.address,
        40 * 60, // 40 mins
        1e5, // 10%
        10, // 10s
        CACHED_TWAP_INTERVAL,
    )) as ChainlinkPriceFeedV3

    const priceFeedDispatcherFactory = await ethers.getContractFactory("PriceFeedDispatcher")
    const priceFeedDispatcher = (await priceFeedDispatcherFactory.deploy(
        ethers.constants.AddressZero,
        chainlinkPriceFeedV3.address,
    )) as PriceFeedDispatcher

    const baseTokenFactory = await ethers.getContractFactory("BaseToken")
    const baseToken = (await baseTokenFactory.deploy()) as BaseToken
    await baseToken.initialize("RandomTestToken0", "RandomTestToken0", priceFeedDispatcher.address)

    return { baseToken, chainlinkPriceFeedV3, priceFeedDispatcher, mockedAggregator }
}
