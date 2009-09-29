/*
Copyright (c) 2009 Achim Bode
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.  
*/
 
CmdUtils.CreateCommand({
  name: "knox",
  homepage:"http://blog.achimbo.de",
  author:{name:"Achim Bode", email:"jo@achimbo.de"},
  license:"MIT",
  version:"090719",
  takes: {"to (optional)": noun_arb_text},
  
  description:"Vers. 090709-05. logs current page in an open mediawiki page: url, title, your comment in Ubiquity command line if provided, and marked text on the page.",
  
  help:"If text from the current page is selected, the command will paste the selected text and current  url, the page title and the text entered into the console in the wiki. Please adapt the variables pageTitleSequence (some Sequence of text appering in every pagetitle of your wiki in edit mode) and editorTextAreaID (open a wiki page in edit mode, choose 'View - Page Source' in Firefox  - you'll find it when you search for 'textarea' in the source code).",
  
  pageTitleSequence: "Bearbeiten von Knowlet",
  editorTextAreaID: "wpTextbox1",
 
  preview: function( pblock, konsole )
  {  
    var doc = this.getDocument();
    var sel = this.getSelection();
    
    //generate the preview
    var headline = "knowlet: <br/>";
    var ausgabe = this.createString( konsole );
    //var ausgabe = this.getSelection() );
    //var ausgabe = this.objectToString( this.getTextAreaWithSelection() );
    ausgabe = headline + ausgabe;
        
    pblock.innerHTML = ausgabe;
    //displayMessage( this.createString( konsole ) );
  },
  
  getTextAreaWithSelection:function(){
    var textareas = this.getDocument().getElementsByTagName("textarea");
    for (var i=0; i < textareas.length; i++) {
      var ta = textareas[i];
      if (ta.selectionStart != ta.selectionEnd) return ta;
      //am Anfang sind beide = Textlänge, dann letzte Position (auch wenn TA ohne Fokus)
    }
    return null;
  },
  
  getSelectedTextFromTextArea:function( ta ) {
    return ta.textContent.substr( ta.selectionStart, ta.selectionEnd);
  },
  
  getKnowletEditor: function() {
    return this.getLastTabStartingWith( this.pageTitleSequence ).document.getElementById( this.editorTextAreaID );
  },
  
  getKnowletContent: function() {
    return this.getKnowletEditor().value;
  },
  
  pasteKnowlet: function( appendText ) {
    this.getKnowletEditor().value = this.getKnowletContent() + appendText;
  },
 
  getLastTabStartingWith: function( title ){
    var tabs = Utils.tabs.search( title );
	  displayMessage( "getLastTabStartingWith: " + this.objectToString( tabs ) );
    
	// old Parser1 syntax:
	/*var kompletterSeitenName = "";
    var gefunden = false;
    
    //finde den letzten Seitennamen im Hash-Objekt, das von Utils.tabs.search( title )
    //zurückgegeben wurde (die Seitennamen stehen im prop-Enumerator/-Iterator):
    for (prop in tabs){
      kompletterSeitenName = prop;
      gefunden = true;
    }
    if( !gefunden ) this.onNoKnowletOpen();
    var tabs = Utils.tabs.get( kompletterSeitenName );
    return tabs;*/
	
	// new Parser1 syntax:
	var gefunden = tabs.length > 0;
	if( !gefunden ) this.onNoKnowletOpen();
	return tabs[ tabs.length-1 ];
  },
  
  onNoKnowletOpen: function() {
    displayMessage("ACHTUNG: Kein Knowlet geöffnet");
  },
 
  objectToString:function( o ) {
    var str = "";
    for (var prop in o) {
      str += prop; //Property-Name anzeigen
      str += " = " + o[prop]; //Property-Inhalt anzeigen
      str += " [" + typeof( o[prop] ) + "]"; // Datentyp anzeigen
      str += "<br/>"; // Zeilenumbruch hinzufügen (Listenansicht)
    }
    return str;
  },
  
    scrollEditorToBottom:function() {
    var ta = this.getKnowletEditor();
    if(ta && ta.createTextRange){
      rng=ta.createTextRange();
      rng.collapse(false);
      rng.select();
    }
  },
  
  createString: function( konsole ) {
    var doc = this.getDocument();
    var sel = this.getSelection();
    var title = doc.title;  
    var url = doc.location.href;
    var string = "";
 
    var eintrag = konsole.text; // konsole.text oder konsole.html verwenden?
    if ( eintrag == sel ) eintrag = ""; // wenn identisch mit Selektion, dann weglassen
    // Wenn nicht leer ("") 2 Returns einfügen (bei "" kommen danach ohnehin 2 Zeilenumbüche)
    // alle Backslash-n \n durch echte Linefeeds ersetzen
    if ( eintrag != "" && eintrag != undefined ) { //wenn Eintrag Konsole, dann Eintrag fett...
      var semikolon = ( eintrag.charAt(0) != "=" ) ? ";" : ""; // Semikolon wird nur gesetzt, wenn keine Überschrift
      string = "\n\n" + semikolon + eintrag.replace(/\\n/g, "\u000a") + "\n\n" + title + "\n\n" + ":" + url;
      // bereits im String enthaltene Linefeeds müssen ersetzt werden sonst werden sie "woertlich" ausgegeben
    } else { // sonst Seitentitel fett drucken (;)
      string = "\n\n;" + title + "\n\n" + ":" + url;
    }
    if ( sel != "" ) string +=  "\n\n<pre>" + sel + "</pre>"; //&#92; = Ansi-Escapesequenz für Backslash
    return string;
  },
  
  execute: function( konsole, test2 )
  {
    //this.pasteKnowlet( konsole.text );
    this.pasteKnowlet( this.createString( konsole ) );
    //displayMessage( "execute: " + this.createString( konsole.text ) );
  },
  
  getDocument:function()
  {
    return CmdUtils.getDocumentInsecure();
  },
  
  getSelection:function()
  {
    /*var ta = this.getTextAreaWithSelection();
    if( ta != null ) {
      return this.getSelectedTextFromTextArea( ta );
    } else {
      return context.focusedWindow.getSelection();
    }*/
    return context.focusedWindow.getSelection();
  },
})
