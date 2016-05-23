class RSSParser {
    constructor(stringToParse, previousDate) {
        this._errorOccurred = false;
        try {
            let xml     = (new DOMParser()).parseFromString(stringToParse, 'text/xml');
            let type    = xml.evaluate(RSSParser.xPathType, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            this._title = xml.evaluate(RSSParser.xPathTitle, type, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            this._link  = xml.evaluate(RSSParser.xPathLink[type.localName], type, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            this.items  = xml.evaluate(RSSParser.xPathItems[type.localName], type, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (previousDate === '')
                this._newItemCount = this.items.snapshotLength;
            else {
                let length = this.items.snapshotLength;
                let date   = moment(new Date(previousDate));
                if (!date.isValid())
                    for (this._newItemCount = 0; this._newItemCount !== length && this.items.snapshotItem(this._newItemCount).textContent !== previousDate; this._newItemCount++) ;
                else {
                    let item, itemDate;
                    for (this._newItemCount = 0; this._newItemCount !== length; this._newItemCount++) {
                        item     = this.items.snapshotItem(this._newItemCount).textContent;
                        itemDate = moment(new Date(item));
                        if (!itemDate.isValid()) {
                            if (item === previousDate)
                                break;
                        }
                        else if (!itemDate.isAfter(date))
                            break;
                    }
                }
            }
            if (this._newItemCount !== 0)
                this._newDate = this.items.snapshotItem(0).textContent;
        }
        catch (err) {
            this._errorOccurred = true;
        }
    }
    get errorOccurred() { return this._errorOccurred; }
    get title()         { return this._title;         }
    get link()          { return this._link;          }
    get newItemCount()  { return this._newItemCount;  }
    get newDate()       { return this._newDate;       }
}

RSSParser.xPathType  = '*[local-name()=\'rss\']/*[local-name()=\'channel\'] | *[local-name()=\'feed\']';
RSSParser.xPathTitle = '*[local-name()=\'title\']/text()';
RSSParser.xPathLink  = { channel: '*[local-name()=\'link\']/text()', feed: '*[local-name()=\'link\']/@href' };
RSSParser.xPathItems = { channel: '*[local-name()=\'item\']/*[local-name()=\'pubDate\' or local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()', feed: '*[local-name()=\'entry\']/*[local-name()=\'updated\']/text() | *[local-name()=\'entry\']/*[local-name()=\'link\' and not(../*[local-name()=\'updated\'])]/@href' };
