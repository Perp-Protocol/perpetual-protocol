/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import fetch from "node-fetch"
import { resolve } from "path"
import { mkdir, ShellString } from "shelljs"
import {
    ContractMetadata,
    SystemMetadata,
    Stage,
    Layer,
    Network,
    LayerDeploySettings,
    LayerMetadata,
} from "../scripts/common"
import { asyncExec } from "../scripts/helper"
import { SettingsDao } from "./SettingsDao"

export interface AccountMetadata {
    privateKey: string
    balance: string
}

export class SystemMetadataDao {
    private systemMetadataCache!: SystemMetadata

    constructor(readonly settingsDao: SettingsDao) {
        const settings = settingsDao.getSystemDeploySettings()

        // must handle edge cases when local metadata file hasn't been created yet
        let localSystemMetadata
        try {
            localSystemMetadata = require("../system.json")
        } catch (e) {
            localSystemMetadata = {}
        }

        const mergedSystemMetadata = {
            layers: {},
            ...((localSystemMetadata as unknown) as SystemMetadata),
        }

        // copy related settings parameters to system metadata
        for (const key of Object.keys(settings.layers) as Layer[]) {
            const layerSettings: LayerDeploySettings = settings.layers[key]!
            mergedSystemMetadata.layers[key] = {
                contracts: {},
                accounts: [],
                ...mergedSystemMetadata.layers[key],
                network: layerSettings.network,
                externalContracts: layerSettings.externalContracts,
            }
        }

        this.setMetadata(mergedSystemMetadata)
    }

    static async fetchRemote(stage: Stage): Promise<SystemMetadata> {
        const results = await fetch(`https://metadata.perp.exchange/${stage}.json`)
        return results.json()
    }

    async pullRemote(): Promise<void> {
        const metadata = await SystemMetadataDao.fetchRemote(this.settingsDao.getStage())
        this.setMetadata(metadata)
    }

    async pushRemote(): Promise<void> {
        await asyncExec(
            `aws s3 cp ./${
                this.metadataFileName
            } s3://metadata.perp.fi/${this.settingsDao.getStage()}.json --acl public-read --cache-control 'no-store' --profile perp`,
        )
    }

    getContractMetadata(layerType: Layer, contractAlias: string): ContractMetadata {
        return this.systemMetadataCache.layers[layerType]!.contracts[contractAlias]
    }

    setMetadata(metadata: SystemMetadata): void {
        this.systemMetadataCache = { ...metadata }
        mkdir("-p", this.buildDir)
        ShellString(JSON.stringify(this.systemMetadataCache, null, 2)).to(`./${this.metadataFileName}`)
        ShellString(JSON.stringify(this.systemMetadataCache, null, 2)).to(`${this.buildDir}/${this.metadataFileName}`)
    }

    clearMetadata(layerType: Layer): void {
        this.systemMetadataCache.layers[layerType] = {
            network: this.settingsDao.getNetwork(layerType),
            accounts: [],
            contracts: {},
            externalContracts: {},
        }
        this.setMetadata(this.systemMetadataCache)
    }

    private get metadataFileName(): string {
        return "system.json"
    }

    private get buildDir(): string {
        return resolve("build")
    }

    setContract(layerType: Layer, contactAlias: string, contract: ContractMetadata): void {
        this.setContracts(layerType, {
            ...this.systemMetadataCache.layers[layerType]!.contracts,
            ...{ [contactAlias]: contract },
        })
        console.log(`${contactAlias}/${contract.name}`)
        console.log(contract.address)
    }

    setContracts(layerType: Layer, contracts: Record<string, ContractMetadata>): void {
        this.setMetadata({
            ...this.systemMetadataCache,
            layers: {
                ...this.systemMetadataCache.layers,
                [layerType]: {
                    ...this.systemMetadataCache.layers[layerType],
                    contracts,
                },
            },
        })
    }

    getNetwork(layerType: Layer): Network {
        return this.systemMetadataCache.layers[layerType]!.network
    }

    setAccounts(layerType: Layer, accounts: AccountMetadata[]): void {
        this.systemMetadataCache.layers[layerType]!.accounts = accounts
        this.setMetadata(this.systemMetadataCache)
    }

    setLayerMetadata(layerType: Layer, metadata: LayerMetadata): void {
        this.setMetadata({
            ...this.systemMetadataCache,
            layers: {
                ...this.systemMetadataCache.layers,
                [layerType]: metadata,
            },
        })
    }
}
