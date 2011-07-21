var requireTestOne = {
	dependencies : [
		'requireTestOne.js', // circular, will be removed by require
		'requireTestTwo.js'
	],
	init : function () {
		var indexOfSource = require.completedLoads.indexOf('requireTestOne.js');
		var loaded = indexOfSource > -1;
		return {
			done : true,
			error : !assert.eq(loaded, true, 'requireTestOne is loaded')
		}
	}
};

require(requireTestOne.dependencies, function requireTestOneCallback() {
	requireTestOne = requireTestOne.init();
	assert.eq(requireTestOne.done, true, 'requireOneTest is done');
	assert.eq(requireTestOne.error, false, 'requireOneTest did not error');
	assert.eq(sequence, '32', 'sequence of callbacks is 3,2');
	sequence += '1';
});