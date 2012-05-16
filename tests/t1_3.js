mod({
	name : 't1_3',
	dependencies : [
        'tests/testSeq.js',
		'tests/t1_2.js'
	],
	init : function initT1_3(testSeq, t1_2) {
		console.warn('initializing t1_3');
        
        assert.eq(t1_2.name, 't1_2', 't1_2 is loaded.');
		testSeq.seq += '-t1_3';
        
		return {
			name : 't1_3'
		};
	}
});