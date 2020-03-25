define('RESTMode', function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var DocCommentHighlightRules = require("ace/mode/doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var RESTHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        "start": [
            {
                token : "comment",
                regex : "#.*$",
            },
            {
            token: "entity.name.function",
            regex: "(/)(?=.*/)",
            next: "pattern-state"
            },
            {
            token: "keyword.other",
            regex: /(?:replace|list)/
            },
            {
            token: "string",
            regex: "\"",
            next: "string-state"
            }
        ], // state: start
        "string-state":[
            {
                token: "constant.character.escape",
                regex: /\$[0-9]{1,2}/,
                next: "string-state"
            },
            {
                token: "constant.character.escape",
                regex: /\\[nt]/,
                next: "string-state"
            },
            {
                token: "string",
                regex: "\"",
                next: "start"
            },
            {
                token: "string",
                regex: ".",
                next: "string-state"
            }
        ],

        "pattern-state": [
            {
            token: "constant.character.escape",
            regex: /\\./
            },
            {
            token: "entity.name.function",
            regex: "/(?=[gimsuy]+)",
            next: "flags"
            },
            {
            token: "entity.name.function",
            regex: "/",
            next: "start"
            },
            {
            token: "entity.name.function",
            regex: "."
            }
        ], // state: pattern-state
        "flags": [
            {
                token: "variable.language",
                regex: "[gimsuy]+",
                next: "start"
            }
        ]

    };

    this.normalizeRules();
};

RESTHighlightRules.metaData = {
    fileTypes: ["rest", "REST"],
    name: "REST"
};


oop.inherits(RESTHighlightRules, TextHighlightRules);

exports.RESTHighlightRules = RESTHighlightRules;
});