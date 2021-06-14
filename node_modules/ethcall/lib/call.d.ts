import { BaseProvider } from '@ethersproject/providers';
export interface Call {
    contract: {
        address: string;
    };
    name: string;
    inputs: any[];
    outputs: any[];
    params: any[];
}
export declare function all(provider: BaseProvider, multicallAddress: string, calls: Call[], block?: number): Promise<any[]>;
