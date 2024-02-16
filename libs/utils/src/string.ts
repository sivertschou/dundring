export const padLeadingZero = (nr: number) => nr.toString().padStart(2, '0');

export const generateRandomString = (length: number) => {
	const alphabet = '0123456789'.split('');
	const generatedString = new Array(length)
		.fill(0)
		.map(() => {
			const index = Math.random() * alphabet.length;
			return alphabet[Math.floor(index)];
		})
		.join('');

	return generatedString;
};

export const removeDuplicateWords = (words: string[]): string[] =>
	Array.from(new Set(words));

export const sortedObject = (object: {[key: string]: any}) => {
	const keys = Object.keys(object);
	keys.sort();

	const sortedObject: {[key: string]: any} = {};
	keys.map(key => (sortedObject[key] = object[key]));

	return sortedObject;
};

export const sortedStringifiedObject = (object: {[key: string]: any}) =>
	JSON.stringify(sortedObject(object));
