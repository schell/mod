/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *	tests.js
 *	Tests certain modules.
 *	Copyright (c) 2011 Schell Scivally. All rights reserved.
 *
 *	@author	Schell Scivally
 *	@since	Tue Jul 19 11:08:32 PDT 2011
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
var assert = function () {
	/**
	 *  Our testing facilities
	 *
	 *  @author Schell Scivally
	 *  @since  Thu Aug 19 14:31:36 PDT 2010
	 */
    var passes = 0, fails = 0;
    var failStrings = [];
    return {
        eq : function (uno, dos, label) {
			label = label || '';
            console.log(label+'\n	asserting '+uno+' == '+dos);
            if (uno !== dos) {
                var failString = uno+' !== '+dos;
                console.log('ERROR '+failString);
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
                    console.log(n + ' ' + failStrings[i]);
                }
            }
            console.log('passes:'+passes+' fails:'+fails);
        }
    }
}();

var sequence = '';

var globalTests = (function () {
	var requireTests = function (callback) {
		console.log('running require tests...');
		require('requireTestOne.js', function requireTestsCallback() {
			assert.eq(sequence, '321', 'sequence of callbacks is 3,2,1');
			callback();
		});
	};
	
	return {
		requireTests : requireTests
	};
})();