/* global window:false */

window.FileDialog = [
  function() {
    var buttonElement = null;
    var inputElement = null;
    var fileDialogLink = function(scope, element) {
      buttonElement = element.find('button');
      resetFileInput(scope);
      buttonElement.bind('click', function(event) {
        event.stopPropagation();
        if (inputElement) {
          inputElement.click();
        }
      });
      scope.setError = function(msg) {
        scope.$apply(function() {
          scope.selectedFile = null;
          scope.errorMessage = msg;
        });
      };
      scope.setFile = function(file) {
        scope.$apply(function() {
          scope.errorMessage = '';
          scope.selectedFile = file;
        });
      };
      scope.$watch('resetInputFile', function() {
        if (scope.resetInputFile) {
          resetFileInput(scope);
        }
      });
    };
    var resetFileInput = function(scope) {
      if (inputElement != null) {
        inputElement.remove();
      }
      var input = window.document.createElement('input');
      var inputAttr = window.document.createAttribute('type');
      inputAttr.value = 'file';
      input.setAttributeNode(inputAttr);
      inputAttr = window.document.createAttribute('style');
      inputAttr.value = 'visibility:hidden; height: 0px;';
      input.setAttributeNode(inputAttr);
      if (!scope.isSingleFile) {
        inputAttr = window.document.createAttribute('multiple');
        inputAttr.value = 'multiple';
        input.setAttributeNode(inputAttr);
      }
      buttonElement.after(input);
      inputElement = window.angular.element(input);
      inputElement.bind('click', function(event) {
        event.stopPropagation();
      });
      inputElement.bind('change', function(e) {
        if (!e.target.files.length) {
          return;
        }
        var file = e.target.files[0];
        if (file.size > scope.maxFileSizeMb * 1048576) {
          scope.setError('Max file size is ' + scope.maxFileSizeMb + 'mb');
          return;
        }
        scope.setFile(file);
      });
      scope.resetInputFile = false;
    };
    return {
      restrict: 'E',
      replace: true,
      scope: {
        buttonContent: '@',
        buttonClass: '@',
        isSingleFile: '@',
        maxFileSizeMb: '@',
        selectedFile: '=',
        errorMessage: '=',
        resetInputFile: '='
      },
      template: '<span><button class="{{buttonClass}}">{{buttonContent}}</button></span>',
      link: fileDialogLink
    };
  }
];
