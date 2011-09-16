var assert = (function () {
	/**
	 *  Our testing facilities
	 *
	 *  @author Schell Scivally
	 *  @since  Thu Aug 19 14:31:36 PDT 2010
	 */
    var passes = 0, fails = 0;
    var failStrings = [];
    return {
        eq : function (uno, dos, statement) {
			console.log(statement)
            console.log('	asserting '+uno+' == '+dos);
            if (uno !== dos) {
                var failString = '('+uno+' !== '+dos+') '+assert.suite+' - '+statement;
                console.log('	ERROR '+failString);
                failStrings.push(failString);
                fails++;
                return false;
            }
            passes++;
            return true;
        },
        stat : function () {
            console.log('\n');
            if (fails == 0) {
                console.log('OKAY!');
            } else {
                console.log('FAIL...');
                var n = failStrings.length;
                for (var i = 0; i < n; i++) {
                    console.log('	'+ i + ' ' + failStrings[i]);
                }
            }
            console.log('passes:'+passes+' fails:'+fails);
        },
		suite : 'Generic Tests'
    }
})();