import { BaseProvider } from '@ethersproject/providers';
import { Call } from './call';
export default class Provider {
    provider?: BaseProvider;
    multicallAddress: string;
    constructor();
    init(provider: BaseProvider): Promise<void>;
    getEthBalance(address: string): any;
    all(calls: Call[], block?: number): Promise<any[]>;
}
