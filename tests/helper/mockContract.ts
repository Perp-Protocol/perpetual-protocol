import { artifacts } from "@nomiclabs/buidler"
import {
    AmmMockContract,
    AmmMockInstance,
    ChainlinkL1MockContract,
    ChainlinkL1MockInstance,
    PerpTokenMockContract,
    PerpTokenMockInstance,
    RootBridgeMockContract,
    RootBridgeMockInstance,
} from "../../types"

const AmmMock = artifacts.require("AmmMock") as AmmMockContract
const ChainlinkL1Mock = artifacts.require("ChainlinkL1Mock") as ChainlinkL1MockContract
const RootBridgeMock = artifacts.require("RootBridgeMock") as RootBridgeMockContract
const PerpTokenMock = artifacts.require("PerpTokenMock") as PerpTokenMockContract

export async function deployAmmMock(): Promise<AmmMockInstance> {
    return AmmMock.new()
}

export async function deployChainlinkL1Mock(): Promise<ChainlinkL1MockInstance> {
    return ChainlinkL1Mock.new()
}

export async function deployRootBridgeMock(): Promise<RootBridgeMockInstance> {
    return RootBridgeMock.new()
}

export async function deployPerpTokenMock(): Promise<PerpTokenMockInstance> {
    return PerpTokenMock.new()
}
