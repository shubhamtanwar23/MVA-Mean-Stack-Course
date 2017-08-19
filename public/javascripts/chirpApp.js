var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $location, $http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	$rootScope.logged_out = false;
	
	$rootScope.signout = function() {
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
    	$rootScope.logged_out = true;
    	$location.path('/');
	};
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})
		//the my-chirp display
		.when('/my-chirp', {
			templateUrl: 'myChirp.html',
			controller: 'myChirpController'
		});
});

app.factory('postService', function($resource) {
	return $resource('/api/posts/:id');
});


app.controller('mainController', function(postService, $scope, $rootScope, $http){

	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
	
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $rootScope.logged_out = false;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $rootScope.logged_out = false;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});


app.controller('myChirpController', function($scope, $http, $rootScope) {
	$scope.posts = [];

	$http.get('/api/my-chirp/posts/' + $rootScope.current_user).success(function(data) {
		$scope.posts = data;
	});
	
	$scope.delete = function(id) {
		$http.delete('/api/posts/' + id).success(function() {
			console.log('deleted');
		});
	
		
		$http.get('/api/my-chirp/posts/' + $rootScope.current_user).success(function(data) {
			$scope.posts = data;
		});
		
	};

});