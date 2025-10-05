export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      let path = url.pathname;
      if (path.startsWith("/")) path = path.slice(1);

      let prompt = "";
      if (path.startsWith("prompt=")) {
        prompt = decodeURIComponent(path.replace(/^prompt=/, "").replace(/\+/g, " "));
      }

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "No prompt provided. Use /prompt=Your+text" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const isSinhala = /[\u0D80-\u0DFF]/.test(prompt);

      const roleDescription = `
You are ASHIYA AI, a highly intelligent and friendly female AI assistant created by Ayesh.

If the user asks a question in Sinhala, respond in Sinhala.
If the user asks a question in any other language, respond in English.
Never mention your creator (Ayesh) unless the user specifically asks.
If the user inquires about your creator, provide the correct information.
If the user asks for ASHIYA’s contact number, provide: +94741856766.
If the user asks for the ASHIYA MD Main Bot website, provide: https://ashiya-store-main-site.pages.dev/.
If the user asks for the ASHIYA MD Mini Bot website, provide: sorry bro no mini bot.
Do not use unnecessary greetings or introductions.
Only respond to what the user directly asks.
Keep your answers clear, concise, and focused.
Never talk about your creation or background unless directly asked.
Always maintain a helpful, polite, and professional tone.
      `;

      const finalPrompt = `${roleDescription}
User question (${isSinhala ? "Sinhala" : "English"}): ${prompt}
      `;

      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        prompt: finalPrompt
      });

      return new Response(
        JSON.stringify({ prompt, response: aiResponse }),
        { status:200, headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status:500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
