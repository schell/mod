mod({
	name : 't2_1',
	dependencies : [
        'tests/testSeq.js'
	],
	init : function initT2_1(testSeq) {
		console.warn('initializing t2_1');
        testSeq.seq += '-t2_1';
		return {
			name : 't2_1'
		};
	}
});