// ==UserScript==
// @name fanfiction.net sort
// @namespace http://www.darakong.net/userscripts
// @description Allows custom sorting of stories at fanfiction.net.
// @match http://www.fanfiction.net/*
// @version 0.1
// ==/UserScript==
//
// TODO: Add preference to auto sort
// TODO: Insert custom sort options into existing "Sort: " selection?

(function() {
    //
    // Utility Functions
    //

    function $(id) {
        return document.getElementById(id);
    }

    function html(node, text) {
        if (!node) {
            return null;
        }

        if (text) {
            node.innerHTML = text;
            return node;
        }
        else {
            return node ? node.innerHTML : "";
        }
    }

    //
    // Script Start
    //

    var autoSort = "reviews";

    var myform = document.getElementById( "myform" );
    if (!myform) {
        return;
    }

    // Add sort selection and button.
    var table = myform.getElementsByTagName( "table" );
    if (!table) {
        console.log("Couldn't find table with filter selections");
        return;
    }
    table = table[0];
    var formParent = table.childNodes[0].childNodes[0].childNodes[1];

    var sortFilter = document.createElement( "select" );
    var sortTypes = ["reviews", "words", "chapters"];
    html(sortFilter, '<option value="reviews">Reviews</option><option value="words">Words</option><option value="chapters">Chapters</option>');
    sortFilter.id = "sortFilter";
    formParent.appendChild( sortFilter );

    // Change the sort selection to match auto sort (if enabled).
    var autoSortIndex = sortTypes.indexOf(autoSort);
    if (autoSortIndex != -1) {
        sortFilter.selectedIndex = autoSortIndex;
    }

    var sortButton = document.createElement( "input" );
    sortButton.setAttribute( "type", "button" );
    sortButton.setAttribute( "value", "Sort" );
    sortButton.id = "sortButton";
    sortButton.onclick = function(e) {
        sortBy(sortTypes[sortFilter.selectedIndex]);
    };
    formParent.appendChild( sortButton );

    // TODO: Don't re-parse the data unless it's changed
    function sortBy(sortType) {
        var stories = myform.getElementsByClassName( "z-list" );
        var stories_data = myform.getElementsByClassName( "z-padtop2" );
        if (stories.length !== stories_data.length) {
            console.log( "Stories (" + stories.length + ") doesn't match metadata (" + stories_data.length + ")" );
            return;
        }

        var sort_data = [];
        for (var i = 0, length = stories.length; i < length; ++i) {
            function parseMetadata( raw ) {
                var metadata = null;

                var m = raw.match( /Rated: (.*)/ );
                if ( m ) {
                    metadata = { 
                        key : "rating", 
                        value : m[1]
                    };
                }

                m = raw.match( /Chapters: (.*)/ );
                if ( m ) {
                    metadata = { 
                        key : "chapters", 
                        value : +m[1]
                    };
                }

                m = raw.match( /Words: (.*)/ );
                if ( m ) {
                    metadata = { 
                        key : "words", 
                        value : +( m[1].replace( ",", "" ) )
                    };
                }

                m = raw.match( /Reviews: (.*)/ );
                if ( m ) {
                    metadata = { 
                        key : "reviews", 
                        value : +( m[1].replace( ",", "" ) )
                    };
                }

                return metadata;
            }

            // Add defaults so items sort properly.
            var story_data = {
                "rating" : "K",
                "chapters" : 0,
                "words" : 0,
                "reviews" : 0
            };
            var metadata_raw = html( stories_data[i] ).split( " - " );
            for (var j = 0, jlength = metadata_raw.length; j < jlength; ++j) {
                var parsed_data = parseMetadata( metadata_raw[j] );
                if (parsed_data) {
                    story_data[parsed_data.key] = parsed_data.value;
                }
            }
            story_data.html = stories[i];
            sort_data.push(story_data);
        }

        function sortByKey(list, key, descending) {
            function sortFunc(a, b) {
                if (key in a && key in b) {
                    if (descending) {
                        return b[key] - a[key];
                    } 
                    // ascending
                    else { 
                        return a[key] - b[key];
                    }
                }
                return 0;
            }

            list.sort(sortFunc);
        }

        sortByKey(sort_data, sortType, true);

        for (i = 0, ilength = sort_data.length; i < ilength; ++i) {
            myform.appendChild(sort_data[i].html);
        }
    }

    if (autoSort) {
        sortBy(autoSort);
    }
})();
