/**
 * This function replace the '_' with a white space
 * @param name that has to be beautified
 * @returns the beautified name
 */
export function beautifyDbName(name: string) {
	return name.replaceAll("_", " ")
}
