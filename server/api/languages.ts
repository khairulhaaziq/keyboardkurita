import { promises as fs } from "fs";
import path from "path";
import type {
	CharLogStatus,
	WordType,
	CharacterMetadata,
	WordMetadata,
} from "@/types";

const getRandomWords = (allWords: string[], numWords: number): string[] => {
	const wordsSet = new Set();

	while (wordsSet.size < numWords) {
		const randomWord =
			allWords[Math.floor(Math.random() * allWords.length)];
		wordsSet.add(randomWord);
	}

	return Array.from(wordsSet);
};

const insertSpacerObject = (
	words: string[],
	wordObjects: WordMetadata[]
): void => {
	for (let i = 0; i < words.length - 1; i++) {
		wordObjects.splice(i * 2 + 1, 0, {
			word: " ",
			characters: [
				{
					character: " ",
					timing: 0,
					status: "pending",
					char_index: 0,
					word_index: i,
				},
			],
			index: i,
			type: "separator",
		});
	}
};

const generateWordsData = async (
	numWords: number,
	language: string
): Promise<{
	all_data: WordMetadata[];
	all_words: string[];
	data: WordMetadata[];
	num_characters: number;
	num_words: number;
}> => {
	const filePath = path.join(
		process.cwd(),
		"public",
		"languages",
		`${language}.json`
	);

	let languageData;
	let allWords;

	try {
		const fileContent = await fs.readFile(filePath, "utf-8");
		languageData = JSON.parse(fileContent);
		allWords = languageData.words;
	} catch (error) {
		console.error("Error loading language file:", error);
		throw new Error("Language file not found or invalid");
	}

	const selectedWords = getRandomWords(allWords, numWords);

	const wordObjects: WordMetadata[] = selectedWords.map((word, index) => {
		const characters: CharacterMetadata[] = word
			.split("")
			.map((character, charIndex) => {
				return {
					character,
					timing: 0,
					status: "pending",
					char_index: charIndex,
					word_index: index,
				};
			});

		return {
			word,
			characters,
			index,
			type: "word",
		};
	});

	insertSpacerObject(selectedWords, wordObjects);

	const numCharacters = selectedWords.join("").length;

	return {
		all_data: wordObjects,
		all_words: selectedWords,
		data: wordObjects,
		num_characters: numCharacters,
		num_words: numWords,
	};
};

export default defineEventHandler(async (e) => {
	const { num, lang, char, difficulty } = getQuery(e);

	const numWords = parseInt(num as string) || 10;
	const language = (lang as string) || "english";

	const returnVal = await generateWordsData(numWords, language);
	const nextReturnVal = await generateWordsData(numWords, language);

	return { ...returnVal, next_data: { ...nextReturnVal } };
});