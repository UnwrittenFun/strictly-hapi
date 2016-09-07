import test from 'ava';
import { Server, IServerInjectOptions, IServerInjectResponse } from 'hapi';
import { bootstrapHapi } from './hapi';
import { Get } from '../decorators/route';
import { AssertContext } from 'ava';

let server: Server;

test.before.cb(t => {
    server = new Server();
    server.connection({
        port: 3000
    });

    class RootView {
        @Get("text")
        text() {
            return "Hello, world";
        }

        @Get("json")
        json() {
            return {
                isJson: true,
                message: "Hello, world",
            };
        }
    }

    bootstrapHapi(server, new RootView());

    server.start(err => {
        if (err) {
            throw err;
        }

        console.log(`Server running at: ${server.info.uri}`);
        t.end();
    })
});

test("text responses work", t => {
    return http(t, server)
        .get("/text")
        .text()
        .ok("Hello, world")
        .run();
});

test("json responses work", t => {
    return http(t, server)
        .get("/json")
        .json()
        .ok({ isJson: true, message: "Hello, world" })
        .run();
});

function http(t: AssertContext, server: Server) {
    return new HttpRunner(t, server);
}

class HttpRunner {
    options: IServerInjectOptions = {} as any;
    parser = res => res;
    expectedType: "text" | "json" = "text";
    handler: (res: IServerInjectResponse, parsed: any) => void;

    constructor(private t: AssertContext, private server: Server) {
    }

    request(method: string, url: string): this {
        this.options.method = method;
        this.options.url = url;
        return this;
    }

    get(url: string): this {
        return this.request("GET", url);
    }

    put(url: string): this {
        return this.request("PUT", url);
    }

    post(url: string): this {
        return this.request("POST", url);
    }

    patch(url: string): this {
        return this.request("PATCH", url);
    }

    delete(url: string): this {
        return this.request("DELETE", url);
    }

    text(): this {
        this.expectedType = "text";
        this.parser = res => res.payload;
        return this;
    }

    json(): this {
        this.expectedType = "json";
        this.parser = res => JSON.parse(res.payload);
        return this;
    }

    ok(expected: any): this {
        this.handler = (res, parsed) => {
            this.t.true(res.statusCode >= 200 && res.statusCode < 300);
            switch (this.expectedType) {
                case "json":
                    this.t.deepEqual(parsed, expected);
                    break;
                case "text":
                    this.t.is(parsed, expected);
                    break;
            }
        };
        return this;
    }

    run(): Promise<void> {
        return server.inject(this.options)
            .then(res => {
                return this.handler(res, this.parser(res));
            }) as any;
    }
}
