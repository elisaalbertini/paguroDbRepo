/**
 * This interface represents the error that needs to be set when the requested information is not available.
 */
export interface NotAvailableError {
  error: boolean,
  errorMsg: string
}

/**
 * @returns the object with no error.
 */
export function createError(): NotAvailableError {
  return { error: false, errorMsg: "" }
}

/**
 * @returns the object for server error
 */
export function getServerError(): NotAvailableError {
  return getError("Server not available!")
}

/**
 * @returns the object for service error
 */
export function getMicroserviceError(): NotAvailableError {
  return getError("Microservice not available!")
}

/**
 * 
 * @returns the object for warehouse error
 */
export function getWarehouseError(): NotAvailableError {
  return getError("Warehouse empty!")
}

function getError(message: string): NotAvailableError {
  return { error: true, errorMsg: message }
}



