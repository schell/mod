mod({
    name : 't2',
    dependencies : [
        'tests/t2_1.js',
        'tests/testSeq.js'
    ],
    init : function initT2(t2_1, testSeq) {
        console.warn('initializing t2');

        assert.suite = "T2 tests";
        assert.eq(t2_1.name, 't2_1', 't2_1 is loaded.');
        testSeq.seq += '-t2';
        
        return {
            name : 't2'
        };
    }
});