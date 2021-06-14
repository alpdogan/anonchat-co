import { Call } from './call';
export default class Contract {
    address: string;
    abi: any[];
    functions: any[];
    [key: string]: Call | any;
    constructor(address: string, abi: any[]);
}
