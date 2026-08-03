import { z } from "zod";
import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface APIResponse {
  class_name: string;
  confidence: number;
  // Add other properties as needed
}

interface SearchItem {
  link: string;
  title: string;
  snippet: string;
}

interface SearchResponse {
  data: {
    items: SearchItem[];
  };
}

export const imageRouter = createTRPCRouter({
  detectImage: publicProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const { imageUrl } = input;

      const response: Response = await fetch(`${process.env.BACKEND_URL}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const resultData = await response.json() as APIResponse[];
      return resultData;
    }),
});

export const searchRouter = createTRPCRouter({
  searchByKeyword: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      const API_KEY = process.env.GOOGLE_KEY;
      const SEARCH_ENGINE_ID = process.env.GOOGLE_ID; // Replace with your search engine ID

      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(input.query)}&key=${API_KEY}&cx=${SEARCH_ENGINE_ID}`;

      try {
        const response: SearchResponse = await axios.get(url);
        const items: SearchItem[] = response.data.items || [];
        return items.map((item) => ({
          link: item.link,
          title: item.title,
          snippet: item.snippet,
        }));
      } catch (error) {
        console.error("Error during search:", error);
        return [];
      }
    }),
});
