angular.module('swot').controller('EditQuizCtrl', function (quiz, $scope, $timeout, focus) {
    $scope._id = _quizId || null;
    $scope.name = "";
    $scope.questions = [{}];
    $scope.alerts = [];
    $scope.saveStatus = "";
    $scope.saveMessage = "";
    $scope.savedSuccessfully = true;
    $scope.addQuestionTooltipsRemaining = 2;    // Stop showing the tooltip after adding a couple questions.
    
    $scope.isNew = function () {
        return $scope._id === null;
    }

    $scope.serialize = function () {
        return {
            _id: $scope._id,
            name: $scope.name,
            questions: $scope.questions
        };
    };

    $scope.deserialize = function (data) {
        $scope.name = data.name;
        $scope.questions = data.questions;
    };

    $scope.load = function () {
        quiz.load($scope._id, function (response) {
            $scope.deserialize(response.quiz);
        }, function (error) {
            $scope.showError('An error occurred while loading the quiz: \n' + error);
        });
    };

    $scope.save = function () {
        $scope.closeAllAlerts();

        var onSaveFinished = function () {
            $scope.saveStatus = "Saved";
            $scope.savedSuccessfully = true;
            $timeout(function () {
                $scope.saveStatus = "";
            }, 2000);
        };

        var onError = function (error) {
            $scope.saveStatus = "";
            $scope.saveMessage = 'An error occurred while saving the quiz: ' + error;
            $scope.savedSuccessfully = false;
        };

        if ($scope.isNew()) {
            quiz.create($scope.serialize(), function (id) {
                $scope._id = id;
                onSaveFinished();
            }, onError);
        } else {
            quiz.save($scope.serialize(), onSaveFinished, onError);
        }
    };

    $scope.deleteQuiz = function () {
        $scope.closeAllAlerts();

        quiz.deleteQuiz($scope._id, function () {
            bootbox.alert("The quiz has been deleted successfully.", function () {
                window.location.href = "/quizzes";
            });
        }, function (error) {
            $scope.showError("An error occurred while deleting the quiz: " + error);
        });
    };

    $scope.addQuestion = function () {
        $scope.questions.push({});

        // Focus on the first input field for the newly-added question
        focus('newQuestionAdded');

        // Stop showing the tooltip on the Add Question button after adding a couple questions
        // Note that tooltip is now shown where there are no questions, so adding the first question
        // should not decrement the count.
        if ($scope.questions.length > 1) {
            $scope.addQuestionTooltipsRemaining--;
        }
    };

    $scope.removeQuestion = function (index) {
        $scope.questions.splice(index, 1);
    }

    $scope.sortableOptions = {
        update: function(e, ui) { },
        placeholder: 'sortable-list-placeholder',
        forcePlaceholderSize: true,
        start: function (e, ui) {
            ui.placeholder.height(ui.item.outerHeight());
        }
    };

    $scope.addQuestionTooltip = function () {
        if ($scope.addQuestionTooltipsRemaining <= 0 || $scope.questions.length == 0) {
            return "";
        }

        return "You can also add a question by hitting the TAB key after typing in the last answer.";
    }


    // Alerts
    // ------

    $scope.showError = function (message) {
        return $scope.alerts.push({ type: 'danger', msg: message }) - 1;
    };

    $scope.showSuccess = function (message) {
        return $scope.alerts.push({ type: 'success', msg: message }) - 1;
    };

    $scope.showInfo = function (message) {
        return $scope.alerts.push({ type: 'info', msg: message }) - 1;
    };

    $scope.showWarning = function (message) {
        return $scope.alerts.push({ type: 'warning', msg: message }) - 1;
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.closeAllAlerts = function() {
        $scope.alerts = [];
    };


    // Events
    // ------

    $scope.answerKeypress = function ($index, $event) {
        // Add new question when hitting TAB on the last input
        if ($index === $scope.questions.length - 1) {
            if ($event.keyCode === 9 &&  !$event.ctrlKey && !$event.metaKey && !$event.altKey && !$event.shiftKey) {
                $scope.addQuestion();
            }
        }
    }


    // Initialization
    // --------------

    if ($scope._id) { $scope.load(); }
});