{
//    let creator = require("./NewPiEditCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Editor_Definition = ws "editor" ws name:var ws
        x:standardBooleanProjection? ws
        y:standardReferenceSeparator? ws
        projGroup:projectionGroup ws
//{
//    let projectionGroups = [];
//    if (!!projGroup) {
//        projectionGroups.push(projGroup);
//    }
//    return creator.createEditUnit({
//        "name"                          : name,
//        "standardBooleanProjection"     : x,
//        "standardReferenceSeparator"    : y,
//        "projectiongroups"              : projectionGroups,
//        "location"                      : location()
//    });
//}

propProjectionStart     = "${"
propProjectionEnd       = "}"
projection_begin        = ws "["
projection_end          = "]" ws
projection_separator    = "|"

standardBooleanProjection = "boolean" projection_begin t1:text projection_separator t2:text projection_end
//{
//    return creator.createStdBool({
//        "trueKeyword"   : t1,
//        "falseKeyword"  : t2,
//        "location"      : location()
//    });
//}

standardReferenceSeparator = "referenceSeparator" projection_begin t:text projection_end
//{ return t; }

projectionGroup = projections:classifierProjection*
//{
//    return creator.createProjectionGroup({
//        "projections"   : projections,
//        "location"      : location()
//    });
//}

classifierProjection =
            concept:conceptRef curly_begin ws
                projection:projection?
                table: tableProjection?
                extras: extraClassifierInfo
            curly_end
//{
//    return creator.createClassifierProjection({
//        "classifier"       : concept,
//        "projection"       : projection,
//        "tableProjection"  : table,
//        "classifierInfo"   : extras,
//        "location"         : location()
//    });
//}

extraClassifierInfo =
                trigger:trigger?
                referenceShortcut:referenceShortcut?
                symbol:symbol?
//{
//    return creator.createClassifierInfo({
//        "trigger"          : trigger,
//        "referenceShortcut": referenceShortcut,
//        "symbol"           : symbol,
//        "location"         : location()
//    });
//}

projection = projection_begin lines:lineWithOptional* projection_end
//{
//    return creator.createProjection({
//        "lines" : lines,
//        "location": location()
//    });
//}

tableProjection = "table" ws projection_begin ws
                       headers:( head:textBut
                                tail:(ws projection_separator ws v:textBut { return v; })* ws
                                    { return [head].concat(tail); }
                               )?
                       cells:( head:property_projection
                                tail:(ws projection_separator ws v:property_projection { return v; })*
                                    { return [head].concat(tail); }
                             ) ws
                   projection_end
//              {
//                    return creator.createTableProjection({ "headers" : headers, "cells": cells, "location": location() });
//              }

lineWithOptional = items:(templateSpace / text / property_projection / optionalProjection / superProjection / newline )+
//                {
//                    return creator.createlineWithOptional( {"items": items} );
//                }

lineWithOutOptional = items:(templateSpace / text / property_projection / superProjection / newline )+
//                {
//                    return creator.createlineWithOutOptional( {"items": items} );
//                }

templateSpace = s:[ \t]+
//                {
//                    return creator.createIndent( { "indent": s.join(""), "location": location() });
//                }

text        = chars:anythingBut+
//            {
//                return creator.createText( chars.join("") );
//             }

property_projection = propProjectionStart ws
                     exp:var (colon_separator editorName:var)? ws join:listJoin? t:tableInfo? keyword:keywordDecl? ws
                 propProjectionEnd
//            {
//                return creator.createPropertyProjection( { "expression": exp, "listInfo": join, "tableInfo": t, "keyword":keyword, "location": location() });
//            }

optionalProjection = projection_begin "?" lines:lineWithOutOptional* projection_end
//                {
//                    return creator.createOptionalProjection( {"optional": optional, "items": items} );
//                }

superProjection = projection_begin "=>" ws exp:var (colon_separator editorName:var)? ws projection_end

tableInfo = "table" ws dir:("rows" / "columns")? ws
//            {
//                return creator.createTableInfo( {"direction": dir, "location": location()} );
//            }

keywordDecl = projection_begin t1:text (projection_separator t2:text)? projection_end //{return text;}

listJoin =  l:listJoinSimple+
//                {
//                    let directionObject = l.find(j => !!j.direction);
//                    let joinTypeObject  = l.find(j => !!j.joinType);
//                    let joinTextObject  = l.find(j => !!j.joinText);
//
//                    return creator.createListInfo( {"direction": (!!directionObject ? directionObject.direction : undefined),
//                                                    "joinType" : (!!joinTypeObject ? joinTypeObject.joinType    : undefined),
//                                                    "joinText" : (!!joinTextObject ? joinTextObject.joinText    : undefined),
//                                                    "location" : location()} );
//                }

listJoinSimple =      (direction:direction  { return {"direction" : direction, "location": location() }; } )
                    / (type:listJoinType    { return {"joinType"  : type, "location": location()      }; } )
                    / (t:joinText           { return {"joinText"  : t, "location": location()         }; } )

joinText = "[" t:text "]" ws
//            {
//                return t.join("");
//            }

direction = dir:("horizontal" / "vertical") ws
//                {
//                    return creator.createListDirection( {"direction": dir, "location": location() } );
//                }

listJoinType = joinType:("separator" / "terminator" / "initiator") ws
//                {
//                    return creator.createJoinType( {"type": joinType, "location": location() } );
//                }


conceptReference = referredName:var
//{
//    return expCreator.createConceptReference({"name": referredName, "location": location()})
//}

trigger = "trigger" ws equals_separator ws "\"" value:string "\"" ws
    {
        return value
    }

referenceShortcut = "referenceShortcut" ws equals_separator ws propProjectionStart ws exp:var propProjectionEnd ws
    {
        return exp
    }

symbol = "symbol" ws equals_separator ws "\"" value:string "\"" ws
    {
        return value
    }

priority = "priority" ws ":" ws "\"" value:string "\"" ws
    {
        return value
    }

// This rule parses text until one of the special starter chars or string is encountered.
textBut  = chars:anythingBut+
            {
                return chars.join("").trim();
            }

// The 'anythingBut' rule parses text until one of the special starter chars or string is encountered.
// Note that these chars can still be escaped, through the 'char' rule in the basic grammar
// The following are excluded:
// propProjectionStart     = "${"
// projection_begin        = ws "["
// projection_separator    = "|"
anythingBut = !("${" / newline / "[" / "|" / "]") src:char
            {
                return src;
            }

//anythingButEndBracket = !("]") src:char
//            {
//                return src;
//            }
//            
//anythingButBar = !("|") src:anythingBut
//            {
//                return src;
//            }

newline     = "\r"? "\n"
//                {
//                    return creator.createNewline();
//                }
