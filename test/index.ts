import UnityWebRequest from "../src";

Il2Cpp.perform(() => {
    setTimeout(async () => {
        // Get tests
        await test("Get", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/anything");
            assertEq(200, response.responseCode);
            assertEq("https://httpbin.org/anything", response.url);
            response.dispose();
        });
        await test("Get 404", async () => {
            try {
                await UnityWebRequest.sendGet("https://httpbin.org/status/404");
                (globalThis as any).console.error("Unreachable!");
            } catch (_) {}
        });
        await test("Get with custom headers", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/anything", { "X-Test": "test", "X-Test2": "test2" });
            assertEq(200, response.responseCode);
            assertEq("test", response.json.headers["X-Test"]);
            assertEq("test2", response.json.headers["X-Test2"]);
            response.dispose();
        });
        await test("Get deflated data", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/deflate");
            assertEq(true, response.json.deflated);
            response.dispose();
        });
        await test("Get gzipped data", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/gzip");
            assertEq(true, response.json.gzipped);
            response.dispose();
        });
        await test("Get delayed request", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/delay/2");
            assertEq(200, response.responseCode);
            response.dispose();
        });
        await test("Multiple Get delayed requests", async () => {
            const requests = await Promise.all([
                UnityWebRequest.sendGet("https://httpbin.org/delay/2"),
                UnityWebRequest.sendGet("https://httpbin.org/delay/2"),
                UnityWebRequest.sendGet("https://httpbin.org/delay/2")
            ]);
            requests.forEach(req => {
                assertEq(200, req.responseCode);
                req.dispose();
            });
        });
        await test("Get redirect", async () => {
            const response = await UnityWebRequest.sendGet("https://httpbin.org/redirect-to?url=https%3A%2F%2Fhttpbin.org%2Fanything&status_code=302");
            assertEq(200, response.responseCode);
            response.dispose();
        });
        await test("Get 404 redirect", async () => {
            try {
                await UnityWebRequest.sendGet("https://httpbin.org/redirect-to?url=https%3A%2F%2Fhttpbin.org%2Fstatus%2F404&status_code=302");
                (globalThis as any).console.error("Unreachable!");
            } catch (_) {}
        });

        // Post tests
        await test("Post", async () => {
            const response = await UnityWebRequest.sendPost("https://httpbin.org/anything", { hello: "world" });
            assertEq(200, response.responseCode);
            assertEq("world", response.json.form.hello);
            response.dispose();
        });
        await test("Post 404", async () => {
            try {
                await UnityWebRequest.sendPost("https://httpbin.org/status/404", { hello: "world" });
                (globalThis as any).console.error("Unreachable!");
            } catch (_) {}
        });
        await test("Post with objects in data", async () => {
            const form = {
                hello: "world",
                foo: { bar: ["baz", 1337] },
                baz: [{ a: ["b", 1, "c"] }]
            };
            const response = await UnityWebRequest.sendPost("https://httpbin.org/anything", form);
            assertEq(200, response.responseCode);
            assertEq(JSON.stringify(form), response.json.data);
            response.dispose();
        });
        await test("Post with custom headers", async () => {
            const response = await UnityWebRequest.sendPost("https://httpbin.org/anything", { hello: "world" }, { "X-Test": "test", "X-Test2": "test2" });
            assertEq(200, response.responseCode);
            assertEq("world", response.json.form.hello);
            assertEq("test", response.json.headers["X-Test"]);
            assertEq("test2", response.json.headers["X-Test2"]);
            response.dispose();
        });
        await test("Post delayed request", async () => {
            const response = await UnityWebRequest.sendPost("https://httpbin.org/delay/2", { hello: "world" });
            assertEq(200, response.responseCode);
            assertEq("world", response.json.form.hello);
            response.dispose();
        });
        await test("Multiple Post delayed requests", async () => {
            const requests = await Promise.all([
                UnityWebRequest.sendPost("https://httpbin.org/delay/2", { hello: "world" }),
                UnityWebRequest.sendPost("https://httpbin.org/delay/2", { hello: "world" }),
                UnityWebRequest.sendPost("https://httpbin.org/delay/2", { hello: "world" })
            ]);
            requests.forEach(req => {
                assertEq(200, req.responseCode);
                assertEq("world", req.json.form.hello);
                req.dispose();
            });
        });

        (globalThis as any).console.log(`Summary: \x1B[32m${results.passed} \u2714\x1B[0m \x1B[31m${results.failed} \u2718\x1B[0m`);
    }, 500);
});

const results = { passed: 0, failed: 0 };

async function test(name: string, block: () => Promise<void>) {
    const now = Date.now();

    try {
        await block();
        const elapsed = Date.now() - now;
        (globalThis as any).console.log(`\x1B[32mDone ${name} in ${elapsed}ms\x1B[0m`);
        results.passed++;
    } catch (e) {
        const elapsed = Date.now() - now;
        (globalThis as any).console.error(`Failed ${name} in ${elapsed}ms due to ${e}`);
        results.failed++;
    }
}

function assertEq<T>(expected: T, actual: T) {
    if (expected != actual) throw new Error(`Expected: ${expected}, actual: ${actual}`);
}
