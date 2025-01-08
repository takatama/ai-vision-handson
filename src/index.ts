interface Env {
	ASSETS: Fetcher;
	AI: Ai;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api/analyze")) {
			if (request.method !== "POST") {
				return new Response("Method Not Allowed", { status: 405 });
			}
			try {
				// リクエストから画像データとプロンプトを取得
				const requestData = await request.json() as { image: string; prompt: string };
				const { image, prompt } = requestData;

				if (!image || !prompt) {
					return new Response("Invalid input: Image and prompt are required", {
						status: 400,
					});
				}

				// 画像データをUint8Arrayに変換
				const base64Data = image.split(",")[1]; // "data:image/png;base64,..." の形式を想定
				const binaryData = Uint8Array.from(atob(base64Data), char =>
					char.charCodeAt(0)
				);

				// AI呼び出し用の入力データを準備
				const input = {
					image: [...binaryData],
					prompt: prompt,
					max_tokens: 512,
				};

				// AIモデルを実行
				const response = await env.AI.run(
					"@cf/llava-hf/llava-1.5-7b-hf",
					input
				);

				// AIの応答を返す
				return new Response(JSON.stringify(response), {
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				console.error("Error processing request:", error);
				return new Response("Internal Server Error", { status: 500 });
			}
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
