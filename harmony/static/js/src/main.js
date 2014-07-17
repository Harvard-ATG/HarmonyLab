define(['app/router'], function(router) {
	router([
		{re: /^\/?$/, app: 'app/components/app/play'},
		{re: /^\/exercise\/\d+$/, app: 'app/components/app/exercise'}
	]);
});
