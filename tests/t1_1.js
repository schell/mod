mod({
	name : 't1_1',
	dependencies : [
        'tests/testSeq.js',
		'tests/t1_3.js',
		'tests/t1_2.js'
	],
	init : function initT1_1(testSeq, t1_3, t1_2) {
		console.warn('initializing t1_1');
        
		testSeq.seq += '-t1_1';
		
        return {
			name : 't1_1'
		};
	}
});