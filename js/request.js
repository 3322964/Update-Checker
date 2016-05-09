class Request {
    constructor(element, link, type) {
        this.element = element;
        this.file    = new XMLHttpRequest();
        this.file.open(type, link, true);
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
        super(element, link, 'GET');
        this.file.setRequestHeader('Pragma', 'no-cache');
        this.file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    }
}

class PostRequest extends Request {
    constructor(element, link) {
        super(element, link, 'POST');
        this.file.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
}
