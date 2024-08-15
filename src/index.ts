import "frida-il2cpp-bridge";
import getter from "./getter";
import lazy from "./lazy";

type PostBody = string | Record<string, string | Object>;
type SendResult = Omit<UnityWebRequest, "sendGet" | "sendPost" | "get" | "post" | "sendWebRequest" | keyof Il2Cpp.Object>;

/**
 * Wrapper over `UnityWebRequest`
 *
 * @export
 * @class UnityWebRequest
 */
export default class UnityWebRequest extends Il2Cpp.Object {
    /** @internal */
    static UnityWebRequestModule: Il2Cpp.Image;
    /** @internal */
    static UnityWebRequest: Il2Cpp.Class;
    /** @internal */
    static UploadHandlerRaw: Il2Cpp.Class;
    /** @internal */
    static DownloadHandlerBuffer: Il2Cpp.Class;
    /** @internal */
    static WWWForm: Il2Cpp.Class;
    /** @internal */
    static InflatedAction: Il2Cpp.Class;

    /** Gets error message if request failed */
    get error(): string {
        return this.method<Il2Cpp.String>("get_error").invoke().content!;
    }

    /** Gets url of the request */
    get url(): string {
        return this.method<Il2Cpp.String>("get_url").invoke().content!;
    }

    /** Sets url of the request */
    set url(url: string) {
        this.method("set_url").invoke(Il2Cpp.string(url));
    }

    /** Gets response code */
    get responseCode(): number {
        return this.method<number>("get_responseCode").invoke();
    }

    /** Gets whether the request can be modified */
    get isModifiable(): boolean {
        return this.method<boolean>("get_isModifiable").invoke();
    }

    /** Gets whether the request is done */
    get isDone(): boolean {
        return this.method<boolean>("get_isDone").invoke();
    }

    /**
     * Gets whether the request resulted in an error
     *
     * @unsafe This method might be not available on some unity versions
     */
    get isNetworkError(): boolean {
        return this.method<boolean>("get_isNetworkError").invoke();
    }

    /**
     * Gets whether the request resulted in an HTTP error
     *
     * @unsafe This method might be not available on some unity versions
     */
    get isHttpError(): boolean {
        return this.method<boolean>("get_isHttpError").invoke();
    }

    /** Sets whether to use chunked transfer encoding */
    set chunkedTransfer(chunkedTransfer: boolean) {
        this.method("set_chunkedTransfer").invoke(chunkedTransfer);
    }

    /** Gets the upload handler */
    get uploadHandler(): Il2Cpp.Object {
        return this.method<Il2Cpp.Object>("get_uploadHandler").invoke();
    }

    /** Sets the upload handler */
    set uploadHandler(uploadHandler: Il2Cpp.Object) {
        this.method("set_uploadHandler").invoke(uploadHandler);
    }

    /** Gets the download handler */
    get downloadHandler(): Il2Cpp.Object {
        return this.method<Il2Cpp.Object>("get_downloadHandler").invoke();
    }

    /** Sets the download handler */
    set downloadHandler(downloadHandler: Il2Cpp.Object) {
        this.method("set_downloadHandler").invoke(downloadHandler);
    }

    /** Gets the certificate handler */
    get certificateHandler(): Il2Cpp.Object {
        return this.method<Il2Cpp.Object>("get_certificateHandler").invoke();
    }

    /** Gets the bytes of the request */
    get data(): number[] {
        const array = this.downloadHandler.method<Il2Cpp.Array<number>>("get_data").invoke();
        const bytes = [];
        for (let i = 0; i < array.length; i++) {
            bytes.push(array.get(i));
        }
        return bytes;
    }

    /** Gets the text of the request */
    get text(): string {
        return this.downloadHandler.method<Il2Cpp.String>("get_text").invoke().content!;
    }

    /** Gets the json content of the request */
    get json(): Record<string, any> {
        return JSON.parse(this.text);
    }

    /** Sets the request header */
    setRequestHeader(name: string, value: string) {
        this.method("SetRequestHeader").invoke(Il2Cpp.string(name), Il2Cpp.string(value));
    }

    /** Gets the response header by name */
    getResponseHeader(name: string): string {
        return this.method<Il2Cpp.String>("GetResponseHeader").invoke(Il2Cpp.string(name)).content!;
    }

    /** Gets the response header keys array */
    getResponseHeaderKeys(): string[] {
        const array = this.method<Il2Cpp.Array<Il2Cpp.String>>("GetResponseHeaderKeys").invoke();
        const keys = [];
        for (let i = 0; i < array.length; i++) {
            keys.push(array.get(i).content!);
        }
        return keys;
    }

    /** Gets the response headers */
    getResponseHeaders(): Record<string, string> {
        // Well, there's `GetResponseHeaders` but I don't really know how to convert `Il2Cpp.Object` to `Record<string, string>`
        const keys = this.getResponseHeaderKeys();
        const headers: Record<string, string> = {};
        for (const k of keys) {
            headers[k] = this.method<Il2Cpp.String>("GetResponseHeader").invoke(Il2Cpp.string(k)).content!;
        }
        return headers;
    }

