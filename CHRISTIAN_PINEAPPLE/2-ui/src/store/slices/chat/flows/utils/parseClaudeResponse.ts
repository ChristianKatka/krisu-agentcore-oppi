import { Citation } from "../../../../../models/thread";

export const parseClaudeResponse = (
  rawClaudeResponse: any
): {
  parsedText: string;
  citations: Citation[];
} => {
  if (
    !rawClaudeResponse?.content ||
    !Array.isArray(rawClaudeResponse.content)
  ) {
    return { parsedText: "", citations: [] };
  }

  const textBlocks: string[] = [];
  const citationMap = new Map<string, Citation>();

  for (const block of rawClaudeResponse.content) {
    if (block.type === "text" && typeof block.text === "string") {
      textBlocks.push(block.text);
    }

    if (block.type === "text" && Array.isArray(block.citations)) {
      for (const citation of block.citations) {
        if (
          citation.type === "web_search_result_location" &&
          typeof citation.url === "string"
        ) {
          // Use URL as unique key
          if (!citationMap.has(citation.url)) {
            citationMap.set(citation.url, {
              title: citation.title,
              url: citation.url,
              cited_text: citation.cited_text,
            });
          }
        }
      }
    }
  }

  const combinedText = textBlocks.join("\n\n");
  const parsedText = combinedText.replace(/\\n/g, "\n");
  const citations = Array.from(citationMap.values());

  return { parsedText, citations };
};
