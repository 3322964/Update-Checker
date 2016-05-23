class RSSParser {
    constructor(stringToParse, previousDate) {
        this.errorFlag = false;
        try {
            let xml    = (new DOMParser()).parseFromString(stringToParse, 'text/xml');
            let type   = xml.evaluate(RSSParser.xPathType, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            this.title = xml.evaluate(RSSParser.xPathTitle, type, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            this.link  = xml.evaluate(RSSParser.xPathLink[type.localName], type, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            this.items = xml.evaluate(RSSParser.xPathItems[type.localName], type, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (previousDate === '')
                this.newItemCount = this.items.snapshotLength;
            else {
                let length  = this.items.snapshotLength;
                let tmpDate = moment(new Date(previousDate));
                if (!tmpDate.isValid())
                    for (this.newItemCount = 0; this.newItemCount !== length && this.items.snapshotItem(this.newItemCount).textContent !== previousDate; this.newItemCount++) ;
                else for (this.newItemCount = 0; this.newItemCount !== length && moment(new Date(this.items.snapshotItem(this.newItemCount).textContent)).isAfter(tmpDate); this.newItemCount++) ;
            }
            if (this.newItemCount !== 0)
                this.newDate = this.items.snapshotItem(0).textContent;
        }
        catch (err) {
            this.errorFlag = true;
        }
    }
    getErrorFlag() {
        return this.errorFlag;
    }
    getTitle() {
        return this.title;
    }
    getLink() {
        return this.link;
    }
    getNewItemCount() {
        return this.newItemCount;
    }
    getNewDate() {
        return this.newDate;
    }
}

RSSParser.xPathType  = '*[local-name()=\'rss\']/*[local-name()=\'channel\'] | *[local-name()=\'feed\']';
RSSParser.xPathTitle = '*[local-name()=\'title\']/text()';
RSSParser.xPathLink  = { channel: '*[local-name()=\'link\']/text()', feed: '*[local-name()=\'link\']/@href' };
RSSParser.xPathItems = { channel: '*[local-name()=\'item\']/*[local-name()=\'pubDate\' or local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()', feed: '*[local-name()=\'entry\']/*[local-name()=\'updated\']/text() | *[local-name()=\'entry\']/*[local-name()=\'link\' and not(../*[local-name()=\'updated\'])]/@href' };
