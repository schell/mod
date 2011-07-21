var requireTestTwo = {
	dependencies : [
		'requireTestOne.js', // circular, will be removed by require
		'requireTestTwo.js', // circular
		'requireTestThree.js'
	],
	init : function () {
		var indexOfSource = require.completedLoads.indexOf('requireTestTwo.js');
		var loaded = indexOfSource > -1;
		return {
			done : true,
			error : !assert.eq(loaded, true, 'requireTestTwo is loaded')
		}
	}
};

require(requireTestTwo.dependencies, function requireTestTwoCallback() {
	requireTestTwo = requireTestTwo.init();
	assert.eq(requireTestTwo.done, true, 'requireTestTwo is done');
	assert.eq(requireTestTwo.error, false, 'requireTestTwo did not error');
	assert.eq(sequence, '3', 'only one callback has been called (third one)');
	sequence += '2';
});