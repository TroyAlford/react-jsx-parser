import * as path from 'path';

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
		switch (url.pathname) {
			case '/':
				return new Response(
					await Bun.file(path.resolve(__dirname, './index.html')).text(), 
					{ headers: { 'Content-Type': 'text/html' } },
				);
			case '/demo.min.js':
				const build = await Bun.build({
					entrypoints: [path.resolve(__dirname, './demo.tsx')],
					minify: true,
					target: 'browser',
				});
				if (!build.success) {
					const errorMessages = build.logs
						.filter(log => log.level === "error")
						.map(log => log.message)
						.join("\n");
        
	        console.error("Build failed:", errorMessages);
        
					return new Response(`Build failed:\n${errorMessages}`, { 
						status: 500,
						headers: { "Content-Type": "text/plain" }
					});
				}
				return new Response(
					build.outputs[0],
					{ headers: { 'Content-Type': 'application/javascript' } },
				);
			default:
				return new Response('Not Found', { status: 404 });
		}
	}
});

console.log(`Listening on http://localhost:${server.port}`);