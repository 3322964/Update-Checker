class Request {
    constructor(element, method, link) {
        this.element = element;
        this.file    = new XMLHttpRequest();
        this.file.open(method, link, true);
    };
    send(onDone, data) {
        this.element.classList.add('loading');
        this.file.onreadystatechange = () => {
            if (this.file.readyState == XMLHttpRequest.DONE) {
                this.element.classList.remove('loading');
                onDone(this.file.status == 200, this.file.responseText);
            }
        };
        this.file.send(data);
    }
    abort() {
        this.file.onreadystatechange = null;
        this.file.abort();
        this.element.classList.remove('loading');
    }
}

class GetRequest extends Request {
    constructor(element, link) {
        super(element, 'GET', link);
        this.file.setRequestHeader('Pragma', 'no-cache');
        this.file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    }
}

class PostRequest extends Request {
    constructor(element, link) {
        super(element, 'POST', link);
        this.file.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
}
