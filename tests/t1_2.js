mod({
	name : 't1_2',
	dependencies : [
        'tests/testSeq.js',
	],
	init : function initT1_2(testSeq) {
		console.warn('initializing t1_2');

		testSeq.seq += '-t1_2';
	    
    	return {
			name : 't1_2'
		};
	}
});