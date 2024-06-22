import { WarehouseInput } from './utils/warehouse_input'
export function fromStringToInput(string: string) {
    const jsonObj = JSON.parse(string)
    return jsonObj as WarehouseInput
}

export function fromStringToArrayInput(string: string) {
    const jsonObj = JSON.parse(string)
    return jsonObj as WarehouseInput[]
}