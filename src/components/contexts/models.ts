export interface BEXOrder {
    [key: string]: any;
    isBuyOrder: boolean;
    etherAmount: string;
    tokenAmount: string;
    tokenPrice: number;
    formattedTimestamp: string;
}