var trap = function (arr) {
	if (arr.length < 3) return 0;

	let res = 0, n = arr.length;
	let left_max = [0], right_max = [0];

    for(let i = 1; i < n - 1; i++)
    {
		left_max.push(Math.max(left_max[i - 1], arr[i - 1]));
		right_max.unshift(Math.max(right_max[0], arr[n - i]));
    }
	left_max.push(0);
	right_max.unshift(0);

	for (let i = 1; i < n - 1; i++)
		res += Math.max(0, Math.min(left_max[i], right_max[i]) - arr[i]);
    return res;
}

const arr = [0,1,0,2,1,0,1,3,2,1,2,1];

console.log('Total amount of Water =', trap(arr));
