mod({
	name : 't1',
	dependencies : [
        'tests/testSeq.js',
		'tests/t1_1.js'
	],
	init : function initT1(testSeq, t1_1) {
		console.warn('initializing t1');
		
        assert.suite = "T1 tests";
		testSeq.seq += '-t1';
		assert.eq(testSeq.seq, '-t2_1-t2-t1_2-t1_3-t1_1-t1', 'modules init\'d in correct order');
        
		return {
			name : 't1'
		};
	}
});