class Request {
    constructor() {
        this.file = new XMLHttpRequest();
    };
    send(onDone) {
        this.file.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE)
                onDone(this.status == 200, this.responseText);
        };
    }
    abort() {
        this.file.onreadystatechange = null;
        this.file.abort();
    }
}

class GetRequest extends Request {
    constructor(link) {
        super();
        this.file.open('GET', link, true);
        this.file.setRequestHeader('Pragma', 'no-cache');
        this.file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    }
    send(onDone) {
        super.send(onDone);
        this.file.send();
    }
}

class PostRequest extends Request {
    constructor(link) {
        super();
        this.file.open('POST', 'http://www.blu-ray.com/search/quicksearch.php', true);
        this.file.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    send(onDone, data) {
        super.send(onDone);
        this.file.send(data);
    }
}
