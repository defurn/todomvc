/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store, dbug) {
		'use strict';

		var todos = $scope.todos = store.todos;
		$scope.activeTags = [];
		$scope.newTodo = '';
		$scope.editedTodo = null;

		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};
		});

		$scope.addTodo = function () {
			const parsedTitle = $scope.parseTags($scope.newTodo.trim())
			
			var newTodo = {
				title: parsedTitle.title,
				completed: false,
				tags:parsedTitle.tags,
				display: parsedTitle.display
			};
			
			if (!newTodo.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newTodo)
				.then(function success() {
					$scope.newTodo = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.parseTags = function (todoText) {
			// not fully vetted regex...

			let item = {display: todoText}
			let regex = /\#\S*(\s*|\#|$)/g
			let tags = todoText.match(regex)
			if (tags == null) { 
				item.title = todoText.trim()
				item.tags = null

			} else {
				let trimTags = tags.map((tag) => { return tag.trim() })
				let title = todoText.replace(regex, '').trim()
				item.title = title.trim()
				item.tags = trimTags

			}
			return item
		}

		$scope.toggleFilterTags = function (tag) {
			let i = $scope.activeTags.indexOf(tag)
			if (i < 0) {
				$scope.activeTags.push(tag)
			} else {
				$scope.activeTags.splice(i, 1) // = $scope.activeTags.replace(tag,'');
			}
			return $scope.activeTags
		}

		$scope.filterTags = function(todo) {
			// default is to display all tags, if filter list is empty
			if ($scope.activeTags.length == 0) { return true }
			if (todo.tags == null) { return false }
			var inList = false
			todo.tags.forEach((tag) => {
				tag.trim()
				if ($scope.activeTags.indexOf(tag) >= 0) {
					inList = true
				}
			})
    		return inList
		};





		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};


		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			const parsedTitle = $scope.parseTags(todo.display.trim());
			todo.title = parsedTitle.title
			todo.tags = parsedTitle.tags
			todo.display = parsedTitle.display
			
			if (todo.display === $scope.originalTodo.display){
				$scope.editedTodo = null;
				return;
			}
			

			store[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {}, function error() {
					todo.title = $scope.originalTodo.title;
					todo.tags = $scope.originalTodo.tags;
					todo.display = $scope.originalTodo.display;
				})
				.finally(function () {
					$scope.editedTodo = null;
				});
		};

		$scope.revertEdits = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
		};

		$scope.removeTodo = function (todo) {
			store.delete(todo);
		};

		$scope.saveTodo = function (todo) {
			store.put(todo);
		};

		$scope.toggleCompleted = function (todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			store.put(todo, todos.indexOf(todo))
				.then(function success() {}, function error() {
					todo.completed = !todo.completed;
				});
		};

		$scope.clearCompletedTodos = function () {
			store.clearCompleted();
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
		};
	});
