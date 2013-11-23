/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** 
(c) by Victor Hornets
Wrap selected text with braces, curly-braces, parentheses, quotes and double quotes just like Sublime Text does. If no text selected, pressed symbol would be completed with closing symbol ('{' with '}' and so forth)
**/
define(function (require, exports, module) {
    "use strict";
    
    var CommandManager    = brackets.getModule("command/CommandManager"),
        EditorManager     = brackets.getModule("editor/EditorManager"),
        KeyBindingManager = brackets.getModule('command/KeyBindingManager'),
        Menus             = brackets.getModule("command/Menus"),
        ProjectManager    = brackets.getModule("project/ProjectManager"),
        FileUtils         = brackets.getModule("file/FileUtils"),
        DocumentManager   = brackets.getModule("document/DocumentManager");
    
    var keymap  = JSON.parse( require('text!keymap.json') ),
        prefix  = "brackets-wrapper.",
        enabled = true;

    function handle(symbols) {	
        if (!enabled) {
            return new $.Deferred().reject().promise();
        }
        
        symbols = symbols.split('');
        
        var editor       = EditorManager.getFocusedEditor();
        var insertionPos = editor.getCursorPos();
        var selText      = editor.getSelectedText();
                
        if(editor){
            editor.document.replaceRange(symbols[0] + selText + symbols[1], insertionPos, {                 line: insertionPos.line, 
                ch: insertionPos.ch - selText.length
            });
            
            if(!selText) {
                editor.setSelection(
                    {line:insertionPos.line, ch:insertionPos.ch + 1}
                ); 
            }  
            
            else {
                editor.setSelection(
                    {line:insertionPos.line, ch:insertionPos.ch + 1},
                    {line:insertionPos.line, ch:insertionPos.ch - selText.length + 1}
                );
            }
        }  
        
        else console.log('Something wrong');
    }
    
    keymap.forEach(function(el){
        var id = prefix + el.shortcut;
        
        CommandManager.register('Handling ' + el.symbols, id, function() {
            return handle(el.symbols);
        }); 
    
        KeyBindingManager.addBinding(id, el.shortcut);        
    });
    
    // Create menu item with checkbox that will enable/disable extension
    var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
    var cmdEnable = CommandManager.register('Enable Brackets Wrapper', prefix + "enable", function() {
        this.setChecked(!this.getChecked());
    });
    
    $(cmdEnable).on('checkedStateChange', function() {
        enabled = cmdEnable.getChecked();
    });
    
    menu.addMenuDivider();
    menu.addMenuItem(cmdEnable);
    cmdEnable.setChecked(enabled); 
    
    // Create menu item that opens the config .json-file    
    CommandManager.register("Edit Brackets Wrapper", prefix + "open-conf", function() {
        var src = FileUtils.getNativeModuleDirectoryPath(module) + "/keymap.json";
        
        DocumentManager.getDocumentForPath(src).done(
            function (doc) {
                DocumentManager.setCurrentDocument(doc);
            }
        );
    });
    
    menu.addMenuItem(prefix + "open-conf");    
});