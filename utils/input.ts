export function focusInput() {
	setTimeout(document.getElementById('MasterInput')?.focus(),0);
}

export function calculateWPM(totalChars: number, elapsedTime: number) {
	const words = totalChars / 5;
	const minutes = elapsedTime / 1000 / 60;
	return words / minutes;
}

export function calculateRawWPM(totalChars: number, elapsedTime: number) {
	const words = totalChars / 5;
	const minutes = elapsedTime / 1000 / 60;
	return words / minutes;
}