class BaseCounter {
	protected value: number;
	
	constructor() {
		this.value = 0;
	}
      
	increment() {
		this.value++;
	}

	decrement() {
		this.value--;
	}
      
	reset() {
		this.value = 0;
	}
      
	getValue() {
		return this.value;
	}
}
      
export {BaseCounter};