import { RequestMessage, WarehouseServiceMessages } from './utils/messages'
import { Service } from './utils/service';
import axios from 'axios';
import { fromStringToInput, fromStringToArrayInput } from './string_utils';

const http = axios.create({
    baseURL: 'http://localhost:8080'
});

export function check_service(message: RequestMessage) {
    switch (message.client_name) {
        case Service.WAREHOUSE:
            warehouse_api(message.client_request, message.input)
            break;
        case Service.MENU:
            // TODO
            break;
        default:
            // TODO
            break;
    }
}

function warehouse_api(message: WarehouseServiceMessages, input: string) {
    switch (message) {
        case WarehouseServiceMessages.CREATE_INGREDIENT:
            http.post('/warehouse/', fromStringToInput(input)).then((res) => console.log(res.statusText)).catch((error) => console.log(error.response.statusText));
            break;
        case WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY:
            http.put('/warehouse/', fromStringToArrayInput(input)).then((res) => console.log(res.statusText)).catch((error) => console.log(error.response.statusText));
            break;
        case WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT:
            http.get('/warehouse/available').then((response) => console.log(response.data)).catch((error) => console.log(error.response.status));
            break;
        case WarehouseServiceMessages.GET_ALL_INGREDIENT:
            http.get('/warehouse/').then((response) => console.log(response.data)).catch((error) => console.log(error.response.status));
            break;
        default: //restock
            const body = fromStringToInput(input)
            const quantity = {
                "quantity": body.quantity
            }
            http.put('/warehouse/' + body.name, quantity).then((res) => console.log(res.statusText)).catch((error) => console.log(error.response.statusText));
            break;
    }
}