import React from "react";
import { FuseResultWithMatches } from "fuse.js";

type FuseResultWithHighlight<T, F extends FuseResultWithMatches<T>> = F & {
  highlights: { [key in keyof T]?: React.ReactNode };
};

export const fuseWithHighlights = <
  T extends any,
  F extends FuseResultWithMatches<T>
>(
  fuseMatches: F[]
): FuseResultWithHighlight<T, F>[] => {
  return fuseMatches.map(resultItem => {
    return {
      ...resultItem,
      highlights: (resultItem.matches as FuseMatches<T>).reduce<
        (FuseResultWithHighlight<T, F>)["highlights"]
      >((prev, matchItem) => {
        var text = resultItem.item[matchItem.key] as string;
        var result = [];
        var matches = ([] as [number, number][]).concat(matchItem.indices); // limpar referencia
        var pair = matches.shift();

        for (var i = 0; i < text.length; i++) {
          var char = text.charAt(i);
          if (pair && i == pair[0]) {
            result.push("<b>");
          }
          result.push(char);
          if (pair && i == pair[1]) {
            result.push("</b>");
            pair = matches.shift();
          }
        }
        return {
          ...prev,
          [matchItem.key]: (
            <span
              dangerouslySetInnerHTML={{
                __html: result.join("")
              }}
            />
          )
        };
      }, {} as any)
    };
  });
};
