"use strict";

angular.module('swot').directive('ckedit', function ($parse) {
    CKEDITOR.disableAutoInline = true;
    var counter = 0,
    prefix = '__ckd_';
 
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var getter = $parse(attrs.ngModel),
                setter = getter.assign;
 
            attrs.$set('contenteditable', true); // inline ckeditor needs this
            if (!attrs.id) {
                attrs.$set('id', prefix + (++counter));
            }

            // Function to update the model based on editor contents. Requires the 'event' argument
            // passed by CKEditor-generated events.
            var updateModel = function (e) {
                if (e.editor.checkDirty()) {
                    var ckValue = e.editor.getData();
                    scope.$apply(function () {
                        setter(scope, ckValue);
                        ctrl.$setViewValue(ckValue);
                    });
                    ckValue = null;
                    e.editor.resetDirty();
                }
            };
 
            // CKEditor stuff
            // Override the normal CKEditor save plugin
 
            CKEDITOR.plugins.registered['save'] =
            {
                init: function (editor) {
                    editor.addCommand('save',
                        {
                            modes: { wysiwyg: 1, source: 1 },
                            exec: function (editor) {
                                if (editor.checkDirty()) {
                                    var ckValue = editor.getData();
                                    scope.$apply(function () {
                                        setter(scope, ckValue);
                                    });
                                    ckValue = null;
                                    editor.resetDirty();
                                }
                            }
                        }
                    );
                    editor.ui.addButton('Save', { label: 'Save', command: 'save', toolbar: 'document' });
                }
            };

            // Load the config from the ckedit attribute
            var config = {};
            if (attrs.ckedit) {
                config = angular.fromJson(attrs.ckedit);
            }

            // Set defaults and internal config options
            config.on = {
                blur: updateModel,
                change: updateModel,
                instanceReady: function () {
                    scope.$emit('editorReady');
                }
            };

            config.title = false;   // Remove the useless tooltip
            var editorangular = CKEDITOR.inline(element[0], config); //invoke
 
            scope.$watch(attrs.ngModel, function (value) {
                if (editorangular.getData() !== value) {
                    editorangular.setData(value);
                }
            });
        }
    }
 
});
