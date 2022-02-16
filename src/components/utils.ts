export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';