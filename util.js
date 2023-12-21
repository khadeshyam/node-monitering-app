const heavyTask = () => {
	return new Promise((resolve, reject) => {
		const random = Math.random();
		const responseTime = Math.floor(random * 2000); // Random response time up to 10 seconds
		setTimeout(() => {
			if (random < 0.5) {
				resolve({ message: 'Task completed', responseTime });
			} else {
				reject({ error: 'Error occurred', responseTime });
			}
		}, responseTime);
	});
}

export { heavyTask };