import { WarehouseInput } from './utils/warehouse-input'
export function fromStringToInput(string: string) {
    const jsonObj = JSON.parse(string)
    return jsonObj as WarehouseInput
}

export function fromStringToArrayInput(string: string) {
    const jsonObj = JSON.parse(string)
    return jsonObj as WarehouseInput[]
}