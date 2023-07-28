export function containsAll<T>(input: Array<T>, matches: Array<T>): boolean {
	for (const m of matches) {
		if (!input.includes(m)) {
			return false;
		}
	}
	return true;
}
