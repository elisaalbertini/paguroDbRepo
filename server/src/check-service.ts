import { RequestMessage, ResponseMessage, WarehouseServiceMessages } from './utils/messages'
import { Service } from './utils/service';
import axios from 'axios';
import { fromStringToInput, fromStringToArrayInput } from './string-utils';

const http = axios.create({
    baseURL: 'http://localhost:8080'
});

export function check_service(message: RequestMessage, ws: any) {
    console.log('received: %s', message);
    switch (message.client_name) {
        case Service.WAREHOUSE:
            warehouse_api(message.client_request, message.input, ws)
            break;
        case Service.MENU:
            // TODO
            break;
        default:
            // TODO
            break;
    }
}

function warehouse_api(message: WarehouseServiceMessages, input: string, ws: WebSocket) {
    switch (message) {
        case WarehouseServiceMessages.CREATE_INGREDIENT:
            handleResponse(http.post('/warehouse/', fromStringToInput(input)), ws)
            break;     
        case WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY:
            handleResponse(http.put('/warehouse/', fromStringToArrayInput(input)), ws)      
            break;
        case WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT:
            handleResponse(http.get('/warehouse/available'), ws)
            break;
        case WarehouseServiceMessages.GET_ALL_INGREDIENT:
            handleResponse(http.get('/warehouse/'), ws)
            break;
        default: //restock
            const body = fromStringToInput(input)
            const quantity = {
                "quantity": body.quantity
            }
            handleResponse(http.put('/warehouse/' + body.name, quantity), ws)
            break;
    }
}

function handleResponse(promise: Promise<any>, ws:WebSocket){
    promise.then((res) => {            
        const msg: ResponseMessage = {
            message: res.statusText,
            code: res.status,
            data: JSON.stringify(res.data)
        }
        ws.send(JSON.stringify(msg))
    }).catch((error) => {
        const msg: ResponseMessage = {
            message: error.response.statusText,
            code: error.response.status,
            data: ""
        }
        ws.send(JSON.stringify(msg))
    });
   
}