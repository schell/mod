var requireTestThree = {
	dependencies : [
		'requireTestOne.js', // circular
		'requireTestTwo.js', // circular
		'requireTestThree.js'
	],
	init : function () {
		var indexOfSource = require.completedLoads.indexOf('requireTestThree.js');
		var loaded = indexOfSource > -1;
		return {
			done : true,
			error : !assert.eq(loaded, true, 'requireTestThree is loaded')
		}
	}
};

require(requireTestThree.dependencies, function requireTestTwoCallback() {
	requireTestThree = requireTestThree.init();
	assert.eq(requireTestThree.done, true, 'requireTestThree is done');
	assert.eq(requireTestThree.error, false, 'requireTestThree did not error');
	assert.eq(sequence, '', 'there have been no other callbacks called');
	sequence += '3';
});