    /** Disposes the request */
    dispose() {
        this.method("Dispose").invoke();
    }

    /** Sends the request and awaits until it's done */
    async sendWebRequest(): Promise<UnityWebRequest> {
        return new Promise(resolve => {
            const operation = this.method<Il2Cpp.Object>("SendWebRequest").invoke();
            operation.field<Il2Cpp.Object>("m_completeCallback").value = Il2Cpp.delegate(UnityWebRequest.InflatedAction, () => resolve(this));
        });
    }

    /** Initializes the Get method for given url */
    static get(url: string, headers?: Record<string, string>): UnityWebRequest {
        const request = new UnityWebRequest(this.UnityWebRequest.method<Il2Cpp.Object>("Get").invoke(Il2Cpp.string(url)));

        if (headers) {
            for (const [k, v] of Object.entries(headers)) {
                request.setRequestHeader(k, v);
            }
        }
        return request;
    }

    /** Initializes the Post method for given url */
    static post(url: string, body: PostBody, headers?: Record<string, string>): UnityWebRequest {
        const Post = this.UnityWebRequest.method<Il2Cpp.Object>("Post");

        const stringOverload = Post.tryOverload("System.String", "System.String");
        const dataIsStringOrHaveObjects = typeof body === "string" || Object.values(body).some(_ => typeof _ !== "string");

        let request: UnityWebRequest;

        if (dataIsStringOrHaveObjects) {
            const payload = Il2Cpp.string(typeof body === "string" ? body : JSON.stringify(body));

            if (stringOverload) request = new UnityWebRequest(stringOverload.invoke(Il2Cpp.string(url), payload));
            else {
                const utf8 = Il2Cpp.corlib.class("System.Text.Encoding").field<Il2Cpp.Object>("utf8Encoding").value;
                const bytes = utf8.method<Il2Cpp.Array<Il2Cpp.Object>>("GetBytes").overload("System.String").invoke(payload);

                request = new UnityWebRequest(this.UnityWebRequest.alloc());
                request.method(".ctor", 2).invoke(Il2Cpp.string(url), Il2Cpp.string("POST"));

                const uploadHandler = this.UploadHandlerRaw.alloc();
                uploadHandler.method(".ctor").invoke(bytes);
                request.uploadHandler = uploadHandler;

                request.downloadHandler = this.DownloadHandlerBuffer.new();
            }
        } else {
            const form = this.WWWForm.new();
            const addField = form.method("AddField", 2);

            for (const [k, v] of Object.entries(body)) {
                addField.invoke(Il2Cpp.string(k), Il2Cpp.string(v as string));
            }
            request = new UnityWebRequest(Post.overload("System.String", "UnityEngine.WWWForm").invoke(Il2Cpp.string(url), form));
        }

        if (headers) {
            const setRequestHeader = request.method("SetRequestHeader");

            for (const [k, v] of Object.entries(headers)) {
                setRequestHeader.invoke(Il2Cpp.string(k), Il2Cpp.string(v));
            }
        }

        return request;
    }

    /**
     * Gets the content of the request using GET method
     *
     * Throws error if response code is not 200
     */
    static async sendGet(url: string, headers?: Record<string, string>): Promise<SendResult> {
        const request = UnityWebRequest.get(url, headers);
        const result = await request.sendWebRequest();

        if (result.responseCode != 200) {
            const error = request.error;
            const content = result.text;
            request.dispose();
            throw new Error(`Failed to invoke Get request on ${url}, \
error: ${error}, \
${content ? `response: ${content}` : ``}`);
        }
        return result;
    }

    /**
     * Gets the content of the request using POST method
     *
     * Throws error if response code is not 200
     */
    static async sendPost(url: string, body: PostBody, headers?: Record<string, string>): Promise<SendResult> {
        const request = UnityWebRequest.post(url, body, headers);
        const result = await request.sendWebRequest();

        if (result.responseCode != 200) {
            const error = request.error;
            const content = result.text;
            request.dispose();
            throw new Error(`Failed to invoke Post request on ${url}, \
error: ${error}, \
${content ? `response: ${content}` : ``}`);
        }
        return result;
    }
}

getter(UnityWebRequest, "UnityWebRequestModule", () => Il2Cpp.domain.assembly("UnityEngine.UnityWebRequestModule").image, lazy);
getter(UnityWebRequest, "UnityWebRequest", () => UnityWebRequest.UnityWebRequestModule.class("UnityEngine.Networking.UnityWebRequest"), lazy);
getter(UnityWebRequest, "UploadHandlerRaw", () => UnityWebRequest.UnityWebRequestModule.class("UnityEngine.Networking.UploadHandlerRaw"), lazy);
getter(UnityWebRequest, "DownloadHandlerBuffer", () => UnityWebRequest.UnityWebRequestModule.class("UnityEngine.Networking.DownloadHandlerBuffer"), lazy);
getter(UnityWebRequest, "WWWForm", () => UnityWebRequest.UnityWebRequestModule.class("UnityEngine.WWWForm"), lazy);
getter(
    UnityWebRequest,
    "InflatedAction",
    () => Il2Cpp.corlib.class("System.Action`1").inflate(Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.AsyncOperation")),
    lazy
);
